"use client";

import { useMemo, useState } from "react";
import { Plus, Users, UserCheck, UserX, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable, type Column, type RowAction } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { CreateAdminDialog } from "@/components/features/admins/create-admin-dialog";
import { useAdmins, useUpdateAdminStatus } from "@/lib/query/hooks/use-admins";
import { ROLE_LABELS, type AdminListItem, type Role } from "@/types/auth";

const ROLE_TONE: Record<Role, "purple" | "blue" | "green"> = {
  SUPER_ADMIN: "purple",
  OPERATIONS_ADMIN: "blue",
  SUPPORT_ADMIN: "green",
};

function initialsOf(a: AdminListItem): string {
  const fi = a.firstName?.[0] ?? "";
  const li = a.lastName?.[0] ?? "";
  return (fi + li).toUpperCase() || a.email?.[0]?.toUpperCase() || "?";
}

export default function AdminsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const { data: admins, isLoading } = useAdmins();
  const statusMutation = useUpdateAdminStatus();

  const stats = useMemo(() => {
    const list = admins ?? [];
    return {
      total: list.length,
      active: list.filter((a) => a.status === "ACTIVE").length,
      deactivated: list.filter((a) => a.status === "DEACTIVATED").length,
      supers: list.filter((a) => a.role === "SUPER_ADMIN").length,
    };
  }, [admins]);

  const columns: Column<AdminListItem>[] = [
    {
      header: "Admin",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initialsOf(r)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-foreground">
              {`${r.firstName} ${r.lastName}`.trim() || "—"}
            </p>
            <p className="truncate text-xs text-muted-foreground">{r.email || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (r) => <StatusBadge status={ROLE_LABELS[r.role] ?? r.role} tone={ROLE_TONE[r.role]} />,
    },
    {
      header: "Status",
      headClassName: "text-right",
      className: "text-right",
      cell: (r) => (r.status ? <StatusBadge status={r.status} /> : "—"),
    },
  ];

  const actions: RowAction<AdminListItem>[] = [
    {
      label: "Activate",
      onSelect: (r) => statusMutation.mutate({ adminId: r.id, status: "ACTIVE" }),
    },
    {
      label: "Deactivate",
      destructive: true,
      onSelect: (r) => statusMutation.mutate({ adminId: r.id, status: "DEACTIVATED" }),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Admins" value={stats.total} />
        <StatCard icon={UserCheck} label="Active" value={stats.active} />
        <StatCard icon={UserX} label="Deactivated" value={stats.deactivated} />
        <StatCard icon={ShieldCheck} label="Super Admins" value={stats.supers} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">All Admins</h2>
        <Button className="bg-brand-red text-white" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" /> Add Admin
        </Button>
      </div>

      <Card className="p-2">
        <DataTable
          columns={columns}
          data={admins ?? []}
          rowKey={(r) => r.id}
          actions={actions}
          isLoading={isLoading}
          pageSize={8}
          emptyMessage="No admins found."
        />
      </Card>

      <CreateAdminDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
