"use client";

import { type FocusEvent, type KeyboardEvent } from "react";
import {
  Controller,
  useFieldArray,
  useFormState,
  type Control,
} from "react-hook-form";
import { Plus, Trash2, Plane, Ship, Truck, type LucideIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FREIGHT_TYPE_LABELS,
  FREIGHT_TYPE_OPTIONS,
  type FreightType,
} from "@/types/pricing";
import type { PricingFormValues } from "./pricing-form-schema";
import { WeightSelect } from "./weight-select";

const FREIGHT_META: Record<FreightType, { icon: LucideIcon; accent: string; badge: string }> = {
  AIR_FREIGHT: { icon: Plane, accent: "bg-red-50 text-red-500", badge: "Air" },
  OCEAN_FREIGHT: { icon: Ship, accent: "bg-indigo-50 text-indigo-600", badge: "Ocean" },
  ROAD_FREIGHT: { icon: Truck, accent: "bg-indigo-50 text-indigo-600", badge: "Road" },
};

/**
 * One freight-type group: a single freight type and its list of weight ranges.
 * Owns the nested `ranges` field array here because RHF's `useFieldArray` can't
 * be called in a loop in the parent. "+ Add more" appends a RANGE only.
 */
export function FreightGroupCard({
  control,
  index,
  onRemove,
  canRemove,
  otherUsedTypes,
}: {
  control: Control<PricingFormValues>;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  /** Freight types claimed by OTHER groups (excluded from this group's picker). */
  otherUsedTypes: FreightType[];
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `freightGroups.${index}.ranges`,
  });

  // Group-level "add at least one range" error (array root), read-only.
  const { errors } = useFormState({ control, name: `freightGroups.${index}.ranges` });
  const rangesError = errors.freightGroups?.[index]?.ranges as
    | { message?: string; root?: { message?: string } }
    | undefined;
  const rangesMessage = rangesError?.message ?? rangesError?.root?.message;

  const selectOnFocus = (e: FocusEvent<HTMLInputElement>) => e.currentTarget.select();
  const blockNegativeKeys = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
  };

  return (
    <Controller
      control={control}
      name={`freightGroups.${index}.freightType`}
      render={({ field: typeField, fieldState: typeState }) => {
        const type = typeField.value as FreightType;
        const meta = FREIGHT_META[type];
        const Icon = meta.icon;
        const typeOptions = FREIGHT_TYPE_OPTIONS.filter(
          (o) => !otherUsedTypes.includes(o.value),
        );

        return (
          <div className="rounded-xl border border-border/60 p-4">
            {/* Group header: freight-type picker + remove-group */}
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${meta.accent}`}
              >
                <Icon className="size-3.5" /> {meta.badge}
              </span>
              <Select value={type} onValueChange={typeField.onChange}>
                <SelectTrigger className="h-8 w-auto min-w-[160px] font-semibold">
                  <SelectValue>
                    {(v) => FREIGHT_TYPE_LABELS[v as FreightType] ?? "Freight type"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {canRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  aria-label="Remove freight type"
                  className="ml-auto text-muted-foreground transition hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
            {typeState.error && (
              <p className="mb-2 text-xs text-destructive">{typeState.error.message}</p>
            )}

            {/* Weight ranges */}
            <div className="space-y-3">
              {fields.map((f, ri) => (
                <div key={f.id} className="grid items-stretch gap-4 sm:grid-cols-2">
                  <div className="flex flex-col">
                    <Label className="mb-1 block text-sm font-semibold text-foreground">
                      Weight range (kg)
                    </Label>
                    <div className="flex flex-1 items-center gap-2 rounded-lg bg-secondary/50 p-3">
                      <Controller
                        control={control}
                        name={`freightGroups.${index}.ranges.${ri}.minWeight`}
                        render={({ field }) => (
                          <WeightSelect
                            ariaLabel="Minimum weight"
                            placeholder="Min"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      <span className="text-muted-foreground">–</span>
                      <Controller
                        control={control}
                        name={`freightGroups.${index}.ranges.${ri}.maxWeight`}
                        render={({ field }) => (
                          <WeightSelect
                            ariaLabel="Maximum weight"
                            placeholder="Max"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    <Controller
                      control={control}
                      name={`freightGroups.${index}.ranges.${ri}.minWeight`}
                      render={({ fieldState }) =>
                        fieldState.error ? (
                          <p className="mt-1 text-xs text-destructive">
                            {fieldState.error.message}
                          </p>
                        ) : (
                          <></>
                        )
                      }
                    />
                    <Controller
                      control={control}
                      name={`freightGroups.${index}.ranges.${ri}.maxWeight`}
                      render={({ fieldState }) =>
                        fieldState.error ? (
                          <p className="mt-1 text-xs text-destructive">
                            {fieldState.error.message}
                          </p>
                        ) : (
                          <></>
                        )
                      }
                    />
                  </div>

                  <div className="flex flex-col">
                    <div className="mb-1 flex items-center gap-2">
                      <Label className="text-sm font-semibold text-foreground">Price</Label>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(ri)}
                          aria-label="Remove range"
                          className="ml-auto text-muted-foreground transition hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-center rounded-lg bg-secondary/50 p-3">
                      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Rate
                      </Label>
                      <Controller
                        control={control}
                        name={`freightGroups.${index}.ranges.${ri}.price`}
                        render={({ field, fieldState }) => (
                          <>
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
                                value={field.value ?? ""}
                                onChange={field.onChange}
                              />
                              <span className="whitespace-nowrap text-xs text-muted-foreground">
                                / kg
                              </span>
                            </div>
                            {fieldState.error && (
                              <p className="mt-1 text-xs text-destructive">
                                {fieldState.error.message}
                              </p>
                            )}
                          </>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {rangesMessage && <p className="text-xs text-destructive">{rangesMessage}</p>}

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ minWeight: 0, maxWeight: 0, price: "" })}
              >
                <Plus className="size-4" /> Add more
              </Button>
            </div>
          </div>
        );
      }}
    />
  );
}
