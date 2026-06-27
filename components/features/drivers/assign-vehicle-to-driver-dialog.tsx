"use client";

import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useAssignDriver } from "@/lib/query/hooks/use-vehicles";
import { useVehicles } from "@/lib/query/hooks/use-vehicles";

const schema = z.object({ vehicleId: z.string().min(1, "Select a vehicle") });
type FormValues = z.infer<typeof schema>;

export function AssignVehicleToDriverDialog({
  open,
  onOpenChange,
  driverId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverId?: string;
}) {
  const assign = useAssignDriver();
  const { data: vehicles } = useVehicles();
  // Per the design note: only vehicles without a current driver.
  const available = (vehicles ?? []).filter((v) => !v.assignDriver);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { vehicleId: "" } });

  const vehicleLabel = (id: string) => {
    const v = vehicles?.find((x) => x.id === id);
    return v ? v.vehicleTrackingId || v.id : "Assign";
  };

  const onSubmit = (values: FormValues) => {
    if (!driverId) return;
    assign.mutate(
      { driverId, vehicleId: values.vehicleId },
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
          <DialogTitle className="text-center">Assign Vehicle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Assign to Vehicle</Label>
            <Controller
              control={control}
              name="vehicleId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v as string)}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue>{(v) => (v ? vehicleLabel(v as string) : "Assign")}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {available.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.vehicleTrackingId || v.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.vehicleId && (
              <p className="text-xs text-destructive">{errors.vehicleId.message}</p>
            )}
            {vehicles && available.length === 0 && (
              <p className="text-xs text-muted-foreground">No driverless vehicles available.</p>
            )}
          </div>

          <p className="rounded-lg bg-indigo-50 p-3 text-xs text-indigo-700">
            <span className="font-semibold">Note:</span> Only vehicles without a current driver are
            shown. You can also assign later from the Vehicles tab or the Assign Driver screen.
          </p>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="submit"
              disabled={assign.isPending}
              className="h-11 w-full bg-brand-red text-white"
            >
              {assign.isPending ? "Saving…" : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full border-brand-red text-brand-red"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
