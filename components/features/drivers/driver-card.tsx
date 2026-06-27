"use client";

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Driver } from "@/types/driver";

function initials(driver: Driver) {
  return `${driver.firstName?.[0] ?? ""}${driver.lastname?.[0] ?? ""}`.toUpperCase() || "DR";
}

export function DriverCard({
  driver,
  onAssign,
}: {
  driver: Driver;
  onAssign: (driver: Driver) => void;
}) {
  const assigned = Boolean(driver.assignToVehicle);
  const name = `${driver.firstName} ${driver.lastname}`.trim() || "—";

  return (
    <Card className="gap-4 p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
          {initials(driver)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{driver.driverTrackingId || "—"}</p>
          <p className="text-xs text-muted-foreground">{driver.phoneNumber || "—"}</p>
        </div>
        <StatusBadge status={assigned ? "Assigned" : "Unassigned"} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 text-xs">
        <Cell label="Vehicle" value={driver.assignToVehicle || "—"} />
        <Cell label="Experience" value={driver.yearOfExperience || "—"} />
        <Cell label="Gender" value={driver.gender || "—"} />
        <Cell label="License No." value={driver.driverLicenseNo || "—"} />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          nativeButton={false}
          render={<Link href={`/fleet/drivers/${driver.id}`} />}
        >
          View Profile
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-brand-red text-white"
          onClick={() => onAssign(driver)}
        >
          {assigned ? "Reassign" : "Assign Now"}
        </Button>
      </div>
    </Card>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate font-medium text-foreground">{value}</p>
    </div>
  );
}
