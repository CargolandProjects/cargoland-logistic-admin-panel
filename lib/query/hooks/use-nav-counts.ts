import { useQueries } from "@tanstack/react-query";

import { apiList } from "@/lib/api/client";
import { qk } from "@/lib/query/keys";

/** Total row count for a paginated list endpoint (reads `meta.total`). */
async function countFrom(url: string): Promise<number> {
  const res = await apiList.get<Record<string, unknown>>(url);
  return res.meta?.total ?? res.data?.length ?? 0;
}

/**
 * Live totals for the sidebar badges, keyed by nav href. Each is a tiny
 * `take=1`/`limit=1` request (only `meta.total` is needed) and is filed under
 * its domain key, so the count refreshes when that domain mutates.
 */
export function useNavCounts(): Record<string, number> {
  const results = useQueries({
    queries: [
      {
        queryKey: [...qk.shipments.all, "count"],
        queryFn: () => countFrom("/admin/shipments?skip=0&take=1"),
      },
      {
        queryKey: [...qk.vehicles.all, "count"],
        queryFn: () => countFrom("/admin/vehicle?page=1&limit=1"),
      },
      {
        queryKey: [...qk.payments.all, "count"],
        queryFn: () => countFrom("/admin/payments?skip=0&take=1"),
      },
      {
        queryKey: [...qk.pricing.all, "count"],
        queryFn: () => countFrom("/admin/pricing?page=1&limit=1"),
      },
    ],
  });

  return {
    "/shipments": results[0].data ?? 0,
    "/fleet": results[1].data ?? 0,
    "/payments": results[2].data ?? 0,
    "/pricing": results[3].data ?? 0,
  };
}
