"use client";

import { useState, type FocusEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type UseFormWatch,
  type UseFormSetValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Truck } from "lucide-react";

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
  useCreateDomesticPricing,
  useUpdateDomesticPricing,
} from "@/lib/query/hooks/use-domestic-pricing";
import { useSetPopularRoute } from "@/lib/query/hooks/use-pricing";
import { PRICING_TYPE_LABELS, type DomesticPricing } from "@/types/pricing";
import {
  DOMESTIC_COUNTRIES,
  STATES_BY_COUNTRY,
  citiesForState,
  countryForState,
} from "@/lib/geo";

const tierSchema = z
  .object({
    minWeight: z.number({ message: "Required" }).min(0, "Min ≥ 0"),
    maxWeight: z.number({ message: "Required" }),
    ratePerKg: z.number({ message: "Required" }).gt(0, "Rate must be > 0"),
  })
  .refine((t) => t.maxWeight > t.minWeight, {
    message: "Max must be greater than min",
    path: ["maxWeight"],
  });

const schema = z.object({
  fromState: z.string().min(1, "Required"),
  fromCity: z.string().min(1, "Required"),
  toWhereState: z.string().min(1, "Required"),
  toWhereCity: z.string().min(1, "Required"),
  tiers: z
    .array(tierSchema)
    .min(1, "Add at least one weight tier")
    // Ranges must be ascending and non-overlapping: each range must start
    // strictly above the previous range's max (no equal or lower ranges).
    .superRefine((tiers, ctx) => {
      for (let i = 1; i < tiers.length; i++) {
        const prevMax = tiers[i - 1]?.maxWeight;
        const currMin = tiers[i]?.minWeight;
        if (
          Number.isFinite(prevMax) &&
          Number.isFinite(currMin) &&
          currMin <= prevMax
        ) {
          ctx.addIssue({
            code: "custom",
            path: [i, "minWeight"],
            message: `Must be greater than the previous range's max (${prevMax})`,
          });
        }
      }
    }),
});

type FormValues = z.infer<typeof schema>;

const EMPTY_TIER = { minWeight: 0, maxWeight: 0, ratePerKg: 0 };

export function DomesticPricingForm({ initial }: { initial?: DomesticPricing }) {
  const router = useRouter();
  const create = useCreateDomesticPricing();
  const update = useUpdateDomesticPricing(initial?.id ?? "");
  const setPopular = useSetPopularRoute();
  const pending = create.isPending || update.isPending;

  const [isPopular, setIsPopular] = useState(initial?.isPopularRoute ?? false);
  // Client-only country scoping the From/To state options (not a backend field).
  const [country, setCountry] = useState<string>(
    () => countryForState(initial?.fromState) ?? DOMESTIC_COUNTRIES[0],
  );

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fromState: initial?.fromState ?? "",
      fromCity: initial?.fromCity ?? "",
      toWhereState: initial?.toWhereState ?? "",
      toWhereCity: initial?.toWhereCity ?? "",
      tiers: initial?.brackets.length
        ? initial.brackets.map((b) => ({
            minWeight: b.minWeight,
            maxWeight: b.maxWeight,
            ratePerKg: b.ratePerKg,
          }))
        : [EMPTY_TIER],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "tiers" });

  // Highlight the current value on focus so typing replaces the prefilled 0
  // instead of appending to it.
  const selectOnFocus = (e: FocusEvent<HTMLInputElement>) => e.currentTarget.select();
  // Weights/rates can't be negative — block the sign/exponent keys.
  const blockNegativeKeys = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
  };

  const stateOptions = STATES_BY_COUNTRY[country] ?? [];

  const onTogglePopular = (val: boolean) => {
    setIsPopular(val);
    if (initial) setPopular.mutate({ id: initial.id, isPopularRoute: val });
  };

  // Switching to International in create mode routes to the existing form.
  const onTypeChange = (val: string) => {
    if (val === "INTERNATIONAL") router.push("/pricing/new");
  };

  const onCountryChange = (c: string) => {
    setCountry(c);
    setValue("fromState", "");
    setValue("fromCity", "");
    setValue("toWhereState", "");
    setValue("toWhereCity", "");
  };

  const onSubmit = (values: FormValues) => {
    const body = {
      shipmentType: "DOMESTIC" as const,
      fromState: values.fromState,
      fromCity: values.fromCity,
      toWhereState: values.toWhereState,
      toWhereCity: values.toWhereCity,
      pricingBrackets: values.tiers.map((t) => ({
        minWeight: t.minWeight,
        maxWeight: t.maxWeight,
        ratePerKg: t.ratePerKg,
      })),
    };

    if (initial) {
      update.mutate(body, { onSuccess: () => router.push("/pricing?tab=domestic") });
      return;
    }
    create.mutate(body, {
      onSuccess: async (created) => {
        if (isPopular && created?.id) {
          await setPopular
            .mutateAsync({ id: created.id, isPopularRoute: true })
            .catch(() => {});
        }
        router.push("/pricing?tab=domestic");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card className="gap-6 p-6">
        {/* Header: shipment type + popular */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Select
            value="DOMESTIC"
            onValueChange={(v) => onTypeChange(v as string)}
            disabled={Boolean(initial)}
          >
            <SelectTrigger className="h-9 w-auto rounded-md bg-indigo-50 font-medium text-indigo-700">
              <SelectValue>
                {(v) => `${PRICING_TYPE_LABELS[v as "DOMESTIC"]} Shipping`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DOMESTIC">Domestic Shipping</SelectItem>
              <SelectItem value="INTERNATIONAL">International Shipping</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Switch
              checked={isPopular}
              onCheckedChange={onTogglePopular}
              disabled={setPopular.isPending}
            />
            <span className="text-sm font-medium text-foreground">Popular Route</span>
          </div>
        </div>

        {/* Add Location */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Add Location</h3>

          {DOMESTIC_COUNTRIES.length > 1 && (
            <div className="rounded-lg bg-secondary/50 p-3">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Country
              </Label>
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
            <div className="grid grid-cols-2 gap-3">
              <StateField
                label="From (State)"
                stateName="fromState"
                cityName="fromCity"
                options={stateOptions}
                control={control}
                setValue={setValue}
                error={errors.fromState?.message}
              />
              <CityField
                label="From (City)"
                name="fromCity"
                watch={watch}
                stateName="fromState"
                control={control}
                error={errors.fromCity?.message}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StateField
                label="To (State)"
                stateName="toWhereState"
                cityName="toWhereCity"
                options={stateOptions}
                control={control}
                setValue={setValue}
                error={errors.toWhereState?.message}
              />
              <CityField
                label="To (City)"
                name="toWhereCity"
                watch={watch}
                stateName="toWhereState"
                control={control}
                error={errors.toWhereCity?.message}
              />
            </div>
          </div>
        </div>

        {/* Weight tiers */}
        <div className="space-y-3">
          {fields.map((field, i) => (
            <div key={field.id} className="grid items-start gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm font-semibold text-foreground">Weight range (kg)</Label>
                <div className="mt-1 flex items-center gap-2 rounded-lg bg-secondary/50 p-3">
                  <Input
                    type="number"
                    step="any"
                    min={0}
                    onFocus={selectOnFocus}
                    onKeyDown={blockNegativeKeys}
                    className="h-8 w-full border-0 bg-transparent px-0 font-semibold shadow-none focus-visible:ring-0"
                    placeholder="0"
                    {...register(`tiers.${i}.minWeight`, { valueAsNumber: true })}
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="number"
                    step="any"
                    min={0}
                    onFocus={selectOnFocus}
                    onKeyDown={blockNegativeKeys}
                    className="h-8 w-full border-0 bg-transparent px-0 font-semibold shadow-none focus-visible:ring-0"
                    placeholder="0"
                    {...register(`tiers.${i}.maxWeight`, { valueAsNumber: true })}
                  />
                  <span className="whitespace-nowrap text-xs text-muted-foreground">kg</span>
                </div>
                {(errors.tiers?.[i]?.minWeight || errors.tiers?.[i]?.maxWeight) && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.tiers?.[i]?.minWeight?.message ??
                      errors.tiers?.[i]?.maxWeight?.message}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Label className="text-sm font-semibold text-foreground">
                    Road Freight Rates
                  </Label>
                  <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                    <Truck className="size-3.5" /> Road
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      aria-label="Remove tier"
                      className="ml-auto text-muted-foreground transition hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Price
                  </Label>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-sm font-semibold text-foreground">₦</span>
                    <Input
                      type="number"
                      step="any"
                      min={0}
                      onFocus={selectOnFocus}
                      onKeyDown={blockNegativeKeys}
                      className="h-8 w-full border-0 bg-transparent px-0 font-semibold shadow-none focus-visible:ring-0"
                      placeholder="0"
                      {...register(`tiers.${i}.ratePerKg`, { valueAsNumber: true })}
                    />
                    <span className="whitespace-nowrap text-xs text-muted-foreground">/ kg</span>
                  </div>
                  {errors.tiers?.[i]?.ratePerKg && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.tiers?.[i]?.ratePerKg?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {errors.tiers?.root?.message && (
            <p className="text-xs text-destructive">{errors.tiers.root.message}</p>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={() => append(EMPTY_TIER)}
          >
            <Plus className="size-4" /> Add more
          </Button>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="bg-brand-red text-white">
          {pending ? "Saving…" : "Save Price"}
        </Button>
      </div>
    </form>
  );
}

function StateField({
  label,
  stateName,
  cityName,
  options,
  control,
  setValue,
  error,
}: {
  label: string;
  stateName: "fromState" | "toWhereState";
  cityName: "fromCity" | "toWhereCity";
  options: string[];
  control: Control<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  error?: string;
}) {
  return (
    <div className="rounded-lg bg-secondary/50 p-3">
      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Controller
        control={control}
        name={stateName}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={(v) => {
              field.onChange(v);
              // Reset the dependent city so a stale value can't be submitted.
              setValue(cityName, "");
            }}
          >
            <SelectTrigger className="mt-1 h-auto w-full border-0 bg-transparent p-0 text-base font-semibold shadow-none focus-visible:ring-0">
              <SelectValue>{(v) => (v ? (v as string) : "State")}</SelectValue>
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

function CityField({
  label,
  name,
  stateName,
  watch,
  control,
  error,
}: {
  label: string;
  name: "fromCity" | "toWhereCity";
  stateName: "fromState" | "toWhereState";
  watch: UseFormWatch<FormValues>;
  control: Control<FormValues>;
  error?: string;
}) {
  const state = watch(stateName);
  const cities = citiesForState(state);

  return (
    <div className="rounded-lg bg-secondary/50 p-3">
      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) =>
          cities.length > 0 ? (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="mt-1 h-auto w-full border-0 bg-transparent p-0 text-base font-semibold shadow-none focus-visible:ring-0">
                <SelectValue>{(v) => (v ? (v as string) : "City")}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={field.value}
              onChange={field.onChange}
              placeholder="City"
              className="mt-1 h-auto border-0 bg-transparent p-0 text-base font-semibold shadow-none focus-visible:ring-0"
            />
          )
        }
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
