"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useShipmentFilterStore, type StatusTab } from "@/stores/shipment-filter-store";
import { SHIPMENT_STATUS_LABELS, type ShipmentStatus } from "@/types/shipment";

interface Option {
  label: string;
  value: string;
}

const TYPE_OPTIONS: Option[] = [
  { label: "All Types", value: "all" },
  { label: "Local", value: "Local" },
  { label: "International", value: "International" },
];

// Status dropdown: all real ShipmentStatus values + "All".
const STATUS_OPTIONS: Option[] = [
  { label: "All Statuses", value: "all" },
  ...(Object.keys(SHIPMENT_STATUS_LABELS) as ShipmentStatus[]).map((s) => ({
    label: SHIPMENT_STATUS_LABELS[s],
    value: s,
  })),
];

const TRANSPORT_OPTIONS: Option[] = [
  { label: "All Transport", value: "all" },
  { label: "Air", value: "Air" },
  { label: "Land", value: "Land" },
  { label: "Ocean", value: "Ocean" },
];

// Quick-filter tabs over the most common statuses.
const TABS: { label: string; value: StatusTab }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "In Transit", value: "IN_TRANSIT" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
}) {
  const labelFor = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  return (
    <Select value={value} onValueChange={(v) => onChange(v as string)}>
      <SelectTrigger className="h-10 min-w-[150px]">
        <SelectValue>{(v) => labelFor(v as string)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ShipmentFilters() {
  const { search, type, status, transport, tab, setSearch, setType, setStatus, setTransport, setTab } =
    useShipmentFilterStore();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking ID or customer"
            className="h-10 pl-9"
          />
        </div>
        <FilterSelect value={type} onChange={setType} options={TYPE_OPTIONS} />
        <FilterSelect value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        <FilterSelect value={transport} onChange={setTransport} options={TRANSPORT_OPTIONS} />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as StatusTab)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
