import type { ShipmentStatus, ShipmentType } from "@/types/shipment";

export interface DashboardStat {
  key: string;
  label: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down";
}

/** A recent booking row (sourced from recent shipments). */
export interface RecentBooking {
  id: string;
  trackingId: string;
  customer: string;
  type: ShipmentType;
  status: ShipmentStatus;
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
