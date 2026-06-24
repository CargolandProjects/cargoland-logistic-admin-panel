"use client";

import { useForm } from "react-hook-form";
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
import { useAssignVehicle } from "@/lib/query/hooks/use-vehicles";

const schema = z.object({
  shipmentTrackingId: z.string().min(1, "Required"),
  vehicleTrackingId: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

export function AssignVehicleDialog({
  open,
  onOpenChange,
  vehicleTrackingId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleTrackingId?: string;
}) {
  const assign = useAssignVehicle();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { shipmentTrackingId: "", vehicleTrackingId: vehicleTrackingId ?? "" },
  });

  const onSubmit = (values: FormValues) =>
    assign.mutate(values, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Vehicle to Shipment</DialogTitle>
          <DialogDescription>Link a vehicle to a shipment by their tracking IDs.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="shipmentTrackingId">Shipment Tracking ID</Label>
            <Input id="shipmentTrackingId" className="h-10" {...register("shipmentTrackingId")} />
            {errors.shipmentTrackingId && (
              <p className="text-xs text-destructive">{errors.shipmentTrackingId.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vehicleTrackingId">Vehicle Tracking ID</Label>
            <Input id="vehicleTrackingId" className="h-10" {...register("vehicleTrackingId")} />
            {errors.vehicleTrackingId && (
              <p className="text-xs text-destructive">{errors.vehicleTrackingId.message}</p>
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
