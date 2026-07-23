"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plane, Ship, Truck, Plus, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreatePricing,
  useUpdatePricing,
  useSetPopularRoute,
} from "@/lib/query/hooks/use-pricing";
import {
  FREIGHT_TYPES,
  PRICING_TYPE_LABELS,
  PRICING_TYPE_OPTIONS,
  type FreightType,
  type Pricing,
  type PricingInput,
  type PricingShipmentType,
} from "@/types/pricing";
import { COUNTRIES, DOMESTIC_COUNTRIES, STATES_BY_COUNTRY, countryForState } from "@/lib/geo";
import {
  pricingFormSchema,
  toFreightGroups,
  toPricingBrackets,
  type PricingFormValues,
} from "./pricing-form-schema";
import { FreightGroupCard } from "./freight-group-card";

type RateName = "airFreightRate" | "oceanFreightRate" | "roadFreightRate";
const RATE_CARDS: { name: RateName; title: string; badge: string; icon: LucideIcon; accent: string }[] =
  [
    { name: "airFreightRate", title: "Air Freight Rates", badge: "Air", icon: Plane, accent: "bg-red-50 text-red-500" },
    { name: "oceanFreightRate", title: "Ocean Freight Rates", badge: "Ocean", icon: Ship, accent: "bg-indigo-50 text-indigo-600" },
    { name: "roadFreightRate", title: "Road Freight Rates", badge: "Road", icon: Truck, accent: "bg-indigo-50 text-indigo-600" },
  ];

const emptyGroup = (freightType: FreightType) => ({
  freightType,
  ranges: [{ minWeight: 0, maxWeight: 0, price: "" }],
});

function formatUpdated(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PricingForm({ initial }: { initial?: Pricing }) {
  const router = useRouter();
  const create = useCreatePricing();
  const update = useUpdatePricing(initial?.id ?? "");
  const setPopular = useSetPopularRoute();
  const pending = create.isPending || update.isPending;
  const [isPopular, setIsPopular] = useState(initial?.isPopularRoute ?? false);
  // Domestic country drives the From/To state options (not a backend field).
  const [country, setCountry] = useState<string>(
    () => countryForState(initial?.fromWhere) ?? DOMESTIC_COUNTRIES[0],
  );

  const onTogglePopular = (val: boolean) => {
    setIsPopular(val);
    if (initial) setPopular.mutate({ id: initial.id, isPopularRoute: val });
  };

  const initialGroups = toFreightGroups(initial?.pricingBrackets ?? []);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PricingFormValues>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues: {
      shipmentType: initial?.shipmentType ?? "INTERNATIONAL",
      fromWhere: initial?.fromWhere ?? "",
      toWhere: initial?.toWhere ?? "",
      airFreightRate: initial?.airFreightRate ?? "",
      roadFreightRate: initial?.roadFreightRate ?? "",
      oceanFreightRate: initial?.oceanFreightRate ?? "",
      freightGroups: initialGroups.length ? initialGroups : [emptyGroup(FREIGHT_TYPES[0])],
    },
  });

  const shipmentType = watch("shipmentType");
  const isDomestic = shipmentType === "DOMESTIC";
  const locationOptions = isDomestic ? STATES_BY_COUNTRY[country] ?? [] : COUNTRIES;

  const {
    fields: groupFields,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({ control, name: "freightGroups" });

  // Watch groups so the freight-type pickers can exclude types used elsewhere
  // and the "Add freight type" button can default to the first unused one.
  const groups = watch("freightGroups") ?? [];
  const usedTypes = groups.map((g) => g.freightType);
  const unusedType = FREIGHT_TYPES.find((t) => !usedTypes.includes(t));

  const onTypeChange = (val: PricingShipmentType) => {
    // Domestic is a distinct backend resource with its own form. In create mode,
    // switching to Domestic routes there; existing rows can't change type.
    if (val === "DOMESTIC" && !initial) {
      router.push("/pricing/new?type=domestic");
      return;
    }
    setValue("shipmentType", val);
    // Reset locations so we don't submit a country where a state is expected.
    setValue("fromWhere", "");
    setValue("toWhere", "");
  };

  const onCountryChange = (c: string) => {
    setCountry(c);
    setValue("fromWhere", "");
    setValue("toWhere", "");
  };

  const onSubmit = (values: PricingFormValues) => {
    const body: PricingInput =
      values.shipmentType === "INTERNATIONAL"
        ? {
            shipmentType: "INTERNATIONAL",
            fromWhere: values.fromWhere,
            toWhere: values.toWhere,
            pricingBrackets: toPricingBrackets(values.freightGroups),
          }
        : {
            shipmentType: "DOMESTIC",
            fromWhere: values.fromWhere,
            toWhere: values.toWhere,
            airFreightRate: values.airFreightRate,
            roadFreightRate: values.roadFreightRate,
            oceanFreightRate: values.oceanFreightRate,
          };

    if (initial) {
      update.mutate(body, { onSuccess: () => router.push("/pricing") });
      return;
    }
    create.mutate(body, {
      onSuccess: async (created) => {
        if (isPopular && created?.id) {
          await setPopular.mutateAsync({ id: created.id, isPopularRoute: true }).catch(() => {});
        }
        router.push("/pricing");
      },
    });
  };

  const updatedLabel = formatUpdated(initial?.updatedAt);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card className="gap-6 p-6">
        {/* Header: shipment type + popular */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Controller
            control={control}
            name="shipmentType"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => onTypeChange(v as PricingShipmentType)}
                disabled={Boolean(initial)}
              >
                <SelectTrigger className="h-9 w-auto rounded-md bg-indigo-50 font-medium text-indigo-700">
                  <SelectValue>
                    {(v) => `${PRICING_TYPE_LABELS[v as PricingShipmentType]} Shipping`}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PRICING_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <div className="flex items-center gap-2">
            <Switch
              checked={isPopular}
              onCheckedChange={onTogglePopular}
              disabled={setPopular.isPending}
            />
            <span className="text-sm font-medium text-foreground">Popular Route</span>
            {updatedLabel && (
              <span className="ml-2 text-xs text-muted-foreground">Updated {updatedLabel}</span>
            )}
          </div>
        </div>

        {/* Add Location (cascades by shipment type) */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Add Location</h3>

          {isDomestic && (
            <div className="rounded-lg bg-secondary/50 p-3">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Country</Label>
              <Select value={country} onValueChange={(v) => onCountryChange(v as string)}>
                <SelectTrigger className="mt-1 h-auto w-full border-0 bg-transparent p-0 text-base font-semibold shadow-none focus-visible:ring-0">
                  <SelectValue>{(v) => (v as string) || "Select country"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {DOMESTIC_COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <LocationField
              label={isDomestic ? "From (State)" : "From Where"}
              placeholder={isDomestic ? "Select state" : "Select country"}
              control={control}
              name="fromWhere"
              options={locationOptions}
              error={errors.fromWhere?.message}
            />
            <LocationField
              label={isDomestic ? "To (State)" : "To Where"}
              placeholder={isDomestic ? "Select state" : "Select country"}
              control={control}
              name="toWhere"
              options={locationOptions}
              error={errors.toWhere?.message}
            />
          </div>
        </div>

        {isDomestic ? (
          /* Legacy flat rate cards (DOMESTIC in-form edit path). */
          <div className="grid gap-4 sm:grid-cols-3">
            {RATE_CARDS.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.name}>
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                        c.accent,
                      )}
                    >
                      <Icon className="size-3.5" /> {c.badge}
                    </span>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Base Rate
                    </Label>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-sm font-semibold text-foreground">₦</span>
                      <Input
                        className="h-8 border-0 bg-transparent px-0 font-semibold shadow-none focus-visible:ring-0"
                        placeholder="0"
                        {...register(c.name)}
                      />
                      <span className="whitespace-nowrap text-xs text-muted-foreground">/ kg</span>
                    </div>
                    {errors[c.name] && (
                      <p className="text-xs text-destructive">{errors[c.name]?.message}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* International: freight-type groups with weight-ranged prices. */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Freight rates by weight</h3>
            </div>

            {groupFields.map((f, gi) => (
              <FreightGroupCard
                key={f.id}
                control={control}
                index={gi}
                canRemove={groupFields.length > 1}
                onRemove={() => removeGroup(gi)}
                otherUsedTypes={usedTypes.filter((_, i) => i !== gi)}
              />
            ))}

            {typeof errors.freightGroups?.message === "string" && (
              <p className="text-xs text-destructive">{errors.freightGroups.message}</p>
            )}

            <Button
              type="button"
              variant="secondary"
              onClick={() => unusedType && appendGroup(emptyGroup(unusedType))}
              disabled={!unusedType}
            >
              <Plus className="size-4" /> Add freight type
            </Button>
          </div>
        )}
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="bg-brand-red text-white">
          {pending ? "Saving…" : "Save Price"}
        </Button>
      </div>
    </form>
  );
}

function LocationField({
  label,
  placeholder,
  name,
  options,
  control,
  error,
}: {
  label: string;
  placeholder: string;
  name: "fromWhere" | "toWhere";
  options: string[];
  control: Control<PricingFormValues>;
  error?: string;
}) {
  return (
    <div className="rounded-lg bg-secondary/50 p-3">
      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="mt-1 h-auto w-full border-0 bg-transparent p-0 text-base font-semibold shadow-none focus-visible:ring-0">
              <SelectValue>{(v) => (v ? (v as string) : placeholder)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
