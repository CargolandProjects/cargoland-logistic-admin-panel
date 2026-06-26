"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const TEXT_FIELDS: { name: keyof FormValues; label: string }[] = [
  { name: "phoneNumber", label: "Phone Number" },
  { name: "maximumCapacity", label: "Maximum Capacity" },
  { name: "maximumPackages", label: "Maximum Packages" },
  { name: "fuelType", label: "Fuel Type" },
  { name: "insurancePolicyNo", label: "Insurance Policy No." },
  { name: "roadWorthinessExpiry", label: "Road Worthiness Expiry" },
  { name: "hackneyPermitExpiry", label: "Hackney Permit Expiry" },
  { name: "gpsDeviceId", label: "GPS Device ID" },
  { name: "telemanticProvider", label: "Telematics Provider" },
];

export function VehicleFormDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Vehicle;
}) {
  const create = useCreateVehicle();
  const update = useUpdateVehicle(initial?.id ?? "");
  const pending = create.isPending || update.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
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
      setVehicleStatus: initial?.setVehicleStatus ?? "ACTIVE",
    },
  });

  const onSubmit = (values: FormValues) => {
    const mutation = initial ? update : create;
    mutation.mutate(values, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
          <DialogDescription>Vehicle details and telemetry configuration.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TEXT_FIELDS.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <Label htmlFor={f.name}>{f.label}</Label>
                <Input id={f.name} className="h-10" {...register(f.name)} />
                {errors[f.name] && (
                  <p className="text-xs text-destructive">{errors[f.name]?.message as string}</p>
                )}
              </div>
            ))}

            <div className="space-y-1.5">
              <Label>Vehicle Status</Label>
              <Controller
                control={control}
                name="setVehicleStatus"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as VehicleStatus)}
                  >
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

            <Controller
              control={control}
              name="enableTelemetryAlert"
              render={({ field }) => (
                <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                  Enable Telemetry Alerts
                </label>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending} className="bg-brand-red text-white">
              {pending ? "Saving…" : initial ? "Save Changes" : "Add Vehicle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
