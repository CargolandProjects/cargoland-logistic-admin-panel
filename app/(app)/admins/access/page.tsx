"use client";

import {
  LayoutGrid,
  Truck,
  Warehouse,
  Wallet,
  Tag,
  Users,
  ShieldCheck,
  Bell,
  Eye,
  Lock,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccess } from "@/lib/query/hooks/use-access";
import { useAccessStore } from "@/stores/access-store";
import { PAGE_KEYS, PAGE_LABELS, type PageKey } from "@/types/permissions";
import { ROLE_LABELS, ROLE_OPTIONS, type Role } from "@/types/auth";

const PAGE_ICON: Record<PageKey, LucideIcon> = {
  dashboard: LayoutGrid,
  shipments: Truck,
  fleet: Warehouse,
  payments: Wallet,
  pricing: Tag,
  users: Users,
  admins: ShieldCheck,
  notifications: Bell,
};

const ROLE_DOT: Record<Role, string> = {
  SUPER_ADMIN: "bg-indigo-500",
  OPERATIONS_ADMIN: "bg-blue-500",
  SUPPORT_ADMIN: "bg-green-500",
};

export default function ManageAccessPage() {
  const matrix = useAccessStore((s) => s.matrix);
  const setPermission = useAccessStore((s) => s.setPermission);
  const resetMatrix = useAccessStore((s) => s.resetMatrix);
  const previewRole = useAccessStore((s) => s.previewRole);
  const setPreviewRole = useAccessStore((s) => s.setPreviewRole);
  const clearPreviewRole = useAccessStore((s) => s.clearPreviewRole);
  const { effectiveRole, isPreview } = useAccess();

  const editable = !isPreview && effectiveRole === "SUPER_ADMIN";

  return (
    <div className="space-y-6">
      {/* Preview as role */}
      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Eye className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold">Preview as role</h2>
            <p className="text-sm text-muted-foreground">
              View the whole app as another role to test access. A reload clears it.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={previewRole ?? ""} onValueChange={(v) => setPreviewRole(v as Role)}>
            <SelectTrigger className="h-9 min-w-[180px]">
              <SelectValue>
                {(v) => (v ? (ROLE_LABELS[v as Role] ?? (v as string)) : "Select a role")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={clearPreviewRole} disabled={!isPreview}>
            Exit preview
          </Button>
        </div>
      </Card>

      {/* Access matrix */}
      <Card className="gap-0 p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="text-base font-semibold">Page access by role</h2>
            <p className="text-sm text-muted-foreground">
              Toggle which pages each role can view.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={resetMatrix} disabled={!editable}>
            <RotateCcw className="size-4" /> Reset to defaults
          </Button>
        </div>

        {!editable && (
          <p className="mx-5 mt-4 rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground">
            {isPreview ? "Exit preview to edit access." : "Only a Super Admin can edit access."}
          </p>
        )}

        <div className="overflow-x-auto p-2">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
                  Page
                </TableHead>
                {ROLE_OPTIONS.map((r) => (
                  <TableHead key={r.value} className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <span className={cn("size-2 rounded-full", ROLE_DOT[r.value])} />
                        {r.label}
                      </span>
                      {r.value === "SUPER_ADMIN" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          <Lock className="size-3" /> Full access
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {PAGE_KEYS.map((page) => {
                const Icon = PAGE_ICON[page];
                return (
                  <TableRow key={page}>
                    <TableCell>
                      <span className="inline-flex items-center gap-2.5 font-medium text-foreground">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                          <Icon className="size-4" />
                        </span>
                        {PAGE_LABELS[page]}
                      </span>
                    </TableCell>
                    {ROLE_OPTIONS.map((r) => {
                      const role = r.value;
                      const isSuper = role === "SUPER_ADMIN";
                      return (
                        <TableCell key={role} className="text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={isSuper ? true : matrix[role][page]}
                              onCheckedChange={(checked) => setPermission(role, page, checked)}
                              disabled={!editable || isSuper}
                            />
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <p className="border-t border-border p-5 text-xs text-muted-foreground">
          Client-side for now — this configuration lives in your browser until the backend
          implements the permissions API (see <code>docs/permissions-api-spec.md</code>).
          Dashboard is always accessible, and Super Admin always has full access.
        </p>
      </Card>
    </div>
  );
}
