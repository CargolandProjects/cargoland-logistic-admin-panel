import type { ShipmentStatus, ShipmentType } from "@/types/shipment";
import type { PaymentSummary } from "@/types/payment";

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

// --- Analytics (dashboard charts) -------------------------------------------
// `color` is baked in the service so the chart components stay presentational.

export interface StatusDatum {
  status: ShipmentStatus;
  label: string;
  value: number;
  color: string;
}

export interface TypeDatum {
  type: ShipmentType;
  value: number;
  color: string;
}

export interface DashboardAnalytics {
  /** All statuses (value may be 0; charts drop empty slices). */
  statusCounts: StatusDatum[];
  typeCounts: TypeDatum[];
  payments: PaymentSummary;
}
