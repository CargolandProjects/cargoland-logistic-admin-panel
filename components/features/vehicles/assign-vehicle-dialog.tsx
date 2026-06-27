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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssignVehicle } from "@/lib/query/hooks/use-vehicles";
import { useShipments } from "@/lib/query/hooks/use-shipments";

const schema = z.object({
  shipmentTrackingId: z.string().min(1, "Select a shipment"),
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
  const { data: shipments } = useShipments({});

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { shipmentTrackingId: "", vehicleTrackingId: vehicleTrackingId ?? "" },
  });

  const shipmentLabel = (trackingId: string) => {
    const s = shipments?.find((x) => x.trackingId === trackingId);
    return s ? `${s.trackingId}${s.customer ? ` · ${s.customer}` : ""}` : trackingId || "Select shipment";
  };

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
          <DialogDescription>Pick a shipment to assign to this vehicle.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Shipment</Label>
            <Controller
              control={control}
              name="shipmentTrackingId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v as string)}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue>{(v) => shipmentLabel(v as string)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(shipments ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.trackingId}>
                        {s.trackingId}
                        {s.customer ? ` · ${s.customer}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.shipmentTrackingId && (
              <p className="text-xs text-destructive">{errors.shipmentTrackingId.message}</p>
            )}
            {shipments && shipments.length === 0 && (
              <p className="text-xs text-muted-foreground">No shipments available.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vehicleTrackingId">Vehicle Tracking ID</Label>
            <Input
              id="vehicleTrackingId"
              className="h-10 bg-secondary/50"
              readOnly
              {...register("vehicleTrackingId")}
            />
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
