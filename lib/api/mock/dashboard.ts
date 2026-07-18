import type { DashboardAnalytics, DashboardSummary } from "@/types/dashboard";

export const MOCK_DASHBOARD: DashboardSummary = {
  stats: [
    { key: "bookings", label: "Total Bookings", value: "1,284", trend: "+12% this month", trendDirection: "up" },
    { key: "active", label: "Active Shipments", value: "347", trend: "+12% this week", trendDirection: "up" },
    { key: "revenue", label: "Revenue", value: "₦8.4M", trend: "+12% this month", trendDirection: "up" },
    { key: "quotes", label: "Pending Quotes", value: "24", trend: "4 since yesterday", trendDirection: "up" },
    { key: "delivered", label: "Delivered", value: "1,284", trend: "+12% this month", trendDirection: "up" },
    { key: "users", label: "Active Users", value: "347", trend: "+12% this week", trendDirection: "up" },
  ],
  recentBookings: [
    { id: "BK-0091", trackingId: "CLD-0091", customer: "Emeka Obi", type: "International", status: "PENDING" },
    { id: "BK-0092", trackingId: "CLD-0092", customer: "Fatima Yusuf", type: "Local", status: "ASSIGNED" },
    { id: "BK-0093", trackingId: "CLD-0093", customer: "Chidi Nwosu", type: "International", status: "IN_TRANSIT" },
    { id: "BK-0094", trackingId: "CLD-0094", customer: "Amara Eze", type: "Local", status: "DELIVERED" },
  ],
  activity: [
    { id: "a1", kind: "booking", title: "New booking #BK-0091 submitted", meta: "2 minutes ago · Emeka Obi" },
    { id: "a2", kind: "payment", title: "Payment received for #BK-0087", meta: "18 minutes ago · ₦450,000" },
    { id: "a3", kind: "shipment", title: "Shipment #SH-0034 marked In Transit", meta: "18 minutes ago · ₦450,000" },
    { id: "a4", kind: "quote", title: "Quote requested on #BK-0090", meta: "2 hours ago · Fatima Yusuf" },
  ],
};

/** Demo analytics used when both shipments + payments are mocked. */
export const MOCK_DASHBOARD_ANALYTICS: DashboardAnalytics = {
  statusCounts: [
    { status: "PENDING", label: "Pending", value: 42, color: "#f59e0b" },
    { status: "ASSIGNED", label: "Assigned", value: 18, color: "#2563eb" },
    { status: "PICKED_UP", label: "Picked Up", value: 9, color: "#0891b2" },
    { status: "AT_ORIGIN_HUB", label: "At Origin Hub", value: 6, color: "#d97706" },
    { status: "IN_TRANSIT", label: "In Transit", value: 63, color: "#4338ca" },
    { status: "CUSTOM_CLEARANCE", label: "Customs Clearance", value: 4, color: "#6a2bb0" },
    { status: "DESTINATION", label: "At Destination", value: 11, color: "#0d9488" },
    { status: "DELIVERED", label: "Delivered", value: 128, color: "#16a34a" },
    { status: "CANCELLED", label: "Cancelled", value: 7, color: "#e5392f" },
  ],
  typeCounts: [
    { type: "Local", value: 214, color: "#4338ca" },
    { type: "International", value: 84, color: "#f59e0b" },
  ],
  payments: { totalCollected: 8420000, pending: 1240000, failed: 110000 },
};
