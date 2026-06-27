"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, MapPin, Package } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { AssignVehicleToDriverDialog } from "@/components/features/drivers/assign-vehicle-to-driver-dialog";
import { useDriver } from "@/lib/query/hooks/use-drivers";
import { useVehicle, useVehicleTracking } from "@/lib/query/hooks/use-vehicles";

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function DriverProfileView({ id }: { id: string }) {
  const { data: driver, isLoading } = useDriver(id);
  const [assignOpen, setAssignOpen] = useState(false);

  const { data: vehicle } = useVehicle(driver?.assignToVehicle ?? "");
  const { data: tracking } = useVehicleTracking(vehicle?.vehicleTrackingId);

  if (isLoading || !driver) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-28" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-60" />
          <Skeleton className="h-60" />
        </div>
      </div>
    );
  }

  const name = `${driver.firstName} ${driver.lastname}`.trim() || "—";
  const assigned = Boolean(driver.assignToVehicle);
  const initials = `${driver.firstName?.[0] ?? ""}${driver.lastname?.[0] ?? ""}`.toUpperCase() || "DR";

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link
            href="/fleet"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <ChevronLeft className="size-4" /> Fleet
          </Link>
          <StatusBadge status={assigned ? "Assigned" : "Unassigned"} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("Contact driver isn't available yet.")}>
            Contact Driver
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAssignOpen(true)}>
            Reassign Vehicle
          </Button>
          <Button
            size="sm"
            className="bg-brand-red text-white"
            nativeButton={false}
            render={<Link href={`/fleet/drivers/${driver.id}/edit`} />}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      <h1 className="text-xl font-semibold text-foreground">Driver Profile — {name}</h1>

      {/* Identity banner */}
      <Card className="bg-brand-blue p-5 text-white">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-white/20 text-base font-semibold">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="text-lg font-semibold">{name}</p>
            <p className="text-sm text-white/80">
              {driver.driverTrackingId} · {driver.phoneNumber} · {driver.emailAddress}
            </p>
            <p className="text-xs text-white/70">
              Joined {formatDate(driver.createdAt)}
              {driver.currentLocation ? ` · ${driver.currentLocation}` : ""}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current vehicle assignment */}
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold">Current Vehicle Assignment</h2>
          {assigned ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                <div className="flex items-center gap-2">
                  <Package className="size-4 text-indigo-600" />
                  <span className="text-sm font-semibold">
                    {vehicle?.vehicleTrackingId || driver.assignToVehicle}
                  </span>
                </div>
                {vehicle && <StatusBadge status={vehicle.setVehicleStatus} />}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Info
                  icon={<Package className="size-3.5" />}
                  label="Packages On Board"
                  value={tracking ? String(tracking.totalPackages) : "—"}
                />
                <Info
                  icon={<MapPin className="size-3.5" />}
                  label="Current Location"
                  value={driver.currentLocation || "—"}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No vehicle assigned to this driver.</p>
          )}
        </Card>

        {/* Personal & license details */}
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold">Personal &amp; License Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Full Name" value={name} />
            <Detail label="Driver ID" value={driver.driverTrackingId || "—"} />
            <Detail label="Phone" value={driver.phoneNumber || "—"} />
            <Detail label="Email" value={driver.emailAddress || "—"} />
            <Detail label="Date of Birth" value={driver.dob || "—"} />
            <Detail label="Gender" value={driver.gender || "—"} />
            <Detail label="License No." value={driver.driverLicenseNo || "—"} />
            <Detail label="License Expiry" value={driver.licenseExpiry || "—"} />
            <Detail label="National ID" value={driver.nationalId || "—"} />
            <Detail label="Experience" value={driver.yearOfExperience || "—"} />
            <Detail label="Emergency Contact" value={driver.contactName || "—"} />
            <Detail label="Emergency Phone" value={driver.contactPhone || "—"} />
          </div>
        </Card>
      </div>

      <AssignVehicleToDriverDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        driverId={driver.id}
      />
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/50 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
