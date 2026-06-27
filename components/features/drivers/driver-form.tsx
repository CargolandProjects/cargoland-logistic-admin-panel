"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateDriver, useUpdateDriver } from "@/lib/query/hooks/use-drivers";
import { GENDER_OPTIONS, toDateInput, type Driver } from "@/types/driver";

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
  contactName: z.string().min(1, "Required"),
  contactPhone: z.string().min(1, "Required"),
  activateAccountImmediately: z.boolean(),
  sendWelcomeSms: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function DriverForm({ initial }: { initial?: Driver }) {
  const router = useRouter();
  const create = useCreateDriver();
  const update = useUpdateDriver(initial?.id ?? "");
  const pending = create.isPending || update.isPending;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: initial?.firstName ?? "",
      lastname: initial?.lastname ?? "",
      phoneNumber: initial?.phoneNumber ?? "",
      emailAddress: initial?.emailAddress ?? "",
      dob: toDateInput(initial?.dob),
      gender: initial?.gender ?? "",
      driverLicenseNo: initial?.driverLicenseNo ?? "",
      licenseExpiry: toDateInput(initial?.licenseExpiry),
      nationalId: initial?.nationalId ?? "",
      yearOfExperience: initial?.yearOfExperience ?? "",
      contactName: initial?.contactName ?? "",
      contactPhone: initial?.contactPhone ?? "",
      activateAccountImmediately: initial?.activateAccountImmediately ?? false,
      sendWelcomeSms: initial?.sendWelcomeSms ?? false,
    },
  });

  const onSubmit = (values: FormValues) => {
    const mutation = initial ? update : create;
    mutation.mutate(values, { onSuccess: () => router.push("/fleet") });
  };

  const field = (
    name: keyof FormValues,
    label: string,
    opts?: { type?: string; placeholder?: string },
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={opts?.type} placeholder={opts?.placeholder} className="h-10" {...register(name)} />
      {errors[name] && <p className="text-xs text-destructive">{errors[name]?.message as string}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-4">
          <Card className="gap-4 p-5">
            <SectionTitle>Personal Information</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("firstName", "First Name *", { placeholder: "e.g Adeyinka" })}
              {field("lastname", "Last Name *", { placeholder: "e.g Lawal" })}
            </div>
            {field("phoneNumber", "Phone Number *", { placeholder: "+234 ..." })}
            {field("emailAddress", "Email Address *", { type: "email", placeholder: "name@email.com" })}
            <div className="grid gap-4 sm:grid-cols-2">
              {field("dob", "Date of Birth *", { type: "date" })}
              <div className="space-y-1.5">
                <Label>Gender *</Label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field: f }) => (
                    <Select value={f.value} onValueChange={f.onChange}>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue>{(v) => (v ? (v as string) : "Select gender")}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
              </div>
            </div>
          </Card>

          <Card className="gap-4 p-5">
            <SectionTitle>License and Credentials</SectionTitle>
            {field("driverLicenseNo", "Driver's Licence No. *", { placeholder: "e.g ABI-23456789" })}
            <div className="grid gap-4 sm:grid-cols-2">
              {field("licenseExpiry", "Licence Expiry", { type: "date" })}
              {field("yearOfExperience", "Years of Experience", { placeholder: "e.g 3yrs" })}
            </div>
            {field("nationalId", "National ID / NIN", { placeholder: "e.g ..." })}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Card className="gap-4 p-5">
            <SectionTitle>Emergency Contacts</SectionTitle>
            {field("contactName", "Contact Name", { placeholder: "e.g ..." })}
            {field("contactPhone", "Contact Phone", { placeholder: "+234 ..." })}
          </Card>

          <Card className="gap-4 p-5">
            <SectionTitle>Account Activation</SectionTitle>
            <Controller
              control={control}
              name="activateAccountImmediately"
              render={({ field: f }) => (
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Activate account immediately</p>
                    <p className="text-xs text-muted-foreground">
                      Driver can log in and receive assignments
                    </p>
                  </div>
                  <Switch checked={f.value} onCheckedChange={f.onChange} />
                </div>
              )}
            />
            <Controller
              control={control}
              name="sendWelcomeSms"
              render={({ field: f }) => (
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Send welcome SMS</p>
                    <p className="text-xs text-muted-foreground">
                      Notify driver with login credentials via SMS
                    </p>
                  </div>
                  <Switch checked={f.value} onCheckedChange={f.onChange} />
                </div>
              )}
            />
          </Card>
        </div>
      </div>

      <Button type="submit" disabled={pending} className="h-12 w-full bg-brand-red text-white">
        {pending ? "Saving…" : initial ? "Save Changes" : "Add Driver"}
      </Button>
    </form>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>
  );
}
