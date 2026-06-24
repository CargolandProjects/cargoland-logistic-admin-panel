"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card } from "@/components/ui/card";
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
import { useCreatePricing, useUpdatePricing } from "@/lib/query/hooks/use-pricing";
import {
  PRICING_TYPE_LABELS,
  PRICING_TYPE_OPTIONS,
  type Pricing,
  type PricingShippingType,
} from "@/types/pricing";

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

export function PricingForm({ initial }: { initial?: Pricing }) {
  const router = useRouter();
  const create = useCreatePricing();
  const update = useUpdatePricing(initial?.id ?? "");
  const pending = create.isPending || update.isPending;

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
    const mutation = initial ? update : create;
    mutation.mutate(values, { onSuccess: () => router.push("/pricing") });
  };

  return (
    <Card className="gap-5 p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label>Shipping Type</Label>
          <Controller
            control={control}
            name="pricingShippingType"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => field.onChange(v as PricingShippingType)}
              >
                <SelectTrigger className="h-10 w-full">
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="From" error={errors.fromWhere?.message}>
            <Input className="h-10" placeholder="e.g. Lagos" {...register("fromWhere")} />
          </Field>
          <Field label="To" error={errors.toWhere?.message}>
            <Input className="h-10" placeholder="e.g. London" {...register("toWhere")} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Air Freight Rate" error={errors.airFreightRate?.message}>
            <Input className="h-10" placeholder="0" {...register("airFreightRate")} />
          </Field>
          <Field label="Road Freight Rate" error={errors.roadFreightRate?.message}>
            <Input className="h-10" placeholder="0" {...register("roadFreightRate")} />
          </Field>
          <Field label="Ocean Freight Rate" error={errors.oceanFreightRate?.message}>
            <Input className="h-10" placeholder="0" {...register("oceanFreightRate")} />
          </Field>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/pricing")}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending} className="bg-brand-red text-white">
            {pending ? "Saving…" : initial ? "Save Changes" : "Create Pricing"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
