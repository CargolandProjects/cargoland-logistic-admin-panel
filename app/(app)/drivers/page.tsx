"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, type Column, type RowAction } from "@/components/shared/data-table";
import { DriverFormDialog } from "@/components/features/drivers/driver-form-dialog";
import { useDrivers } from "@/lib/query/hooks/use-drivers";
import type { Driver } from "@/types/driver";

const columns: Column<Driver>[] = [
  {
    header: "Name",
    cell: (r) => (
      <span className="font-medium">{`${r.firstName} ${r.lastname}`.trim() || "—"}</span>
    ),
  },
  { header: "Phone", cell: (r) => r.phoneNumber || "—" },
  { header: "Email", cell: (r) => r.emailAddress || "—" },
  { header: "License No.", cell: (r) => r.driverLicenseNo || "—" },
  { header: "Vehicle", cell: (r) => r.assignToVehicle || "—" },
  { header: "Experience", cell: (r) => (r.yearOfExperience ? `${r.yearOfExperience} yrs` : "—") },
];

export default function DriversPage() {
  const { data, isLoading } = useDrivers();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);

  const actions: RowAction<Driver>[] = [{ label: "Edit", onSelect: (r) => setEditing(r) }];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Driver Management"
        subtitle="Drivers, licenses and vehicle assignments."
        actions={
          <Button className="bg-brand-red text-white" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add Driver
          </Button>
        }
      />

      <Card className="p-2">
        <DataTable
          columns={columns}
          data={data ?? []}
          rowKey={(r) => r.id}
          actions={actions}
          isLoading={isLoading}
          emptyMessage="No drivers yet."
        />
      </Card>

      <DriverFormDialog open={addOpen} onOpenChange={setAddOpen} />
      <DriverFormDialog
        key={editing?.id}
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        initial={editing ?? undefined}
      />
    </div>
  );
}
