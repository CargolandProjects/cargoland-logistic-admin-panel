import { api, apiList } from "@/lib/api/client";
import type {
  AdminListItem,
  AdminLog,
  CreateAdminInput,
  Role,
  UpdateAdminStatusInput,
} from "@/types/auth";

export interface AdminListParams {
  page?: number;
  limit?: number;
}

export interface LogListParams {
  page?: number;
  limit?: number;
  action?: string;
  adminId?: string;
}

/** Coerce a value to a safe display string ("" for objects/null). */
function str(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

/** Derive a person's display name from a string or a nested {firstName,...} object. */
function personName(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    const full = `${str(o.firstName)} ${str(o.lastName)}`.trim();
    return full || str(o.name) || str(o.email) || str(o.id) || undefined;
  }
  return undefined;
}

function mapAdmin(raw: Record<string, unknown>, i: number): AdminListItem {
  // Some responses nest the person under `admin`/`user`; fall back to that.
  const nested = raw.admin ?? raw.user;
  const p = (nested && typeof nested === "object" ? nested : raw) as Record<string, unknown>;
  return {
    id: str(raw.id ?? p.id) || String(i),
    firstName: str(p.firstName),
    lastName: str(p.lastName),
    email: str(p.email ?? raw.email),
    role: ((raw.role ?? p.role) as Role) ?? "SUPPORT_ADMIN",
    status: (raw.status ?? p.status) as AdminListItem["status"],
    createdAt: (raw.createdAt ?? p.createdAt) as string | undefined,
  };
}

function mapLog(raw: Record<string, unknown>, i: number): AdminLog {
  return {
    id: str(raw.id) || String(i),
    action: str(raw.action),
    adminName:
      personName(raw.adminName) ?? personName(raw.admin) ?? (str(raw.adminId) || undefined),
    meta: str(raw.meta) || str(raw.description) || undefined,
    createdAt: (raw.createdAt as string) ?? undefined,
  };
}

export async function listAdmins(params: AdminListParams = {}): Promise<AdminListItem[]> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 50));
  const res = await apiList.get<Record<string, unknown>>(`/admin/all?${qs.toString()}`);
  return res.data.map(mapAdmin);
}

export async function createAdmin(body: CreateAdminInput): Promise<AdminListItem> {
  return api.post<AdminListItem>("/admin/create", body);
}

export async function updateAdminStatus(body: UpdateAdminStatusInput): Promise<void> {
  await api.patch("/admin/status", body);
}

export async function listAdminLogs(params: LogListParams = {}): Promise<AdminLog[]> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 20));
  if (params.action && params.action !== "all") qs.set("action", params.action);
  if (params.adminId) qs.set("adminId", params.adminId);
  const res = await apiList.get<Record<string, unknown>>(`/admin/logs?${qs.toString()}`);
  return res.data.map(mapLog);
}
