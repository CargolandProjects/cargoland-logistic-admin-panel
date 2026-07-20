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
import { useDeleteDomesticPricing } from "@/lib/query/hooks/use-domestic-pricing";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { formatNaira, formatWeightRange } from "@/lib/utils";
import { DOMESTIC_COUNTRIES, STATES_BY_COUNTRY } from "@/lib/geo";
import type { DomesticPricing, DomesticPricingMode, PricingBracket } from "@/types/pricing";

// All states from the geo dataset, for the "filter by state" picker.
const STATE_OPTIONS = DOMESTIC_COUNTRIES.flatMap((c) => STATES_BY_COUNTRY[c] ?? []).sort((a, b) =>
  a.localeCompare(b),
);

interface WeightRange {
  key: string; // `${min}-${max}`
  min: number;
  max: number;
  label: string; // e.g. "1–10 kg"
  count: number; // how many routes define this range (drives the default)
}

/** True when a bracket belongs to the active mode (single = exact weight). */
function inMode(b: PricingBracket, mode: DomesticPricingMode): boolean {
  if (b.maxWeight < b.minWeight) return false;
  return mode === "single" ? b.maxWeight === b.minWeight : b.maxWeight > b.minWeight;
}

/** Brackets for a route that match the active mode, sorted ascending. */
function validBrackets(row: DomesticPricing, mode: DomesticPricingMode): PricingBracket[] {
  return row.brackets
    .filter((b) => inMode(b, mode))
    .sort((a, b) => a.minWeight - b.minWeight || a.maxWeight - b.maxWeight);
}

export function DomesticPricingTable({
  data,
  isLoading,
  mode,
}: {
  data: DomesticPricing[];
  isLoading: boolean;
  mode: DomesticPricingMode;
}) {
  const router = useRouter();
  const del = useDeleteDomesticPricing();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const searching = search.trim() !== "" && search !== debouncedSearch;

  const [stateFilter, setStateFilter] = useState("all");

  // Routes each define their own weights, so the table can't share columns. We
  // pick ONE weight (a dropdown) and show every route's price for it — only the
  // active mode's brackets (single "4 kg" vs range "0–9 kg"); identical entries
  // merge (route count shown).
  const ranges = useMemo<WeightRange[]>(() => {
    const map = new Map<string, WeightRange>();
    for (const row of data) {
      for (const b of row.brackets) {
        if (!inMode(b, mode)) continue;
        const key = `${b.minWeight}-${b.maxWeight}`;
        const existing = map.get(key);
        if (existing) existing.count += 1;
        else
          map.set(key, {
            key,
            min: b.minWeight,
            max: b.maxWeight,
            label: formatWeightRange(b.minWeight, b.maxWeight),
            count: 1,
          });
      }
    }
    return [...map.values()].sort((a, b) => a.min - b.min || a.max - b.max);
  }, [data, mode]);

  // Default to the widest-coverage range so the first view isn't sparse.
  const defaultKey = useMemo(() => {
    if (ranges.length === 0) return "";
    return [...ranges].sort((a, b) => b.count - a.count)[0].key;
  }, [ranges]);

  const [selectedKey, setSelectedKey] = useState<string>("");
  const activeKey = ranges.some((r) => r.key === selectedKey) ? selectedKey : defaultKey;
  const activeRange = ranges.find((r) => r.key === activeKey) ?? null;

  // Filter the route list client-side: free-text search (state/city) + an exact
  // state picker (matches either the from- or to- state).
  const visible = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return data.filter((r) => {
      const matchesState =
        stateFilter === "all" ||
        r.fromState === stateFilter ||
        r.toWhereState === stateFilter;
      if (!matchesState) return false;
      if (!q) return true;
      return `${r.fromState} ${r.fromCity} ${r.toWhereState} ${r.toWhereCity}`
        .toLowerCase()
        .includes(q);
    });
  }, [data, debouncedSearch, stateFilter]);

  const filtersActive = debouncedSearch.trim() !== "" || stateFilter !== "all";
  const noResults = !isLoading && !searching && filtersActive && visible.length === 0;

  const rangeLabel = (r: WeightRange) =>
    `${r.label} · ${r.count} ${r.count === 1 ? "route" : "routes"}`;

  const columns: Column<DomesticPricing>[] = [
    {
      header: "Location",
      cell: (r) => (
        <span className="font-medium text-foreground">
          {r.fromState}/{r.fromCity}
          <span className="mx-1 text-muted-foreground">→</span>
          {r.toWhereState}/{r.toWhereCity}
        </span>
      ),
    },
    {
      header: activeRange ? `Price /kg · ${activeRange.label}` : "Price /kg",
      headClassName: "text-right",
      className: "text-right",
      cell: (r) => <PriceCell row={r} activeRange={activeRange} mode={mode} />,
    },
  ];

  const actions: RowAction<DomesticPricing>[] = [
    { label: "Edit", onSelect: (r) => router.push(`/pricing/${r.id}?type=domestic`) },
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
              placeholder="Search state or city"
              className="h-10 pl-9"
            />
          </div>

          <Select value={stateFilter} onValueChange={(v) => setStateFilter(v as string)}>
            <SelectTrigger className="h-10 min-w-[160px]">
              <SelectValue>{(v) => ((v as string) === "all" ? "All states" : (v as string))}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              {STATE_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {ranges.length > 0 && (
            <div className="flex items-center gap-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                {mode === "single" ? "Weight" : "Weight range"}
              </Label>
              <Select value={activeKey} onValueChange={(v) => setSelectedKey(v as string)}>
                <SelectTrigger className="h-10 min-w-[180px]">
                  <SelectValue>
                    {(v) => {
                      const r = ranges.find((x) => x.key === v);
                      return r ? rangeLabel(r) : "Select range";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
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
              ? `No routes for “${debouncedSearch.trim()}”${stateFilter !== "all" ? ` in ${stateFilter}` : ""}`
              : `No routes in ${stateFilter}`}
          </p>
        )}

        <DataTable
          columns={columns}
          data={visible}
          rowKey={(r) => r.id}
          actions={actions}
          onRowClick={(r) => router.push(`/pricing/${r.id}?type=domestic`)}
          isLoading={isLoading}
          pageSize={8}
          emptyMessage={
            mode === "single" ? "No single-value pricing yet." : "No range pricing yet."
          }
        />
      </div>
    </TooltipProvider>
  );
}

function PriceCell({
  row,
  activeRange,
  mode,
}: {
  row: DomesticPricing;
  activeRange: WeightRange | null;
  mode: DomesticPricingMode;
}) {
  const brackets = validBrackets(row, mode);
  const match = activeRange
    ? brackets.find((b) => b.minWeight === activeRange.min && b.maxWeight === activeRange.max)
    : undefined;

  return (
    <span className="inline-flex items-center justify-end gap-1.5">
      <span className="font-medium tabular-nums text-foreground">
        {match ? formatNaira(match.ratePerKg) : "—"}
      </span>
      {brackets.length > 0 && (
        <Tooltip>
          <TooltipTrigger
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="See all rates for this route"
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
                  <span>{formatNaira(b.ratePerKg)}</span>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}
