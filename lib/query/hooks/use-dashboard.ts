import { useQuery } from "@tanstack/react-query";

import { qk } from "@/lib/query/keys";
import { getDashboardSummary } from "@/lib/api/services/dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: qk.dashboard.summary(),
    queryFn: getDashboardSummary,
  });
}
