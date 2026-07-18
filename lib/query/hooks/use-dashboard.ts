import { useQuery } from "@tanstack/react-query";

import { qk } from "@/lib/query/keys";
import { getDashboardAnalytics, getDashboardSummary } from "@/lib/api/services/dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: qk.dashboard.summary(),
    queryFn: getDashboardSummary,
  });
}

/** Chart data — separate from useDashboard so its extra requests don't block the stat cards. */
export function useDashboardAnalytics() {
  return useQuery({
    queryKey: qk.dashboard.analytics(),
    queryFn: getDashboardAnalytics,
  });
}
