"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

import { DataTable, type Column, type RowAction } from "@/components/shared/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeletePricing, useSetPopularRoute } from "@/lib/query/hooks/use-pricing";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { COUNTRIES } from "@/lib/geo";
import { type Pricing } from "@/types/pricing";

const SORTED_COUNTRIES = [...COUNTRIES].sort((a, b) => a.localeCompare(b));

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
  { header: "Air /kg", cell: (r) => r.airFreightRate },
  { header: "Land /kg", cell: (r) => r.roadFreightRate },
  { header: "Ocean /kg", cell: (r) => r.oceanFreightRate },
];

export function PricingTable({ data, isLoading }: { data: Pricing[]; isLoading: boolean }) {
  const router = useRouter();
  const del = useDeletePricing();
  const setPopular = useSetPopularRoute();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const searching = search.trim() !== "" && search !== debouncedSearch;

  const [country, setCountry] = useState("all");

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

  const actions: RowAction<Pricing>[] = [
    { label: "Edit", onSelect: (r) => router.push(`/pricing/${r.id}`) },
    {
      label: "Popular Route",
      onSelect: (r) => setPopular.mutate({ id: r.id, isPopularRoute: !r.isPopularRoute }),
    },
    { label: "Delete", destructive: true, onSelect: (r) => del.mutate(r.id) },
  ];

  return (
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
        pageSize={10}
        emptyMessage="No pricing rules yet."
      />
    </div>
  );
}
