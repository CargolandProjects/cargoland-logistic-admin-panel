"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import type { RecentBooking } from "@/types/dashboard";

const columns: Column<RecentBooking>[] = [
  { header: "ID", cell: (r) => <span className="font-medium">{r.id}</span> },
  { header: "Customer", cell: (r) => r.customer },
  { header: "Type", cell: (r) => <StatusBadge status={r.type} tone="purple" /> },
  { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
  {
    header: "Action",
    headClassName: "text-right",
    className: "text-right",
    cell: (r) => (
      <Button
        variant="outline"
        size="sm"
        render={<Link href={`/shipments/${r.id.replace("#", "")}`} />}
      >
        View
      </Button>
    ),
  },
];

export function RecentBookings({ data }: { data: RecentBooking[] }) {
  return <DataTable columns={columns} data={data} rowKey={(r) => r.id} />;
}
