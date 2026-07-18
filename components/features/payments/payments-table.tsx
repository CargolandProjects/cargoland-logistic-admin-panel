"use client";

import { formatNaira, formatDateTime } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  PAYMENT_STATUS_LABELS,
  paymentMethodLabel,
  type PaymentTransaction,
} from "@/types/payment";

const columns: Column<PaymentTransaction>[] = [
  {
    header: "Transaction ID",
    cell: (r) => (
      <span className="font-mono text-xs font-medium text-foreground" title={r.id}>
        {r.id}
      </span>
    ),
  },
  {
    header: "Booking Ref",
    cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.bookingRef}</span>,
  },
  { header: "Customer", cell: (r) => <span className="font-medium text-foreground">{r.customer}</span> },
  {
    header: "Method",
    cell: (r) => (
      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
        {paymentMethodLabel(r.method)}
      </span>
    ),
  },
  {
    header: "Date",
    cell: (r) => (
      <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(r.date)}</span>
    ),
  },
  {
    header: "Amount",
    headClassName: "text-right",
    className: "text-right",
    cell: (r) => (
      <span className="font-semibold tabular-nums text-foreground">{formatNaira(r.amount)}</span>
    ),
  },
  {
    header: "Status",
    headClassName: "text-right",
    className: "text-right",
    cell: (r) => <StatusBadge status={PAYMENT_STATUS_LABELS[r.status] ?? r.status} />,
  },
];

export function PaymentsTable({
  data,
  isLoading,
}: {
  data: PaymentTransaction[];
  isLoading: boolean;
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={(r) => `${r.id}-${r.bookingRef}`}
      isLoading={isLoading}
      pageSize={8}
      emptyMessage="No transactions found."
    />
  );
}
