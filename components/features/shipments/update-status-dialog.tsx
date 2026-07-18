"use client";

import type { FocusEvent } from "react";
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
import { useUpdateTelemetry } from "@/lib/query/hooks/use-shipments";
import { SHIPMENT_STATUS_LABELS, type ShipmentStatus } from "@/types/shipment";

const STATUS_VALUES = Object.keys(SHIPMENT_STATUS_LABELS) as ShipmentStatus[];

const schema = z.object({
  eventStatus: z.string().min(1, "Select a status"),
  location: z.string().min(1, "Location is required"),
  speed: z.number({ message: "Required" }).min(0, "Must be ≥ 0"),
  fuelLevel: z.number({ message: "Required" }).min(0, "0–100").max(100, "0–100"),
  eventDescription: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function UpdateStatusDialog({
  id,
  open,
  onOpenChange,
  defaults,
}: {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults?: { status?: ShipmentStatus; location?: string; speed?: number };
}) {
  const update = useUpdateTelemetry(id);
  const selectOnFocus = (e: FocusEvent<HTMLInputElement>) => e.currentTarget.select();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      eventStatus: defaults?.status ?? "IN_TRANSIT",
      location: defaults?.location ?? "",
      speed: defaults?.speed ?? 0,
      fuelLevel: 0,
      eventDescription: "",
    },
  });

  const onSubmit = (values: FormValues) =>
    update.mutate(
      {
        eventStatus: values.eventStatus as ShipmentStatus,
        location: values.location,
        speed: values.speed,
        fuelLevel: values.fuelLevel,
        eventDescription: values.eventDescription || undefined,
        eventSource: "Admin assignment",
        isAutoSynced: false,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      },
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <DialogDescription>
            Push a status + telemetry update. This adds an entry to the event log.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Controller
              control={control}
              name="eventStatus"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v as string)}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue>
                      {(v) => SHIPMENT_STATUS_LABELS[v as ShipmentStatus] ?? "Select a status"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_VALUES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {SHIPMENT_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.eventStatus && (
              <p className="text-xs text-destructive">{errors.eventStatus.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Current location</Label>
            <Input
              id="location"
              className="h-10"
              placeholder="e.g. 3rd Mainland Bridge, Lagos"
              {...register("location")}
            />
            {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="speed">Speed (km/h)</Label>
              <Input
                id="speed"
                type="number"
                min={0}
                step="any"
                onFocus={selectOnFocus}
                className="h-10"
                {...register("speed", { valueAsNumber: true })}
              />
              {errors.speed && <p className="text-xs text-destructive">{errors.speed.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fuelLevel">Fuel level (%)</Label>
              <Input
                id="fuelLevel"
                type="number"
                min={0}
                max={100}
                step="any"
                onFocus={selectOnFocus}
                className="h-10"
                {...register("fuelLevel", { valueAsNumber: true })}
              />
              {errors.fuelLevel && (
                <p className="text-xs text-destructive">{errors.fuelLevel.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="eventDescription">Note (optional)</Label>
            <Input
              id="eventDescription"
              className="h-10"
              placeholder="Additional context for the event log"
              {...register("eventDescription")}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={update.isPending} className="bg-brand-red text-white">
              {update.isPending ? "Updating…" : "Update Status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
