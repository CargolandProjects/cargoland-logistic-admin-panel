"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Truck, Warehouse, Wrench, Users, UserCheck, UserMinus, Search } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type Column, type RowAction } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { AssignDriverDialog } from "@/components/features/vehicles/assign-driver-dialog";
import { FleetTrackingDialog } from "@/components/features/vehicles/fleet-tracking-dialog";
import { TablePagination } from "@/components/shared/table-pagination";
import { DriverCard } from "@/components/features/drivers/driver-card";
import { AssignVehicleToDriverDialog } from "@/components/features/drivers/assign-vehicle-to-driver-dialog";
import { useVehicles } from "@/lib/query/hooks/use-vehicles";
import { useDrivers } from "@/lib/query/hooks/use-drivers";
import { VEHICLE_STATUS_LABELS, type Vehicle } from "@/types/vehicle";
import type { Driver } from "@/types/driver";

const vehicleColumns: Column<Vehicle>[] = [
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

const ASSIGNMENT_OPTIONS = [
  { value: "all", label: "All Drivers" },
  { value: "assigned", label: "Assigned" },
  { value: "unassigned", label: "Unassigned" },
];

export default function FleetPage() {
  const router = useRouter();
  const { data: vehicles, isLoading } = useVehicles();
  const { data: drivers, isLoading: driversLoading } = useDrivers();

  const [assignDriverFor, setAssignDriverFor] = useState<Vehicle | null>(null);
  const [trackFor, setTrackFor] = useState<Vehicle | null>(null);
  const [assignVehicleFor, setAssignVehicleFor] = useState<Driver | null>(null);
  const [driverSearch, setDriverSearch] = useState("");
  const [driverFilter, setDriverFilter] = useState("all");

  const vehicleStats = useMemo(() => {
    const list = vehicles ?? [];
    return {
      total: list.length,
      active: list.filter((v) => v.setVehicleStatus === "ACTIVE").length,
      maintenance: list.filter((v) => v.setVehicleStatus === "MAINTENANCE").length,
    };
  }, [vehicles]);

  const driverStats = useMemo(() => {
    const list = drivers ?? [];
    const assigned = list.filter((d) => d.assignToVehicle).length;
    return { total: list.length, assigned, unassigned: list.length - assigned };
  }, [drivers]);

  const filteredDrivers = useMemo(() => {
    let list = drivers ?? [];
    const q = driverSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (d) =>
          `${d.firstName} ${d.lastname}`.toLowerCase().includes(q) ||
          d.driverTrackingId.toLowerCase().includes(q),
      );
    }
    if (driverFilter === "assigned") list = list.filter((d) => d.assignToVehicle);
    if (driverFilter === "unassigned") list = list.filter((d) => !d.assignToVehicle);
    return list;
  }, [drivers, driverSearch, driverFilter]);

  // Paginate the driver card grid (10 per page); reset when the filter changes
  // (render-phase reset — avoids set-state-in-effect cascading renders).
  const [driverPage, setDriverPage] = useState(1);
  const driverResetKey = `${driverSearch}|${driverFilter}`;
  const [prevDriverKey, setPrevDriverKey] = useState(driverResetKey);
  if (prevDriverKey !== driverResetKey) {
    setPrevDriverKey(driverResetKey);
    setDriverPage(1);
  }
  const driverPageCount = Math.max(1, Math.ceil(filteredDrivers.length / 10));
  const currentDriverPage = Math.min(driverPage, driverPageCount);
  const visibleDrivers = filteredDrivers.slice(
    (currentDriverPage - 1) * 10,
    currentDriverPage * 10,
  );

  const vehicleActions: RowAction<Vehicle>[] = [
    { label: "View", onSelect: (r) => router.push(`/fleet/vehicles/${r.id}`) },
    { label: "Edit", onSelect: (r) => router.push(`/fleet/vehicles/${r.id}/edit`) },
    { label: "Assign", onSelect: (r) => setAssignDriverFor(r) },
    { label: "Track", onSelect: (r) => setTrackFor(r) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Fleet Management" />

      <Tabs defaultValue="vehicles">
        <TabsList>
          <TabsTrigger value="vehicles">Vehicles ({vehicleStats.total})</TabsTrigger>
          <TabsTrigger value="drivers">Drivers ({driverStats.total})</TabsTrigger>
        </TabsList>

        {/* Vehicles tab */}
        <TabsContent value="vehicles" className="space-y-6">
          <div className="flex justify-end">
            <Button
              className="bg-brand-red text-white"
              nativeButton={false}
              render={<Link href="/fleet/vehicles/new" />}
            >
              <Plus className="size-4" /> Add Vehicle
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Vehicles" value={vehicleStats.total} icon={Warehouse} iconClassName="bg-indigo-100 text-indigo-600" trend="Registered vehicles" />
            <StatCard label="Active Now" value={vehicleStats.active} icon={Truck} iconClassName="bg-green-100 text-green-600" trend="On route" />
            <StatCard label="In Maintenance" value={vehicleStats.maintenance} icon={Wrench} iconClassName="bg-amber-100 text-amber-600" trend="Scheduled" trendDirection="down" />
          </div>

          <Card className="p-2">
            <DataTable
              columns={vehicleColumns}
              data={vehicles ?? []}
              rowKey={(r) => r.id}
              actions={vehicleActions}
              isLoading={isLoading}
              pageSize={10}
              emptyMessage="No vehicles yet."
            />
          </Card>
        </TabsContent>

        {/* Drivers tab */}
        <TabsContent value="drivers" className="space-y-6">
          <div className="flex justify-end">
            <Button
              className="bg-brand-red text-white"
              nativeButton={false}
              render={<Link href="/fleet/drivers/new" />}
            >
              <Plus className="size-4" /> Add Driver
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Drivers" value={driverStats.total} icon={Users} iconClassName="bg-indigo-100 text-indigo-600" trend="On the platform" />
            <StatCard label="Assigned" value={driverStats.assigned} icon={UserCheck} iconClassName="bg-green-100 text-green-600" trend="Linked to a vehicle" />
            <StatCard label="Unassigned" value={driverStats.unassigned} icon={UserMinus} iconClassName="bg-amber-100 text-amber-600" trend="No vehicle linked" trendDirection="down" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
                placeholder="Search driver name or ID"
                className="h-10 pl-9"
              />
            </div>
            <Select value={driverFilter} onValueChange={(v) => setDriverFilter(v as string)}>
              <SelectTrigger className="h-10 min-w-[160px]">
                <SelectValue>
                  {(v) => ASSIGNMENT_OPTIONS.find((o) => o.value === v)?.label ?? "All Drivers"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ASSIGNMENT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {driversLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="h-44 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleDrivers.map((d) => (
                  <DriverCard key={d.id} driver={d} onAssign={setAssignVehicleFor} />
                ))}
                <Link
                  href="/fleet/drivers/new"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-secondary">
                    <Plus className="size-5" />
                  </span>
                  <span className="text-sm font-semibold">Add New Driver</span>
                  <span className="text-xs">Register a driver and link them to a fleet vehicle</span>
                </Link>
              </div>
              <TablePagination
                page={currentDriverPage}
                pageCount={driverPageCount}
                onPageChange={setDriverPage}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Vehicle dialogs */}
      <AssignDriverDialog
        key={`assign-${assignDriverFor?.id}`}
        open={Boolean(assignDriverFor)}
        onOpenChange={(o) => !o && setAssignDriverFor(null)}
        vehicleId={assignDriverFor?.id}
        vehicleLabel={assignDriverFor?.vehicleTrackingId}
      />
      <FleetTrackingDialog
        key={`track-${trackFor?.id}`}
        open={Boolean(trackFor)}
        onOpenChange={(o) => !o && setTrackFor(null)}
        vehicleTrackingId={trackFor?.vehicleTrackingId}
      />

      {/* Driver → vehicle assignment */}
      <AssignVehicleToDriverDialog
        key={`assign-vehicle-${assignVehicleFor?.id}`}
        open={Boolean(assignVehicleFor)}
        onOpenChange={(o) => !o && setAssignVehicleFor(null)}
        driverId={assignVehicleFor?.id}
      />
    </div>
  );
}
