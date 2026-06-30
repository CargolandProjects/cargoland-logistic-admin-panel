"use client";

import { formatNaira } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  PAYMENT_STATUS_LABELS,
  paymentMethodLabel,
  type PaymentTransaction,
} from "@/types/payment";

const columns: Column<PaymentTransaction>[] = [
  { header: "Transaction ID", cell: (r) => <span className="font-medium">{r.id}</span> },
  { header: "Booking Ref", cell: (r) => r.bookingRef },
  { header: "Customer", cell: (r) => r.customer },
  { header: "Amount", cell: (r) => <span className="font-medium">{formatNaira(r.amount)}</span> },
  {
    header: "Method",
    cell: (r) => <span className="text-muted-foreground">{paymentMethodLabel(r.method)}</span>,
  },
  { header: "Date", cell: (r) => <span className="text-muted-foreground">{r.date}</span> },
  {
    header: "Status",
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
      pageSize={10}
      emptyMessage="No transactions found."
    />
  );
}
