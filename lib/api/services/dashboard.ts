import { api } from "@/lib/api/client";
import { formatNaira } from "@/lib/utils";
import { MOCKS, mockDelay } from "@/lib/api/mock/config";
import { MOCK_DASHBOARD } from "@/lib/api/mock/dashboard";
import type { ActivityItem, DashboardStat, DashboardSummary } from "@/types/dashboard";

/** GET /admin/dashboard/stats -> data */
interface AdminDashboardStats {
  activeShipments: number;
  delivered: number;
  activeUser: number;
  revenue: number;
}

/** Best-effort shape of an activity-feed item (unverified — data empty on dev). */
interface RawActivity {
  id?: string;
  type?: string;
  kind?: string;
  title?: string;
  message?: string;
  description?: string;
  meta?: string;
  createdAt?: string;
  time?: string;
}

const KIND_MAP: Record<string, ActivityItem["kind"]> = {
  booking: "booking",
  payment: "payment",
  shipment: "shipment",
  quote: "quote",
};

function mapActivity(raw: RawActivity, i: number): ActivityItem {
  const rawKind = (raw.kind ?? raw.type ?? "").toLowerCase();
  return {
    id: raw.id ?? String(i),
    kind: KIND_MAP[rawKind] ?? "shipment",
    title: raw.title ?? raw.message ?? raw.description ?? "Activity",
    meta: raw.meta ?? raw.createdAt ?? raw.time ?? "",
  };
}

/** Build the 6 stat cards from 4 live metrics + 2 demo (no endpoint) cards. */
function buildStats(live: AdminDashboardStats): DashboardStat[] {
  const demoBookings = MOCK_DASHBOARD.stats.find((s) => s.key === "bookings");
  const demoQuotes = MOCK_DASHBOARD.stats.find((s) => s.key === "quotes");
  return [
    { ...demoBookings!, demo: true },
    { key: "active", label: "Active Shipments", value: String(live.activeShipments) },
    { key: "revenue", label: "Revenue", value: formatNaira(live.revenue) },
    { ...demoQuotes!, demo: true },
    { key: "delivered", label: "Delivered", value: String(live.delivered) },
    { key: "users", label: "Active Users", value: String(live.activeUser) },
  ];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (MOCKS.dashboardStats && MOCKS.activity) {
    return mockDelay(MOCK_DASHBOARD);
  }

  const [stats, activityRaw] = await Promise.all([
    MOCKS.dashboardStats
      ? Promise.resolve<AdminDashboardStats>({
          activeShipments: 0,
          delivered: 0,
          activeUser: 0,
          revenue: 0,
        })
      : api.get<AdminDashboardStats>("/admin/dashboard/stats"),
    MOCKS.activity
      ? Promise.resolve<RawActivity[]>([])
      : api.get<RawActivity[]>("/admin/dashboard/activity-feed"),
  ]);

  return {
    stats: buildStats(stats),
    // No bookings endpoint yet — Recent Bookings stays demo data.
    recentBookings: MOCK_DASHBOARD.recentBookings,
    activity: (activityRaw ?? []).map(mapActivity),
  };
}
