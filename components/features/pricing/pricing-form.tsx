"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plane, Ship, Truck, type LucideIcon } from "lucide-react";

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
  PRICING_TYPE_LABELS,
  PRICING_TYPE_OPTIONS,
  type Pricing,
  type PricingShippingType,
} from "@/types/pricing";

// No backend locations source — preset list (values are submitted as plain strings).
const LOCATIONS = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Kano",
  "Ibadan",
  "Accra",
  "London",
  "Dubai",
  "New York",
  "Guangzhou",
];

const schema = z.object({
  pricingShippingType: z.enum([
    "INTERNATION_SHIPPING",
    "LOCAL_SHIPPING",
    "DOOR_TO_DOOR_SHIPPING",
  ]),
  fromWhere: z.string().min(1, "Required"),
  toWhere: z.string().min(1, "Required"),
  airFreightRate: z.string().min(1, "Required"),
  roadFreightRate: z.string().min(1, "Required"),
  oceanFreightRate: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

type RateName = "airFreightRate" | "oceanFreightRate" | "roadFreightRate";
const RATE_CARDS: { name: RateName; title: string; badge: string; icon: LucideIcon; accent: string }[] =
  [
    { name: "airFreightRate", title: "Air Freight Rates", badge: "Air", icon: Plane, accent: "bg-red-50 text-red-500" },
    { name: "oceanFreightRate", title: "Ocean Freight Rates", badge: "Ocean", icon: Ship, accent: "bg-indigo-50 text-indigo-600" },
    { name: "roadFreightRate", title: "Road Freight Rates", badge: "Road", icon: Truck, accent: "bg-indigo-50 text-indigo-600" },
  ];

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
  // Popular-route flag (separate POST /admin/pricing/popular-route/{id} endpoint).
  const [isPopular, setIsPopular] = useState(initial?.isPopularRoute ?? false);

  const onTogglePopular = (val: boolean) => {
    setIsPopular(val);
    // In edit mode persist immediately; in create mode we send it after creation.
    if (initial) setPopular.mutate({ id: initial.id, isPopularRoute: val });
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      pricingShippingType: initial?.pricingShippingType ?? "INTERNATION_SHIPPING",
      fromWhere: initial?.fromWhere ?? "",
      toWhere: initial?.toWhere ?? "",
      airFreightRate: initial?.airFreightRate ?? "",
      roadFreightRate: initial?.roadFreightRate ?? "",
      oceanFreightRate: initial?.oceanFreightRate ?? "",
    },
  });

  const onSubmit = (values: FormValues) => {
    if (initial) {
      update.mutate(values, { onSuccess: () => router.push("/pricing") });
      return;
    }
    create.mutate(values, {
      onSuccess: async (created) => {
        // Persist the popular-route flag against the newly-created pricing id.
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
        {/* Header: shipping type + active */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Controller
            control={control}
            name="pricingShippingType"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => field.onChange(v as PricingShippingType)}
              >
                <SelectTrigger className="h-9 w-auto rounded-md bg-indigo-50 font-medium text-indigo-700">
                  <SelectValue>{(v) => PRICING_TYPE_LABELS[v as PricingShippingType]}</SelectValue>
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

        {/* Add Location */}
        <div>
          <h3 className="mb-3 text-base font-semibold text-foreground">Add Location</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <LocationField
              label="From Where"
              control={control}
              name="fromWhere"
              error={errors.fromWhere?.message}
            />
            <LocationField
              label="To Where"
              control={control}
              name="toWhere"
              error={errors.toWhere?.message}
            />
          </div>
        </div>

        {/* Freight rate cards */}
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
  name,
  control,
  error,
}: {
  label: string;
  name: "fromWhere" | "toWhere";
  control: import("react-hook-form").Control<FormValues>;
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
              <SelectValue>{(v) => (v ? (v as string) : "Select location")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
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
