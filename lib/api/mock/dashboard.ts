import type { DashboardSummary } from "@/types/dashboard";

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
    { id: "#BK-0091", customer: "Emeka Obi", type: "Int'l", status: "Pending" },
    { id: "#BK-0092", customer: "Fatima Yusuf", type: "Local", status: "Approved" },
    { id: "#BK-0093", customer: "Chidi Nwosu", type: "Int'l", status: "In transit" },
    { id: "#BK-0094", customer: "Amara Eze", type: "Door-to-Door", status: "In transit" },
  ],
  activity: [
    { id: "a1", kind: "booking", title: "New booking #BK-0091 submitted", meta: "2 minutes ago · Emeka Obi" },
    { id: "a2", kind: "payment", title: "Payment received for #BK-0087", meta: "18 minutes ago · ₦450,000" },
    { id: "a3", kind: "shipment", title: "Shipment #SH-0034 marked In Transit", meta: "18 minutes ago · ₦450,000" },
    { id: "a4", kind: "quote", title: "Quote requested on #BK-0090", meta: "2 hours ago · Fatima Yusuf" },
  ],
};
