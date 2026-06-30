"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users as UsersIcon, Package, Wallet, CheckCircle2 } from "lucide-react";

import { formatNaira, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable, type Column, type RowAction } from "@/components/shared/data-table";
import { useCustomers } from "@/lib/query/hooks/use-customers";
import type { Customer } from "@/types/customer";

export default function UsersPage() {
  const router = useRouter();
  const { data: customers, isLoading } = useCustomers();
  const [search, setSearch] = useState("");

  const stats = useMemo(() => {
    const list = customers ?? [];
    return {
      total: list.length,
      bookings: list.reduce((s, c) => s + c.bookings, 0),
      revenue: list.reduce((s, c) => s + c.totalSpent, 0),
      delivered: list.reduce((s, c) => s + c.delivered, 0),
    };
  }, [customers]);

  const rows = useMemo(() => {
    const list = customers ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [customers, search]);

  const columns: Column<Customer>[] = [
    {
      header: "User",
      cell: (c) => <span className="font-medium text-foreground">{c.name || "—"}</span>,
    },
    { header: "Email", cell: (c) => c.email || "—" },
    { header: "Phone", cell: (c) => c.phone || "—" },
    { header: "Bookings", cell: (c) => c.bookings },
    {
      header: "Total Spent",
      cell: (c) => <span className="font-medium">{formatNaira(c.totalSpent)}</span>,
    },
    {
      header: "Last Active",
      cell: (c) => <span className="text-muted-foreground">{formatDate(c.lastActive)}</span>,
    },
  ];

  const actions: RowAction<Customer>[] = [
    { label: "View Profile", onSelect: (c) => router.push(`/users/${encodeURIComponent(c.id)}`) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle="Customer accounts derived from shipment activity." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Customers" value={stats.total} icon={UsersIcon} iconClassName="bg-indigo-100 text-indigo-600" />
        <StatCard label="Total Shipments" value={stats.bookings} icon={Package} iconClassName="bg-blue-100 text-blue-600" />
        <StatCard label="Total Revenue" value={formatNaira(stats.revenue)} icon={Wallet} iconClassName="bg-green-100 text-green-600" />
        <StatCard label="Delivered" value={stats.delivered} icon={CheckCircle2} iconClassName="bg-emerald-100 text-emerald-600" />
      </div>

      <Card className="gap-4 p-5">
        <div className="relative min-w-[240px] max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="h-10 pl-9"
          />
        </div>
        <DataTable
          columns={columns}
          data={rows}
          rowKey={(c) => c.id}
          actions={actions}
          onRowClick={(c) => router.push(`/users/${encodeURIComponent(c.id)}`)}
          isLoading={isLoading}
          pageSize={10}
          emptyMessage="No customers yet."
        />
      </Card>
    </div>
  );
}
