"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DataTable, type Column, type RowAction } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { shipmentStatusLabel, type Shipment } from "@/types/shipment";

const columns: Column<Shipment>[] = [
  { header: "Tracking ID", cell: (r) => <span className="font-medium">{r.trackingId}</span> },
  // {
  //   header: "Vehicle/Carrier ID",
  //   cell: (r) => (
  //     <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">{r.vehicleId}</span>
  //   ),
  // },
  { header: "Type", cell: (r) => <StatusBadge status={r.type} tone="purple" /> },
  { header: "Customer", cell: (r) => r.customer },
  {
    header: "Route",
    cell: (r) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {r.route.from} <span className="mx-1">→</span> {r.route.to}
      </span>
    ),
  },
  { header: "Last Updated", cell: (r) => <span className="text-muted-foreground">{r.lastUpdated}</span> },
  { header: "Status", cell: (r) => <StatusBadge status={shipmentStatusLabel(r.status)} /> },
];

export function ShipmentsTable({ data, isLoading }: { data: Shipment[]; isLoading: boolean }) {
  const router = useRouter();

  const actions: RowAction<Shipment>[] = [
    { label: "View", onSelect: (r) => router.push(`/shipments/${r.id}`) },
    { label: "Track", onSelect: (r) => router.push(`/shipments/${r.id}`) },
    {
      label: "Delete",
      destructive: true,
      // No delete endpoint in the API yet.
      onSelect: () => toast.info("Delete isn't available yet."),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={(r) => r.id}
      actions={actions}
      onRowClick={(r) => router.push(`/shipments/${r.id}`)}
      isLoading={isLoading}
      pageSize={10}
      emptyMessage="No shipments match your filters."
    />
  );
}
