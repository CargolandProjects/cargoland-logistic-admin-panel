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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReassignDriver } from "@/lib/query/hooks/use-shipments";
import { useDrivers } from "@/lib/query/hooks/use-drivers";
import { useVehicles } from "@/lib/query/hooks/use-vehicles";

// The API needs the resolved driver/vehicle details; we only pick ids in the UI
// and derive name/phone/plate from the selected records on submit.
const schema = z.object({
  driverId: z.string().min(1, "Select a driver"),
  vehicleId: z.string().min(1, "Select a vehicle"),
});

type FormValues = z.infer<typeof schema>;

export function ReassignDriverDialog({
  id,
  open,
  onOpenChange,
}: {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const reassign = useReassignDriver(id);
  const { data: drivers } = useDrivers();
  const { data: vehicles } = useVehicles();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { driverId: "", vehicleId: "" },
  });

  const driverLabel = (id: string) => {
    const d = drivers?.find((x) => x.id === id);
    return d ? `${d.firstName} ${d.lastname}`.trim() || d.emailAddress || d.id : "Select driver";
  };
  const vehicleLabel = (id: string) => {
    const v = vehicles?.find((x) => x.id === id);
    return v ? v.plateNumber || v.vehicleTrackingId || v.id : "Select vehicle";
  };

  const onSubmit = (values: FormValues) => {
    const d = drivers?.find((x) => x.id === values.driverId);
    const v = vehicles?.find((x) => x.id === values.vehicleId);
    reassign.mutate(
      {
        driverId: values.driverId,
        driverName: d ? `${d.firstName} ${d.lastname}`.trim() : "",
        driverPhoneNumber: d?.phoneNumber ?? "",
        vehicleId: values.vehicleId,
        vehicleName: v?.vehicleTrackingId ?? "",
        vehiclePlate: v?.plateNumber ?? "",
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign Driver</DialogTitle>
          <DialogDescription>Assign a new driver and vehicle to this shipment.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Driver</Label>
            <Controller
              control={control}
              name="driverId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v as string)}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue>{(v) => (v ? driverLabel(v as string) : "Select driver")}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(drivers ?? []).map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {`${d.firstName} ${d.lastname}`.trim() || d.emailAddress || d.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.driverId && <p className="text-xs text-destructive">{errors.driverId.message}</p>}
            {drivers && drivers.length === 0 && (
              <p className="text-xs text-muted-foreground">No drivers available — add one first.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Vehicle</Label>
            <Controller
              control={control}
              name="vehicleId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v as string)}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue>{(v) => (v ? vehicleLabel(v as string) : "Select vehicle")}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(vehicles ?? []).map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.plateNumber || v.vehicleTrackingId || v.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.vehicleId && (
              <p className="text-xs text-destructive">{errors.vehicleId.message}</p>
            )}
            {vehicles && vehicles.length === 0 && (
              <p className="text-xs text-muted-foreground">No vehicles available — add one first.</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={reassign.isPending} className="bg-brand-red text-white">
              {reassign.isPending ? "Reassigning…" : "Reassign Driver"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
