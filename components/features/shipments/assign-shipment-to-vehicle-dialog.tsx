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

  const label = (trackingId: string) => {
    const v = vehicles?.find((x) => x.vehicleTrackingId === trackingId);
    return v
      ? `${v.vehicleTrackingId} · ${VEHICLE_STATUS_LABELS[v.setVehicleStatus]}`
      : trackingId || "Select vehicle";
  };

  const onSubmit = (values: FormValues) => {
    if (!shipmentTrackingId) return;
    assign.mutate(
      { shipmentTrackingId, vehicleTrackingId: values.vehicleTrackingId },
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
            <Label>Vehicle</Label>
            <Controller
              control={control}
              name="vehicleTrackingId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v as string)}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue>{(v) => label(v as string)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(vehicles ?? []).map((v) => (
                      <SelectItem key={v.id} value={v.vehicleTrackingId}>
                        {v.vehicleTrackingId} · {VEHICLE_STATUS_LABELS[v.setVehicleStatus]}
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
