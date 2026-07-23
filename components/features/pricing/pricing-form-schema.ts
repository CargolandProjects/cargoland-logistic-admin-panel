import { z } from "zod";

import {
  FREIGHT_TYPES,
  bracketRate,
  type FreightType,
  type InternationalPricingBracket,
} from "@/types/pricing";

// UI shape. A group owns ONE freight type and MANY weight ranges, each with a
// price. Flattened to `pricingBrackets` on submit, re-grouped on load.
// The base schema is intentionally permissive — all meaningful group rules live
// in `superRefine` gated on INTERNATIONAL, so an unused default group can't
// block a DOMESTIC submit.
const rangeSchema = z.object({
  minWeight: z.number({ message: "Required" }).min(0, "Min ≥ 0"),
  maxWeight: z.number({ message: "Required" }),
  price: z.string(),
});

const groupSchema = z.object({
  freightType: z.enum(FREIGHT_TYPES),
  ranges: z.array(rangeSchema),
});

export const pricingFormSchema = z
  .object({
    shipmentType: z.enum(["DOMESTIC", "INTERNATIONAL"]),
    fromWhere: z.string().min(1, "Required"),
    toWhere: z.string().min(1, "Required"),
    // Legacy flat rates — only the DOMESTIC in-form edit path uses these.
    airFreightRate: z.string().optional(),
    roadFreightRate: z.string().optional(),
    oceanFreightRate: z.string().optional(),
    // International freight-type groups.
    freightGroups: z.array(groupSchema),
  })
  .superRefine((v, ctx) => {
    if (v.shipmentType === "DOMESTIC") {
      // Legacy flat-rate rules (untouched behaviour for existing DOMESTIC rows).
      for (const name of ["airFreightRate", "roadFreightRate", "oceanFreightRate"] as const) {
        if (!v[name]?.trim()) {
          ctx.addIssue({ code: "custom", path: [name], message: "Required" });
        }
      }
      return;
    }

    // INTERNATIONAL: an international route can't go from a country to itself.
    if (v.fromWhere && v.toWhere && v.fromWhere === v.toWhere) {
      ctx.addIssue({
        code: "custom",
        path: ["toWhere"],
        message: "From and To must be different",
      });
    }

    // INTERNATIONAL: validate the freight-type groups.
    if (v.freightGroups.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["freightGroups"],
        message: "Add at least one freight type",
      });
      return;
    }

    const seen = new Set<FreightType>();
    v.freightGroups.forEach((g, gi) => {
      // Each freight type may appear in only one group.
      if (seen.has(g.freightType)) {
        ctx.addIssue({
          code: "custom",
          path: ["freightGroups", gi, "freightType"],
          message: "This freight type is already used",
        });
      }
      seen.add(g.freightType);

      if (g.ranges.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["freightGroups", gi, "ranges"],
          message: "Add at least one range",
        });
      }

      g.ranges.forEach((r, ri) => {
        if (
          Number.isFinite(r.minWeight) &&
          Number.isFinite(r.maxWeight) &&
          r.maxWeight <= r.minWeight
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["freightGroups", gi, "ranges", ri, "maxWeight"],
            message: "Max must be greater than min",
          });
        }
        if (!r.price.trim()) {
          ctx.addIssue({
            code: "custom",
            path: ["freightGroups", gi, "ranges", ri, "price"],
            message: "Required",
          });
        } else if (!(Number(r.price) > 0)) {
          ctx.addIssue({
            code: "custom",
            path: ["freightGroups", gi, "ranges", ri, "price"],
            message: "Price must be > 0",
          });
        }
      });

      // Ranges within a freight type must be strictly ascending and
      // non-overlapping: each must start above the previous range's max (same
      // contract and message as the domestic form).
      for (let i = 1; i < g.ranges.length; i++) {
        const prevMax = g.ranges[i - 1]?.maxWeight;
        const currMin = g.ranges[i]?.minWeight;
        if (Number.isFinite(prevMax) && Number.isFinite(currMin) && currMin <= prevMax) {
          ctx.addIssue({
            code: "custom",
            path: ["freightGroups", gi, "ranges", i, "minWeight"],
            message: `Must be greater than the previous range's max (${prevMax})`,
          });
        }
      }
    });
  });

export type PricingFormValues = z.infer<typeof pricingFormSchema>;
export type FreightRange = PricingFormValues["freightGroups"][number]["ranges"][number];
export type FreightGroup = PricingFormValues["freightGroups"][number];

/** Flatten UI groups into the flat wire brackets (price into the matching rate, "0" elsewhere). */
export function toPricingBrackets(groups: FreightGroup[]): InternationalPricingBracket[] {
  return groups.flatMap((g) =>
    g.ranges.map((r) => ({
      minWeight: r.minWeight,
      maxWeight: r.maxWeight,
      freightType: g.freightType,
      airFreightRate: g.freightType === "AIR_FREIGHT" ? String(r.price) : "0",
      oceanFreightRate: g.freightType === "OCEAN_FREIGHT" ? String(r.price) : "0",
      roadFreightRate: g.freightType === "ROAD_FREIGHT" ? String(r.price) : "0",
    })),
  );
}

/** Bucket flat wire brackets back into UI groups (for edit prefill), in freight-type order. */
export function toFreightGroups(brackets: InternationalPricingBracket[]): FreightGroup[] {
  const byType = new Map<FreightType, FreightRange[]>();
  for (const b of brackets) {
    const list = byType.get(b.freightType) ?? [];
    list.push({ minWeight: b.minWeight, maxWeight: b.maxWeight, price: String(bracketRate(b)) });
    byType.set(b.freightType, list);
  }
  return FREIGHT_TYPES.filter((t) => byType.has(t)).map((t) => ({
    freightType: t,
    ranges: byType.get(t)!,
  }));
}
