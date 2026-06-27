import { api } from "@/lib/api/client";
import { formatNaira } from "@/lib/utils";
import { MOCKS, mockDelay } from "@/lib/api/mock/config";
import { MOCK_DASHBOARD } from "@/lib/api/mock/dashboard";
import { getShipmentsPage } from "@/lib/api/services/shipments";
import type { ActivityItem, DashboardStat, DashboardSummary, RecentBooking } from "@/types/dashboard";
import type { Shipment } from "@/types/shipment";

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

export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (MOCKS.dashboardStats && MOCKS.activity) {
    return mockDelay(MOCK_DASHBOARD);
  }

  const [stats, activityRaw, recent, pending] = await Promise.all([
    api.get<AdminDashboardStats>("/admin/dashboard/stats"),
    api.get<RawActivity[]>("/admin/dashboard/activity-feed"),
    // Recent shipments (also yields the total bookings count).
    getShipmentsPage({ skip: 0, take: 5 }),
    // Pending shipment count (used for the "Pending Quotes" card).
    getShipmentsPage({ skip: 0, take: 1, status: "PENDING" }),
  ]);

  return {
    stats: buildStats(stats, recent.total, pending.total),
    recentBookings: recent.data.map(toRecentBooking),
    activity: (activityRaw ?? []).map(mapActivity),
  };
}
