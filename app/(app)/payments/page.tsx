"use client";

import { useMemo, useState } from "react";
import { Search, Download } from "lucide-react";

import { formatNaira } from "@/lib/utils";
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
import { usePayments } from "@/lib/query/hooks/use-payments";

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Success", value: "Success" },
  { label: "Failed", value: "Failed" },
];

const METHOD_OPTIONS = [
  { label: "All Method", value: "all" },
  { label: "Card", value: "Card" },
  { label: "Bank Transfer", value: "Bank Transfer" },
  { label: "USSD", value: "USSD" },
];

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");

  const filters = useMemo(() => ({ search, status, method }), [search, status, method]);
  const { data, isLoading } = usePayments(filters);

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
              tone="green"
              label="Total Collected"
              value={formatNaira(data.summary.totalCollected)}
              trend="All successful transactions"
            />
            <StatCard
              tone="amber"
              label="Pending"
              value={formatNaira(data.summary.pending)}
              trend="Awaiting confirmation"
            />
            <StatCard
              tone="red"
              label="Failed"
              value={formatNaira(data.summary.failed)}
              trend="Failed transactions"
              trendDirection="down"
            />
          </>
        )}
      </div>

      {/* Filters + table */}
      <Card className="gap-4 p-5">
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
          <Button className="bg-brand-red text-white">
            <Download className="size-4" /> Export Report
          </Button>
        </div>

        <PaymentsTable data={data?.transactions ?? []} isLoading={isLoading} />
      </Card>
    </div>
  );
}
