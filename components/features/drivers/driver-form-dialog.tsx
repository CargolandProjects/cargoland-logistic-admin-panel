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
import { useCreateDriver, useUpdateDriver } from "@/lib/query/hooks/use-drivers";
import type { Driver } from "@/types/driver";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastname: z.string().min(1, "Required"),
  phoneNumber: z.string().min(1, "Required"),
  emailAddress: z.string().email("Invalid email"),
  dob: z.string().min(1, "Required"),
  gender: z.string().min(1, "Required"),
  driverLicenseNo: z.string().min(1, "Required"),
  licenseExpiry: z.string().min(1, "Required"),
  nationalId: z.string().min(1, "Required"),
  yearOfExperience: z.string().min(1, "Required"),
  assignToVehicle: z.string().min(1, "Required"),
  contactName: z.string().min(1, "Required"),
  contactPhone: z.string().min(1, "Required"),
  activateAccountImmediately: z.boolean(),
  sendWelcomeSms: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const TEXT_FIELDS: { name: keyof FormValues; label: string }[] = [
  { name: "firstName", label: "First Name" },
  { name: "lastname", label: "Last Name" },
  { name: "phoneNumber", label: "Phone Number" },
  { name: "emailAddress", label: "Email Address" },
  { name: "dob", label: "Date of Birth" },
  { name: "gender", label: "Gender" },
  { name: "driverLicenseNo", label: "Driver License No." },
  { name: "licenseExpiry", label: "License Expiry" },
  { name: "nationalId", label: "National ID" },
  { name: "yearOfExperience", label: "Years of Experience" },
  { name: "assignToVehicle", label: "Assign to Vehicle" },
  { name: "contactName", label: "Emergency Contact Name" },
  { name: "contactPhone", label: "Emergency Contact Phone" },
];

export function DriverFormDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Driver;
}) {
  const create = useCreateDriver();
  const update = useUpdateDriver(initial?.id ?? "");
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
      firstName: initial?.firstName ?? "",
      lastname: initial?.lastname ?? "",
      phoneNumber: initial?.phoneNumber ?? "",
      emailAddress: initial?.emailAddress ?? "",
      dob: initial?.dob ?? "",
      gender: initial?.gender ?? "",
      driverLicenseNo: initial?.driverLicenseNo ?? "",
      licenseExpiry: initial?.licenseExpiry ?? "",
      nationalId: initial?.nationalId ?? "",
      yearOfExperience: initial?.yearOfExperience ?? "",
      assignToVehicle: initial?.assignToVehicle ?? "",
      contactName: initial?.contactName ?? "",
      contactPhone: initial?.contactPhone ?? "",
      activateAccountImmediately: initial?.activateAccountImmediately ?? false,
      sendWelcomeSms: initial?.sendWelcomeSms ?? false,
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
          <DialogTitle>{initial ? "Edit Driver" : "Add Driver"}</DialogTitle>
          <DialogDescription>Driver profile, license and contact details.</DialogDescription>
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
          </div>

          <div className="flex flex-wrap gap-6">
            <Controller
              control={control}
              name="activateAccountImmediately"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                  Activate account immediately
                </label>
              )}
            />
            <Controller
              control={control}
              name="sendWelcomeSms"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                  Send welcome SMS
                </label>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending} className="bg-brand-red text-white">
              {pending ? "Saving…" : initial ? "Save Changes" : "Add Driver"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
