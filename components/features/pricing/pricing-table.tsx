"use client";

import { useRouter } from "next/navigation";

import { DataTable, type Column, type RowAction } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDeletePricing } from "@/lib/query/hooks/use-pricing";
import { PRICING_TYPE_LABELS, type Pricing } from "@/types/pricing";

const columns: Column<Pricing>[] = [
  {
    header: "Route",
    cell: (r) => (
      <span className="font-medium text-foreground">
        {r.fromWhere} <span className="mx-1 text-muted-foreground">→</span> {r.toWhere}
      </span>
    ),
  },
  {
    header: "Type",
    cell: (r) => <StatusBadge status={PRICING_TYPE_LABELS[r.pricingShippingType]} tone="purple" />,
  },
  { header: "Air", cell: (r) => r.airFreightRate },
  { header: "Road", cell: (r) => r.roadFreightRate },
  { header: "Ocean", cell: (r) => r.oceanFreightRate },
];

export function PricingTable({ data, isLoading }: { data: Pricing[]; isLoading: boolean }) {
  const router = useRouter();
  const del = useDeletePricing();

  const actions: RowAction<Pricing>[] = [
    { label: "Edit", onSelect: (r) => router.push(`/pricing/${r.id}`) },
    { label: "Delete", destructive: true, onSelect: (r) => del.mutate(r.id) },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={(r) => r.id}
      actions={actions}
      onRowClick={(r) => router.push(`/pricing/${r.id}`)}
      isLoading={isLoading}
      emptyMessage="No pricing rules yet."
    />
  );
}
