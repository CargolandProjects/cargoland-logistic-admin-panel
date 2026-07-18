"use client";

import { useMemo, useState } from "react";

import { formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/components/shared/data-table";
import { useAdminLogs } from "@/lib/query/hooks/use-admins";
import type { AdminLog } from "@/types/auth";

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

export default function ActivityLogPage() {
  const [logAction, setLogAction] = useState("all");
  const logParams = useMemo(() => ({ action: logAction }), [logAction]);
  const { data: logs, isLoading } = useAdminLogs(logParams);

  const columns: Column<AdminLog>[] = [
    { header: "Action", cell: (r) => <span className="font-medium">{humanize(r.action)}</span> },
    { header: "Admin", cell: (r) => r.adminName ?? "—" },
    { header: "Detail", cell: (r) => <span className="text-muted-foreground">{r.meta ?? "—"}</span> },
    {
      header: "Date",
      cell: (r) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDateTime(r.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <Card className="gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Activity Log</h2>
        <Select value={logAction} onValueChange={(v) => setLogAction(v as string)}>
          <SelectTrigger className="h-9 min-w-[180px]">
            <SelectValue>{(v) => (v === "all" ? "All Actions" : humanize(v as string))}</SelectValue>
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
        columns={columns}
        data={logs ?? []}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        pageSize={10}
        emptyMessage="No activity yet."
      />
    </Card>
  );
}
