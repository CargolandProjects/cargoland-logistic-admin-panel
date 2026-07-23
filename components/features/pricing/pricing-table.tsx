"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Info } from "lucide-react";

import { DataTable, type Column, type RowAction } from "@/components/shared/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeletePricing, useSetPopularRoute } from "@/lib/query/hooks/use-pricing";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { formatNaira, formatWeightRange } from "@/lib/utils";
import { COUNTRIES } from "@/lib/geo";
import {
  bracketRate,
  type FreightType,
  type InternationalPricingBracket,
  type Pricing,
} from "@/types/pricing";

const SORTED_COUNTRIES = [...COUNTRIES].sort((a, b) => a.localeCompare(b));
const ALL_RANGES = "__all__";

const FREIGHT_COLUMNS: { ft: FreightType; header: string }[] = [
  { ft: "AIR_FREIGHT", header: "Air /kg" },
  { ft: "ROAD_FREIGHT", header: "Land /kg" },
  { ft: "OCEAN_FREIGHT", header: "Ocean /kg" },
];

interface WeightRange {
  key: string; // `${min}-${max}`
  min: number;
  max: number;
  label: string; // e.g. "0–5 kg"
  count: number; // how many routes define this range (any freight type)
}

/** A route's brackets for one freight type, valid and sorted ascending. */
function bracketsFor(row: Pricing, ft: FreightType): InternationalPricingBracket[] {
  return (row.pricingBrackets ?? [])
    .filter((b) => b.freightType === ft && b.maxWeight >= b.minWeight)
    .sort((a, b) => a.minWeight - b.minWeight || a.maxWeight - b.maxWeight);
}

export function PricingTable({ data, isLoading }: { data: Pricing[]; isLoading: boolean }) {
  const router = useRouter();
  const del = useDeletePricing();
  const setPopular = useSetPopularRoute();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const searching = search.trim() !== "" && search !== debouncedSearch;

  const [country, setCountry] = useState("all");

  // Routes each define their own weights (per freight type), so the table can't
  // share fixed columns. Collect every distinct weight range across all routes
  // and let the user pick one — each freight column then shows that range's
  // price. "All ranges" shows the min–max span instead.
  const ranges = useMemo<WeightRange[]>(() => {
    const map = new Map<string, WeightRange & { routes: Set<string> }>();
    for (const row of data) {
      for (const b of row.pricingBrackets ?? []) {
        if (b.maxWeight < b.minWeight) continue;
        const key = `${b.minWeight}-${b.maxWeight}`;
        const existing = map.get(key);
        if (existing) existing.routes.add(row.id);
        else
          map.set(key, {
            key,
            min: b.minWeight,
            max: b.maxWeight,
            label: formatWeightRange(b.minWeight, b.maxWeight),
            count: 0,
            routes: new Set([row.id]),
          });
      }
    }
    return [...map.values()]
      .map((r) => ({ key: r.key, min: r.min, max: r.max, label: r.label, count: r.routes.size }))
      .sort((a, b) => a.min - b.min || a.max - b.max);
  }, [data]);

  const [selectedKey, setSelectedKey] = useState<string>(ALL_RANGES);
  const activeKey =
    selectedKey === ALL_RANGES || ranges.some((r) => r.key === selectedKey)
      ? selectedKey
      : ALL_RANGES;
  const activeRange = ranges.find((r) => r.key === activeKey) ?? null;

  // Client-side filter: free-text search (route) + an exact country picker
  // (matches either the from- or to- country).
  const visible = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return data.filter((r) => {
      const matchesCountry =
        country === "all" || r.fromWhere === country || r.toWhere === country;
      if (!matchesCountry) return false;
      if (!q) return true;
      return `${r.fromWhere} ${r.toWhere}`.toLowerCase().includes(q);
    });
  }, [data, debouncedSearch, country]);

  const filtersActive = debouncedSearch.trim() !== "" || country !== "all";
  const noResults = !isLoading && !searching && filtersActive && visible.length === 0;

  const rangeLabel = (r: WeightRange) =>
    `${r.label} · ${r.count} ${r.count === 1 ? "route" : "routes"}`;

  const columns: Column<Pricing>[] = [
    {
      header: "Route",
      cell: (r) => (
        <span className="inline-flex items-center gap-2 font-medium text-foreground">
          <span>
            {r.fromWhere} <span className="mx-1 text-muted-foreground">→</span> {r.toWhere}
          </span>
          {r.isPopularRoute && (
            <span className="inline-flex items-center rounded-full border border-brand-red/40 px-2 py-0.5 text-[11px] font-medium text-brand-red">
              Popular route
            </span>
          )}
        </span>
      ),
    },
    ...FREIGHT_COLUMNS.map<Column<Pricing>>(({ ft, header }) => ({
      header: activeRange ? `${header} · ${activeRange.label}` : header,
      headClassName: "text-right",
      className: "text-right",
      cell: (r) => <PriceCell row={r} ft={ft} activeRange={activeRange} />,
    })),
  ];

  const actions: RowAction<Pricing>[] = [
    { label: "Edit", onSelect: (r) => router.push(`/pricing/${r.id}`) },
    {
      label: "Popular Route",
      onSelect: (r) => setPopular.mutate({ id: r.id, isPopularRoute: !r.isPopularRoute }),
    },
    { label: "Delete", destructive: true, onSelect: (r) => del.mutate(r.id) },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            {searching ? (
              <Loader2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-primary" />
            ) : (
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            )}
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search route (country)"
              className="h-10 pl-9"
            />
          </div>

          <Select value={country} onValueChange={(v) => setCountry(v as string)}>
            <SelectTrigger className="h-10 min-w-[160px]">
              <SelectValue>
                {(v) => ((v as string) === "all" ? "All countries" : (v as string))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {SORTED_COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {ranges.length > 0 && (
            <div className="flex items-center gap-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Weight range
              </Label>
              <Select value={activeKey} onValueChange={(v) => setSelectedKey(v as string)}>
                <SelectTrigger className="h-10 min-w-[180px]">
                  <SelectValue>
                    {(v) => {
                      if ((v as string) === ALL_RANGES) return "All ranges";
                      const r = ranges.find((x) => x.key === v);
                      return r ? rangeLabel(r) : "Select range";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_RANGES}>All ranges</SelectItem>
                  {ranges.map((r) => (
                    <SelectItem key={r.key} value={r.key}>
                      {rangeLabel(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {noResults && (
          <p className="inline-flex w-fit items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
            {debouncedSearch.trim()
              ? `No routes for “${debouncedSearch.trim()}”${country !== "all" ? ` in ${country}` : ""}`
              : `No routes in ${country}`}
          </p>
        )}

        <DataTable
          columns={columns}
          data={visible}
          rowKey={(r) => r.id}
          actions={actions}
          onRowClick={(r) => router.push(`/pricing/${r.id}`)}
          isLoading={isLoading}
          pageSize={8}
          emptyMessage="No pricing rules yet."
        />
      </div>
    </TooltipProvider>
  );
}

function PriceCell({
  row,
  ft,
  activeRange,
}: {
  row: Pricing;
  ft: FreightType;
  activeRange: WeightRange | null;
}) {
  const brackets = bracketsFor(row, ft);

  let value: string;
  if (brackets.length === 0) {
    value = "—";
  } else if (activeRange) {
    // A specific weight range is selected — show its exact price, else "—".
    const match = brackets.find(
      (b) => b.minWeight === activeRange.min && b.maxWeight === activeRange.max,
    );
    value = match ? formatNaira(Number(bracketRate(match))) : "—";
  } else {
    // "All ranges" — show the min–max span across this freight type's brackets.
    const rates = brackets.map((b) => Number(bracketRate(b))).filter(Number.isFinite);
    if (rates.length === 0) value = "—";
    else {
      const min = Math.min(...rates);
      const max = Math.max(...rates);
      value = min === max ? formatNaira(min) : `${formatNaira(min)} – ${formatNaira(max)}`;
    }
  }

  return (
    <span className="inline-flex items-center justify-end gap-1.5">
      <span className="font-medium tabular-nums text-foreground">{value}</span>
      {brackets.length > 0 && (
        <Tooltip>
          <TooltipTrigger
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="See all rates for this freight type"
            onClick={(e) => e.stopPropagation()}
          >
            <Info className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">All rates /kg</p>
              {brackets.map((b) => (
                <div
                  key={`${b.minWeight}-${b.maxWeight}`}
                  className="flex justify-between gap-4 tabular-nums"
                >
                  <span>{formatWeightRange(b.minWeight, b.maxWeight)}</span>
                  <span>{formatNaira(Number(bracketRate(b)))}</span>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}
