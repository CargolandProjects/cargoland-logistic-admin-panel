import { api } from "@/lib/api/client";
import { formatNaira } from "@/lib/utils";
import { MOCKS, mockDelay } from "@/lib/api/mock/config";
import { MOCK_DASHBOARD, MOCK_DASHBOARD_ANALYTICS } from "@/lib/api/mock/dashboard";
import { getShipmentsPage } from "@/lib/api/services/shipments";
import { getSummary } from "@/lib/api/services/payments";
import type {
  ActivityItem,
  DashboardAnalytics,
  DashboardStat,
  DashboardSummary,
  RecentBooking,
} from "@/types/dashboard";
import { SHIPMENT_STATUS_LABELS, type Shipment, type ShipmentStatus, type ShipmentType } from "@/types/shipment";

/** GET /admin/dashboard/stats -> data */
interface AdminDashboardStats {
  activeShipments: number;
  delivered: number;
  activeUser: number;
  revenue: number;
}

/** Live activity-feed item: { type, id, message, timestamp, user }. */
interface RawActivity {
  id?: string;
  type?: string;
  kind?: string;
  title?: string;
  message?: string;
  description?: string;
  meta?: string;
  timestamp?: string;
  createdAt?: string;
  time?: string;
  user?: string;
}

const KIND_MAP: Record<string, ActivityItem["kind"]> = {
  booking: "booking",
  payment: "payment",
  shipment: "shipment",
  quote: "quote",
};

function formatDateTime(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapActivity(raw: RawActivity, i: number): ActivityItem {
  const rawKind = (raw.kind ?? raw.type ?? "").toLowerCase();
  const when = formatDateTime(raw.timestamp ?? raw.createdAt ?? raw.time);
  return {
    id: raw.id ?? String(i),
    kind: KIND_MAP[rawKind] ?? "shipment",
    title: raw.title ?? raw.message ?? raw.description ?? "Activity",
    meta: [when, raw.user].filter(Boolean).join(" · ") || raw.meta || "",
  };
}

function toRecentBooking(s: Shipment): RecentBooking {
  return {
    id: s.id,
    trackingId: s.trackingId,
    customer: s.customer,
    type: s.type,
    status: s.status,
  };
}

/** Build the 6 stat cards from live dashboard stats + shipment counts. */
function buildStats(
  live: AdminDashboardStats,
  totalBookings: number,
  pendingCount: number,
): DashboardStat[] {
  return [
    { key: "bookings", label: "Total Bookings", value: String(totalBookings) },
    { key: "active", label: "Active Shipments", value: String(live.activeShipments) },
    { key: "revenue", label: "Revenue", value: formatNaira(live.revenue) },
    { key: "quotes", label: "Pending Quotes", value: String(pendingCount) },
    { key: "delivered", label: "Delivered", value: String(live.delivered) },
    { key: "users", label: "Active Users", value: String(live.activeUser) },
  ];
}

// --- Analytics (dashboard charts) -------------------------------------------

/** Status color, mirroring the StatusBadge tone concept (see status-badge.tsx). */
const STATUS_COLORS: Record<ShipmentStatus, string> = {
  PENDING: "#f59e0b",
  ASSIGNED: "#2563eb",
  PICKED_UP: "#0891b2",
  AT_ORIGIN_HUB: "#d97706",
  IN_TRANSIT: "#4338ca",
  CUSTOM_CLEARANCE: "#6a2bb0",
  DESTINATION: "#0d9488",
  DELIVERED: "#16a34a",
  CANCELLED: "#e5392f",
};

// Stable order for the status buckets (low → delivered → cancelled).
const STATUS_ORDER: ShipmentStatus[] = [
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "AT_ORIGIN_HUB",
  "IN_TRANSIT",
  "CUSTOM_CLEARANCE",
  "DESTINATION",
  "DELIVERED",
  "CANCELLED",
];

const TYPE_COLORS: Record<ShipmentType, string> = {
  Local: "#4338ca",
  International: "#f59e0b",
};
const TYPES: ShipmentType[] = ["Local", "International"];

/**
 * Aggregate the dashboard chart data. The backend has no group-by endpoint, so
 * we read exact per-bucket counts from `getShipmentsPage(...).total` — 9 status
 * + 2 type + 1 payments summary = 12 tiny parallel `take:1` requests. Kept in a
 * separate hook so it never blocks the primary stat cards.
 */
export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  if (MOCKS.shipments && MOCKS.payments) return mockDelay(MOCK_DASHBOARD_ANALYTICS);

  const [statusTotals, typeTotals, payments] = await Promise.all([
    Promise.all(STATUS_ORDER.map((status) => getShipmentsPage({ status, take: 1 }).then((r) => r.total))),
    Promise.all(TYPES.map((type) => getShipmentsPage({ type, take: 1 }).then((r) => r.total))),
    getSummary(),
  ]);

  return {
    statusCounts: STATUS_ORDER.map((status, i) => ({
      status,
      label: SHIPMENT_STATUS_LABELS[status],
      value: statusTotals[i],
      color: STATUS_COLORS[status],
    })),
    typeCounts: TYPES.map((type, i) => ({
      type,
      value: typeTotals[i],
      color: TYPE_COLORS[type],
    })),
    payments,
  };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (MOCKS.dashboardStats && MOCKS.activity) {
    return mockDelay(MOCK_DASHBOARD);
  }

  const [stats, activityRaw, recent, pending] = await Promise.all([
    api.get<AdminDashboardStats>("/admin/dashboard/stats"),
    api.get<RawActivity[]>("/admin/dashboard/activity-feed"),
    // Recent shipments (also yields the total bookings count). Fetch a page's
    // worth so the Recent Bookings table can paginate 5-at-a-time client-side.
    getShipmentsPage({ skip: 0, take: 25 }),
    // Pending shipment count (used for the "Pending Quotes" card).
    getShipmentsPage({ skip: 0, take: 1, status: "PENDING" }),
  ]);

  return {
    stats: buildStats(stats, recent.total, pending.total),
    recentBookings: recent.data.map(toRecentBooking),
    activity: (activityRaw ?? []).map(mapActivity),
  };
}
