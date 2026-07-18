import type { Role } from "@/types/auth";

/** One key per top-level nav page that RBAC gates. */
export type PageKey =
  | "dashboard"
  | "shipments"
  | "fleet"
  | "payments"
  | "pricing"
  | "users"
  | "admins"
  | "notifications";

/** In nav order — drives the Manage Access matrix rows. */
export const PAGE_KEYS: PageKey[] = [
  "dashboard",
  "shipments",
  "fleet",
  "payments",
  "pricing",
  "users",
  "admins",
  "notifications",
];

export const PAGE_LABELS: Record<PageKey, string> = {
  dashboard: "Dashboard",
  shipments: "Shipments",
  fleet: "Fleet",
  payments: "Payments",
  pricing: "Pricing",
  users: "Users",
  admins: "Admins",
  notifications: "Notifications",
};

/**
 * Page → route. Kept here (not imported from `lib/nav.ts`) so `types/` stays free of
 * that module's `lucide-react` dependency. Must stay in sync with `NAV_GROUPS` hrefs.
 */
export const PAGE_HREF: Record<PageKey, string> = {
  dashboard: "/dashboard",
  shipments: "/shipments",
  fleet: "/fleet",
  payments: "/payments",
  pricing: "/pricing",
  users: "/users",
  admins: "/admins",
  notifications: "/notifications",
};

export type PermissionMatrix = Record<Role, Record<PageKey, boolean>>;

const ALL: Record<PageKey, boolean> = {
  dashboard: true,
  shipments: true,
  fleet: true,
  payments: true,
  pricing: true,
  users: true,
  admins: true,
  notifications: true,
};

function only(keys: PageKey[]): Record<PageKey, boolean> {
  const base = { ...ALL };
  for (const k of PAGE_KEYS) base[k] = keys.includes(k);
  return base;
}

/** Seed matrix (editable in Manage Access). Dashboard is always allowed at the gate. */
export const DEFAULT_MATRIX: PermissionMatrix = {
  SUPER_ADMIN: { ...ALL },
  OPERATIONS_ADMIN: only(["dashboard", "shipments", "fleet", "pricing", "payments"]),
  SUPPORT_ADMIN: only(["dashboard", "shipments", "users", "notifications"]),
};

/**
 * Map a pathname to the page key it belongs to (longest matching route prefix).
 * Unknown routes return null — callers treat null as "allowed".
 */
export function pageKeyForPath(pathname: string): PageKey | null {
  let best: PageKey | null = null;
  let bestLen = -1;
  for (const key of PAGE_KEYS) {
    const href = PAGE_HREF[key];
    if ((pathname === href || pathname.startsWith(href + "/")) && href.length > bestLen) {
      best = key;
      bestLen = href.length;
    }
  }
  return best;
}
