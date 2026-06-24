"use client";

import { useMemo } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { ShipmentFilters } from "@/components/features/shipments/shipment-filters";
import { ShipmentsTable } from "@/components/features/shipments/shipments-table";
import { useShipments } from "@/lib/query/hooks/use-shipments";
import { useShipmentFilterStore } from "@/stores/shipment-filter-store";

export default function ShipmentsPage() {
  const { search, type, status, transport, tab } = useShipmentFilterStore();

  const filters = useMemo(
    () => ({ search, type, status, transport }),
    [search, type, status, transport],
  );
  const { data, isLoading } = useShipments(filters);

  // The status tabs further narrow the fetched rows client-side.
  const rows = useMemo(() => {
    const all = data ?? [];
    if (tab === "all") return all;
    return all.filter((s) => s.status === tab);
  }, [data, tab]);

  return (
    <div className="space-y-6">
      <PageHeader title="Shipment Tracking" />
      <Card className="gap-4 p-5">
        <ShipmentFilters />
        <ShipmentsTable data={rows} isLoading={isLoading} />
      </Card>
    </div>
  );
}
