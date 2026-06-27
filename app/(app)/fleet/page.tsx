"use client";

import { useState } from "react";
import { Plus, Link2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, type Column, type RowAction } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { VehicleFormDialog } from "@/components/features/vehicles/vehicle-form-dialog";
import { AssignVehicleDialog } from "@/components/features/vehicles/assign-vehicle-dialog";
import { AssignDriverDialog } from "@/components/features/vehicles/assign-driver-dialog";
import { DriverFormDialog } from "@/components/features/drivers/driver-form-dialog";
import { useVehicles, useUnassignDriver } from "@/lib/query/hooks/use-vehicles";
import { VEHICLE_STATUS_LABELS, type Vehicle } from "@/types/vehicle";

const columns: Column<Vehicle>[] = [
  {
    header: "Vehicle ID",
    cell: (r) => <span className="font-medium">{r.vehicleTrackingId || "—"}</span>,
  },
  { header: "Capacity", cell: (r) => r.maximumCapacity || "—" },
  { header: "Packages", cell: (r) => r.maximumPackages || "—" },
  { header: "Fuel", cell: (r) => r.fuelType || "—" },
  { header: "Driver", cell: (r) => r.assignDriver || "—" },
  {
    header: "Status",
    cell: (r) => <StatusBadge status={VEHICLE_STATUS_LABELS[r.setVehicleStatus]} />,
  },
];

export default function FleetPage() {
  const { data, isLoading } = useVehicles();
  const unassignDriver = useUnassignDriver();
  const [addOpen, setAddOpen] = useState(false);
  const [addDriverOpen, setAddDriverOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [assignFor, setAssignFor] = useState<Vehicle | null>(null);
  const [assignDriverFor, setAssignDriverFor] = useState<Vehicle | null>(null);

  const actions: RowAction<Vehicle>[] = [
    { label: "Edit", onSelect: (r) => setEditing(r) },
    { label: "Assign to shipment", onSelect: (r) => setAssignFor(r) },
    { label: "Assign driver", onSelect: (r) => setAssignDriverFor(r) },
    { label: "Unassign driver", onSelect: (r) => unassignDriver.mutate(r.id) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Management"
        subtitle="Vehicles, telemetry configuration and shipment assignment."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setAddDriverOpen(true)}>
              <Plus className="size-4" /> Add Driver
            </Button>
            <Button className="bg-brand-red text-white" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" /> Add Vehicle
            </Button>
          </div>
        }
      />

      <Card className="p-2">
        <DataTable
          columns={columns}
          data={data ?? []}
          rowKey={(r) => r.id}
          actions={actions}
          isLoading={isLoading}
          emptyMessage="No vehicles yet."
        />
      </Card>

      {/* Add vehicle */}
      <VehicleFormDialog open={addOpen} onOpenChange={setAddOpen} />
      {/* Add driver (fleet is the only place drivers are managed) */}
      <DriverFormDialog open={addDriverOpen} onOpenChange={setAddDriverOpen} />
      {/* Edit */}
      <VehicleFormDialog
        key={editing?.id}
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        initial={editing ?? undefined}
      />
      {/* Assign to shipment */}
      <AssignVehicleDialog
        key={assignFor?.id}
        open={Boolean(assignFor)}
        onOpenChange={(o) => !o && setAssignFor(null)}
        vehicleTrackingId={assignFor?.vehicleTrackingId}
      />
      {/* Assign driver */}
      <AssignDriverDialog
        key={assignDriverFor?.id}
        open={Boolean(assignDriverFor)}
        onOpenChange={(o) => !o && setAssignDriverFor(null)}
        vehicleId={assignDriverFor?.id}
        vehicleLabel={assignDriverFor?.vehicleTrackingId}
      />

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link2 className="size-3.5" /> Assign links a vehicle tracking ID to a shipment tracking ID.
      </p>
    </div>
  );
}
