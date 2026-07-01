"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Package } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { shipmentStatusLabel } from "@/types/shipment";
import { DataTable, type Column, type RowAction } from "@/components/shared/data-table";
import { AssignDriverDialog } from "@/components/features/vehicles/assign-driver-dialog";
import { FleetTrackingDialog } from "@/components/features/vehicles/fleet-tracking-dialog";
import {
  useVehicle,
  useVehicleTracking,
  useVehicleAssignments,
} from "@/lib/query/hooks/use-vehicles";
import { useDriver, useDrivers } from "@/lib/query/hooks/use-drivers";
import { VEHICLE_STATUS_LABELS, type AssignedShipment } from "@/types/vehicle";

export function VehicleStatusView({ id }: { id: string }) {
  const { data: vehicle, isLoading } = useVehicle(id);
  const trackingId = vehicle?.vehicleTrackingId;
  const { data: tracking } = useVehicleTracking(trackingId);
  const { data: driver } = useDriver(vehicle?.assignDriver ?? "");
  const { data: drivers } = useDrivers();
  const { data: assignments } = useVehicleAssignments();

  const [reassignOpen, setReassignOpen] = useState(false);
  const [trackAllOpen, setTrackAllOpen] = useState(false);
  const [trackSingle, setTrackSingle] = useState<string | null>(null);

  if (isLoading || !vehicle) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Driver: prefer the active driver↔vehicle assignment (authoritative link), else
  // the vehicle's assignDriver (as an id), else a driver whose assignToVehicle points here.
  const activeAssignment = (assignments ?? []).find(
    (a) => !a.unassignedAt && a.vehicleId === vehicle.id,
  );
  const listDriver =
    (activeAssignment && drivers?.find((d) => d.id === activeAssignment.driverId)) ||
    drivers?.find(
      (d) =>
        d.assignToVehicle === vehicle.id ||
        d.assignToVehicle === vehicle.vehicleTrackingId ||
        d.assignToVehicle === vehicle.plateNumber ||
        d.id === vehicle.assignDriver,
    );
  const nameFrom = (d: { firstName: string; lastname: string }) =>
    `${d.firstName} ${d.lastname}`.trim();
  const driverName = driver
    ? nameFrom(driver) + (driver.driverTrackingId ? ` (${driver.driverTrackingId})` : "")
    : listDriver
      ? nameFrom(listDriver)
      : vehicle.assignDriver || "—";

  // Onboard packages: prefer the tracking endpoint, fall back to the vehicle's own list.
  const packages =
    tracking?.assignedShipments?.length
      ? tracking.assignedShipments
      : vehicle.assignShipmentToVehicle ?? [];
  const packageCount = packages.length || tracking?.totalPackages || 0;

  const columns: Column<AssignedShipment>[] = [
    { header: "Track ID", cell: (r) => <span className="font-medium text-brand-red">{r.trackingId}</span> },
    { header: "Customer", cell: (r) => r.customer || "—" },
    { header: "Destination", cell: (r) => r.destination || "—" },
    {
      header: "Status",
      cell: (r) => (r.status ? <StatusBadge status={shipmentStatusLabel(r.status)} /> : "—"),
    },
  ];

  const actions: RowAction<AssignedShipment>[] = [
    { label: "Track", onSelect: (r) => setTrackSingle(r.trackingId) },
  ];

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
          <StatusBadge status={VEHICLE_STATUS_LABELS[vehicle.setVehicleStatus]} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setReassignOpen(true)}>
            Reassign
          </Button>
          <Button
            size="sm"
            className="bg-brand-red text-white"
            onClick={() => toast.info("Contact driver isn't available yet.")}
          >
            Contact Driver
          </Button>
        </div>
      </div>

      <h1 className="text-xl font-semibold text-foreground">
        Vehicle Status — {vehicle.vehicleTrackingId}
      </h1>

      {/* Identity banner */}
      <Card className="bg-brand-blue p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="rounded-md bg-white/15 px-3 py-1 text-sm font-semibold">
              {vehicle.vehicleTrackingId}
            </span>
            <div>
              <p className="text-sm text-white/80">Driver: {driverName}</p>
              <p className="text-xs text-white/70">
                Fuel: {vehicle.fuelType || "—"} · Capacity: {vehicle.maximumCapacity || "—"}
              </p>
            </div>
          </div>
          <div className="flex gap-8 text-center">
            <div>
              <p className="text-2xl font-bold">{packageCount}</p>
              <p className="text-xs uppercase tracking-wide text-white/70">Packages</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{vehicle.maximumPackages || "—"}</p>
              <p className="text-xs uppercase tracking-wide text-white/70">Max Packages</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Packages onboard */}
      <Card className="gap-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="size-5 text-indigo-600" />
            <h2 className="text-base font-semibold">
              Packages Onboard — {packageCount} total
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTrackAllOpen(true)}
            disabled={!trackingId}
          >
            Track
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={packages}
          rowKey={(r) => r.id}
          actions={actions}
          emptyMessage="No packages onboard."
        />
      </Card>

      {/* Reassign driver */}
      <AssignDriverDialog
        open={reassignOpen}
        onOpenChange={setReassignOpen}
        vehicleId={vehicle.id}
        vehicleLabel={vehicle.vehicleTrackingId}
      />
      {/* Track whole vehicle */}
      <FleetTrackingDialog
        open={trackAllOpen}
        onOpenChange={setTrackAllOpen}
        vehicleTrackingId={trackingId}
      />
      {/* Track single shipment */}
      <FleetTrackingDialog
        key={trackSingle}
        open={Boolean(trackSingle)}
        onOpenChange={(o) => !o && setTrackSingle(null)}
        vehicleTrackingId={trackingId}
        singleShipmentId={trackSingle ?? undefined}
      />
    </div>
  );
}
