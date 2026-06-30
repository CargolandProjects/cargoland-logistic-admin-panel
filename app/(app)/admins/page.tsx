"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column, type RowAction } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { CreateAdminDialog } from "@/components/features/admins/create-admin-dialog";
import { useAdmins, useAdminLogs, useUpdateAdminStatus } from "@/lib/query/hooks/use-admins";
import { ROLE_LABELS, type AdminListItem, type AdminLog } from "@/types/auth";

const LOG_ACTIONS = [
  "CREATED_ADMIN",
  "SETUP_PASSWORD",
  "LOGIN",
  "LOGOUT",
  "UPDATED_PROFILE",
  "CHANGED_PASSWORD",
  "RESENT_INVITATION",
  "VERIFIED_EMAIL",
  "DEACTIVATED_ADMIN",
  "ACTIVATED_ADMIN",
  "CREATED_PRICING",
  "UPDATED_PRICING",
  "DELETED_PRICING",
  "CREATED_DRIVER",
  "UPDATED_DRIVER",
  "DELETED_DRIVER",
  "CREATED_VEHICLE",
  "UPDATED_VEHICLE",
  "DELETED_VEHICLE",
];

function humanize(s: string): string {
  return s
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function AdminsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [logAction, setLogAction] = useState("all");

  const { data: admins, isLoading } = useAdmins();
  const logParams = useMemo(() => ({ action: logAction }), [logAction]);
  const { data: logs, isLoading: logsLoading } = useAdminLogs(logParams);
  const statusMutation = useUpdateAdminStatus();

  const adminColumns: Column<AdminListItem>[] = [
    {
      header: "Name",
      cell: (r) => (
        <span className="font-medium">{`${r.firstName} ${r.lastName}`.trim() || "—"}</span>
      ),
    },
    { header: "Email", cell: (r) => r.email || "—" },
    { header: "Role", cell: (r) => ROLE_LABELS[r.role] ?? r.role },
    {
      header: "Status",
      cell: (r) => (r.status ? <StatusBadge status={r.status} /> : "—"),
    },
  ];

  const adminActions: RowAction<AdminListItem>[] = [
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

  const logColumns: Column<AdminLog>[] = [
    { header: "Action", cell: (r) => <span className="font-medium">{humanize(r.action)}</span> },
    { header: "Admin", cell: (r) => r.adminName ?? "—" },
    { header: "Detail", cell: (r) => <span className="text-muted-foreground">{r.meta ?? "—"}</span> },
    { header: "Date", cell: (r) => <span className="text-muted-foreground">{r.createdAt ?? "—"}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admins"
        subtitle="Manage admin accounts, roles and activity."
        actions={
          <Button className="bg-brand-red text-white" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add Admin
          </Button>
        }
      />

      <Card className="p-2">
        <DataTable
          columns={adminColumns}
          data={admins ?? []}
          rowKey={(r) => r.id}
          actions={adminActions}
          isLoading={isLoading}
          pageSize={10}
          emptyMessage="No admins found."
        />
      </Card>

      <Card className="gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Activity Logs</h2>
          <Select value={logAction} onValueChange={(v) => setLogAction(v as string)}>
            <SelectTrigger className="h-9 min-w-[180px]">
              <SelectValue>
                {(v) => (v === "all" ? "All Actions" : humanize(v as string))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {LOG_ACTIONS.map((a) => (
                <SelectItem key={a} value={a}>
                  {humanize(a)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DataTable
          columns={logColumns}
          data={logs ?? []}
          rowKey={(r) => r.id}
          isLoading={logsLoading}
          pageSize={10}
          emptyMessage="No activity yet."
        />
      </Card>

      <CreateAdminDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
