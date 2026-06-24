export interface DashboardStat {
  key: string;
  label: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down";
  /** True when this card is backed by mock data (no live endpoint yet). */
  demo?: boolean;
}

export interface RecentBooking {
  id: string;
  customer: string;
  type: "Local" | "Int'l" | "Door-to-Door";
  status: "Pending" | "Approved" | "In transit" | "Delivered" | "Rejected";
}

export interface ActivityItem {
  id: string;
  kind: "booking" | "payment" | "shipment" | "quote";
  title: string;
  meta: string;
}

export interface DashboardSummary {
  stats: DashboardStat[];
  recentBookings: RecentBooking[];
  activity: ActivityItem[];
}
