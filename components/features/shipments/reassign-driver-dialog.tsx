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
import { useReassignDriver } from "@/lib/query/hooks/use-shipments";

const schema = z.object({
  driverId: z.string().min(1, "Required"),
  driverName: z.string().min(1, "Required"),
  driverPhoneNumber: z.string().min(1, "Required"),
  vehicleId: z.string().min(1, "Required"),
  vehicleName: z.string().min(1, "Required"),
  vehiclePlate: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

const FIELDS: { name: keyof FormValues; label: string }[] = [
  { name: "driverId", label: "Driver ID" },
  { name: "driverName", label: "Driver Name" },
  { name: "driverPhoneNumber", label: "Driver Phone" },
  { name: "vehicleId", label: "Vehicle ID" },
  { name: "vehicleName", label: "Vehicle Name" },
  { name: "vehiclePlate", label: "Vehicle Plate" },
];

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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      driverId: "",
      driverName: "",
      driverPhoneNumber: "",
      vehicleId: "",
      vehicleName: "",
      vehiclePlate: "",
    },
  });

  const onSubmit = (values: FormValues) =>
    reassign.mutate(values, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign Driver</DialogTitle>
          <DialogDescription>Assign a new driver and vehicle to this shipment.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <Label htmlFor={f.name}>{f.label}</Label>
                <Input id={f.name} className="h-10" {...register(f.name)} />
                {errors[f.name] && (
                  <p className="text-xs text-destructive">{errors[f.name]?.message}</p>
                )}
              </div>
            ))}
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
