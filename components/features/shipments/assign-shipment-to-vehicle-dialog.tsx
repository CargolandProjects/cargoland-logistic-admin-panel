"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
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
import { useAssignVehicle, useVehicles } from "@/lib/query/hooks/use-vehicles";
import { VEHICLE_STATUS_LABELS } from "@/types/vehicle";

const schema = z.object({ vehicleTrackingId: z.string().min(1, "Select a vehicle") });
type FormValues = z.infer<typeof schema>;

export function AssignShipmentToVehicleDialog({
  open,
  onOpenChange,
  shipmentTrackingId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipmentTrackingId?: string;
}) {
  const assign = useAssignVehicle();
  const { data: vehicles } = useVehicles();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { vehicleTrackingId: "" },
  });

  const selectedTrackingId = useWatch({ control, name: "vehicleTrackingId" });
  const selectedVehicle = vehicles?.find((v) => v.vehicleTrackingId === selectedTrackingId);

  // Trigger label: show the selected vehicle's plate (fall back to its tracking id).
  const triggerLabel = (trackingId: string) => {
    const v = vehicles?.find((x) => x.vehicleTrackingId === trackingId);
    if (!v) return trackingId || "Select vehicle by plate";
    return v.plateNumber || v.vehicleTrackingId;
  };

  const onSubmit = (values: FormValues) => {
    if (!shipmentTrackingId) return;
    const vehicle = vehicles?.find((x) => x.vehicleTrackingId === values.vehicleTrackingId);
    assign.mutate(
      {
        shipmentTrackingId,
        vehicleTrackingId: values.vehicleTrackingId,
        plateNumber: vehicle?.plateNumber ?? "",
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
          <DialogTitle>Assign to Truck</DialogTitle>
          <DialogDescription>
            Assign shipment {shipmentTrackingId} to a fleet vehicle.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Vehicle (by plate number)</Label>
            <Controller
              control={control}
              name="vehicleTrackingId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v as string)}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue>{(v) => triggerLabel(v as string)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(vehicles ?? []).map((v) => (
                      <SelectItem key={v.id} value={v.vehicleTrackingId}>
                        <span className="font-medium">{v.plateNumber || "No plate"}</span>
                        <span className="text-muted-foreground">
                          {" · "}
                          {v.vehicleTrackingId} · {VEHICLE_STATUS_LABELS[v.setVehicleStatus]}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.vehicleTrackingId && (
              <p className="text-xs text-destructive">{errors.vehicleTrackingId.message}</p>
            )}
            {vehicles && vehicles.length === 0 && (
              <p className="text-xs text-muted-foreground">No vehicles available.</p>
            )}
          </div>

          {selectedVehicle && (
            <div className="rounded-lg bg-secondary/50 px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Plate Number</p>
              <p className="text-sm font-semibold text-foreground">
                {selectedVehicle.plateNumber || "—"}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={assign.isPending} className="bg-brand-red text-white">
              {assign.isPending ? "Assigning…" : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
