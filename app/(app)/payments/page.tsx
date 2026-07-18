"use client";

import { useMemo, useState } from "react";
import { Search, Download, Wallet, Clock, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { formatNaira } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { exportPaymentsXlsx } from "@/lib/export/payments";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentsTable } from "@/components/features/payments/payments-table";
import { ChartCard } from "@/components/features/dashboard/charts/chart-card";
import { MethodPie } from "@/components/features/payments/charts/method-pie";
import { PaymentsTrendLine } from "@/components/features/payments/charts/payments-trend-line";
import { TopCustomersBar } from "@/components/features/payments/charts/top-customers-bar";
import { usePayments } from "@/lib/query/hooks/use-payments";

// Values match the backend's uppercase enums (verified from live data).
const STATUS_OPTIONS = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "Successful", value: "SUCCESS" },
  { label: "Failed", value: "FAILED" },
];

const METHOD_OPTIONS = [
  { label: "All Methods", value: "all" },
  { label: "Card", value: "CARD" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "USSD", value: "USSD" },
];

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");

  const [exporting, setExporting] = useState(false);

  // Fetch the payments list ONCE (a generous page so the charts see all rows).
  // All filtering is client-side (server filters are unreliable), so
  // searching/filtering only re-renders the table — it never refetches.
  const { data, isLoading } = usePayments({ take: 500 });

  // Charts reflect ALL payments, independent of the table's search/status/method.
  const chartTx = data?.transactions ?? [];
  const noChartData = chartTx.length === 0;

  // Debounce the search so the spinner + filtering settle instead of firing on
  // every keystroke.
  const debouncedSearch = useDebouncedValue(search, 300);
  const searching = search.trim() !== "" && search !== debouncedSearch;

  const visible = useMemo(() => {
    let rows = data?.transactions ?? [];
    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.bookingRef.toLowerCase().includes(q) ||
          t.customer.toLowerCase().includes(q),
      );
    }
    if (status !== "all") rows = rows.filter((t) => t.status === status);
    if (method !== "all") rows = rows.filter((t) => t.method === method);
    return rows;
  }, [data?.transactions, debouncedSearch, status, method]);

  // Only shown while there's an active (settled) query that matched nothing.
  const noResults =
    !isLoading && !searching && debouncedSearch.trim() !== "" && visible.length === 0;

  const onExport = async () => {
    if (visible.length === 0) {
      toast.info("No transactions to export.");
      return;
    }
    setExporting(true);
    try {
      await exportPaymentsXlsx(visible);
      toast.success(`Exported ${visible.length} transactions`);
    } catch {
      toast.error("Could not export the report.");
    } finally {
      setExporting(false);
    }
  };

  const labelFor = (opts: typeof STATUS_OPTIONS, v: string) =>
    opts.find((o) => o.value === v)?.label ?? v;

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Tracking" />

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading || !data ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <StatCard
              icon={Wallet}
              label="Total Collected"
              value={formatNaira(data.summary.totalCollected)}
            />
            <StatCard icon={Clock} label="Pending" value={formatNaira(data.summary.pending)} />
            <StatCard icon={XCircle} label="Failed" value={formatNaira(data.summary.failed)} />
          </>
        )}
      </div>

      {/* Analytics */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ChartCard title="Payment Methods" isLoading={isLoading} isEmpty={noChartData}>
            <MethodPie transactions={chartTx} />
          </ChartCard>
          <div className="lg:col-span-2">
            <ChartCard title="Payments Over Time" isLoading={isLoading} isEmpty={noChartData}>
              <PaymentsTrendLine transactions={chartTx} />
            </ChartCard>
          </div>
        </div>
        <ChartCard title="Top Customers" isLoading={isLoading} isEmpty={noChartData}>
          <TopCustomersBar transactions={chartTx} />
        </ChartCard>
      </div>

      {/* Filters + table */}
      <Card className="gap-4 p-5">
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
              placeholder="Search transaction, booking ref or customer"
              className="h-10 pl-9"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as string)}>
            <SelectTrigger className="h-10 min-w-[150px]">
              <SelectValue>{(v) => labelFor(STATUS_OPTIONS, v as string)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={method} onValueChange={(v) => setMethod(v as string)}>
            <SelectTrigger className="h-10 min-w-[150px]">
              <SelectValue>{(v) => labelFor(METHOD_OPTIONS, v as string)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {METHOD_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="bg-brand-red text-white"
            onClick={onExport}
            disabled={exporting || isLoading}
          >
            <Download className="size-4" /> {exporting ? "Exporting…" : "Export Report"}
          </Button>
        </div>

        {noResults && (
          <p className="inline-flex w-fit items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
            No results for “{debouncedSearch.trim()}”
          </p>
        )}

        <PaymentsTable data={visible} isLoading={isLoading} />
      </Card>
    </div>
  );
}
