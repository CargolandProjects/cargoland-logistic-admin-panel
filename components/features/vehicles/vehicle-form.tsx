"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm, type Control, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { useCreateVehicle, useUpdateVehicle } from "@/lib/query/hooks/use-vehicles";
import {
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUS_OPTIONS,
  type Vehicle,
  type VehicleStatus,
} from "@/types/vehicle";

const FUEL_OPTIONS = ["Petrol", "Diesel", "Gas", "Electric", "Hybrid"];
const TELEMATICS_OPTIONS = ["Cargoland Internal", "Third-party Provider"];

const schema = z.object({
  phoneNumber: z.string().min(1, "Required"),
  maximumCapacity: z.string().min(1, "Required"),
  maximumPackages: z.string().min(1, "Required"),
  fuelType: z.string().min(1, "Required"),
  insurancePolicyNo: z.string().min(1, "Required"),
  roadWorthinessExpiry: z.string().min(1, "Required"),
  hackneyPermitExpiry: z.string().min(1, "Required"),
  gpsDeviceId: z.string().min(1, "Required"),
  telemanticProvider: z.string().min(1, "Required"),
  enableTelemetryAlert: z.boolean(),
  setVehicleStatus: z.enum(["ACTIVE", "STANDY", "MAINTENANCE"]),
});

type FormValues = z.infer<typeof schema>;

export function VehicleForm({ initial }: { initial?: Vehicle }) {
  const router = useRouter();
  const create = useCreateVehicle();
  const update = useUpdateVehicle(initial?.id ?? "");
  const pending = create.isPending || update.isPending;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      phoneNumber: initial?.phoneNumber ?? "",
      maximumCapacity: initial?.maximumCapacity ?? "",
      maximumPackages: initial?.maximumPackages ?? "",
      fuelType: initial?.fuelType ?? "",
      insurancePolicyNo: initial?.insurancePolicyNo ?? "",
      roadWorthinessExpiry: initial?.roadWorthinessExpiry ?? "",
      hackneyPermitExpiry: initial?.hackneyPermitExpiry ?? "",
      gpsDeviceId: initial?.gpsDeviceId ?? "",
      telemanticProvider: initial?.telemanticProvider ?? "",
      enableTelemetryAlert: initial?.enableTelemetryAlert ?? false,
      setVehicleStatus: initial?.setVehicleStatus ?? "STANDY",
    },
  });

  const onSubmit = (values: FormValues) => {
    const mutation = initial ? update : create;
    mutation.mutate(values, { onSuccess: () => router.push("/fleet") });
  };

  const field = (
    name: keyof FormValues,
    label: string,
    opts?: { type?: string; placeholder?: string },
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={opts?.type} placeholder={opts?.placeholder} className="h-10" {...register(name)} />
      {errors[name] && <p className="text-xs text-destructive">{errors[name]?.message as string}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-4">
          <Card className="gap-4 p-5">
            <SectionTitle>Vehicle Information</SectionTitle>
            {field("phoneNumber", "Phone Number *", { placeholder: "+234 ..." })}
            <div className="grid gap-4 sm:grid-cols-2">
              {field("maximumCapacity", "Maximum Load Capacity (kg)", { placeholder: "e.g 1000" })}
              {field("maximumPackages", "Maximum Packages", { placeholder: "e.g 50" })}
            </div>
            <SelectField
              name="fuelType"
              label="Fuel Type"
              placeholder="e.g Petrol, Diesel, Gas"
              options={FUEL_OPTIONS}
              control={control}
              errors={errors}
            />
          </Card>

          <Card className="gap-4 p-5">
            <SectionTitle>Insurance &amp; Compliance</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("insurancePolicyNo", "Insurance Policy No.", { placeholder: "e.g 293922" })}
              {field("roadWorthinessExpiry", "Roadworthiness Expiry", { type: "date" })}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("hackneyPermitExpiry", "Hackney Permit Expiry", { type: "date" })}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Card className="gap-4 p-5">
            <SectionTitle>GPS &amp; Tracking Setup</SectionTitle>
            {field("gpsDeviceId", "GPS Device ID", { placeholder: "e.g gps-29iow" })}
            <SelectField
              name="telemanticProvider"
              label="Telematics Provider"
              placeholder="Select provider"
              options={TELEMATICS_OPTIONS}
              control={control}
              errors={errors}
            />
            <Controller
              control={control}
              name="enableTelemetryAlert"
              render={({ field: f }) => (
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enable telemetry alerts</p>
                    <p className="text-xs text-muted-foreground">
                      Notify admin on fuel, speed, and engine anomalies
                    </p>
                  </div>
                  <Switch checked={f.value} onCheckedChange={f.onChange} />
                </div>
              )}
            />
          </Card>

          <Card className="gap-4 p-5">
            <SectionTitle>Initial Status</SectionTitle>
            <div className="space-y-1.5">
              <Label>Set vehicle status</Label>
              <Controller
                control={control}
                name="setVehicleStatus"
                render={({ field: f }) => (
                  <Select value={f.value} onValueChange={(v) => f.onChange(v as VehicleStatus)}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue>{(v) => VEHICLE_STATUS_LABELS[v as VehicleStatus]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_STATUS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </Card>
        </div>
      </div>

      <Button type="submit" disabled={pending} className="h-12 w-full bg-brand-red text-white">
        {pending ? "Saving…" : initial ? "Save Changes" : "Add Vehicle to Fleet"}
      </Button>
    </form>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>
  );
}

function SelectField({
  name,
  label,
  placeholder,
  options,
  control,
  errors,
}: {
  name: "fuelType" | "telemanticProvider";
  label: string;
  placeholder: string;
  options: string[];
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="h-10 w-full">
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
      {errors[name] && <p className="text-xs text-destructive">{errors[name]?.message as string}</p>}
    </div>
  );
}
