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
import { useAssignDriver } from "@/lib/query/hooks/use-vehicles";
import { useDrivers } from "@/lib/query/hooks/use-drivers";

const schema = z.object({ driverId: z.string().min(1, "Select a driver") });
type FormValues = z.infer<typeof schema>;

export function AssignDriverDialog({
  open,
  onOpenChange,
  vehicleId,
  vehicleLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId?: string;
  vehicleLabel?: string;
}) {
  const assign = useAssignDriver();
  const { data: drivers } = useDrivers();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { driverId: "" },
  });

  const driverName = (id: string) => {
    const d = drivers?.find((x) => x.id === id);
    return d ? `${d.firstName} ${d.lastname}`.trim() || d.emailAddress : "Select driver";
  };

  const onSubmit = (values: FormValues) => {
    if (!vehicleId) return;
    assign.mutate(
      { driverId: values.driverId, vehicleId },
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
          <DialogTitle>Assign Driver</DialogTitle>
          <DialogDescription>
            Assign a driver to vehicle {vehicleLabel ? `“${vehicleLabel}”` : ""}.
          </DialogDescription>
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
                    <SelectValue>{(v) => (v ? driverName(v as string) : "Select driver")}</SelectValue>
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
          <DialogFooter>
            <Button type="submit" disabled={assign.isPending} className="bg-brand-red text-white">
              {assign.isPending ? "Assigning…" : "Assign Driver"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
