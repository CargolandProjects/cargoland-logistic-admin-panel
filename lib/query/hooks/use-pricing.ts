import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { qk } from "@/lib/query/keys";
import {
  listPricing,
  getPricing,
  createPricing,
  updatePricing,
  deletePricing,
  setPopularRoute,
} from "@/lib/api/services/pricing";
import { toastApiError } from "@/lib/api/form-errors";
import type { Pricing, PricingInput } from "@/types/pricing";

export function usePricing() {
  return useQuery({
    queryKey: qk.pricing.list(),
    queryFn: () => listPricing(),
  });
}

export function usePricingDetail(id: string) {
  return useQuery({
    queryKey: qk.pricing.detail(id),
    queryFn: () => getPricing(id),
    enabled: Boolean(id),
  });
}

/**
 * INTERIM: the list endpoint (`GET /admin/pricing`) returns only one bracket per
 * freight type per row, while the detail endpoint returns the full set. Fetch
 * each international row's detail (parallel, cached under `qk.pricing.detail`) and
 * merge its complete `pricingBrackets` back in, so the table's range dropdown and
 * prices are complete. Remove once the backend list returns full brackets
 * (docs/pricing-list-brackets-spec.md). Shares cache with `usePricingDetail`.
 */
export function usePricingBracketsHydration(rows: Pricing[]): {
  rows: Pricing[];
  isHydrating: boolean;
} {
  const intlIds = rows.filter((r) => r.shipmentType === "INTERNATIONAL").map((r) => r.id);

  const results = useQueries({
    queries: intlIds.map((id) => ({
      queryKey: qk.pricing.detail(id),
      queryFn: () => getPricing(id),
      staleTime: 60_000,
    })),
  });

  const bracketsById = new Map<string, Pricing["pricingBrackets"]>();
  results.forEach((res, i) => {
    if (res.data?.pricingBrackets) bracketsById.set(intlIds[i], res.data.pricingBrackets);
  });

  const hydrated = rows.map((r) =>
    bracketsById.has(r.id) ? { ...r, pricingBrackets: bracketsById.get(r.id) } : r,
  );

  // Only "hydrating" while a row still lacks its (more complete) detail brackets.
  const isHydrating = results.some((res, i) => res.isLoading && !bracketsById.has(intlIds[i]));

  return { rows: hydrated, isHydrating };
}

export function useCreatePricing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PricingInput) => createPricing(body),
    onSuccess: () => {
      toast.success("Pricing created");
      qc.invalidateQueries({ queryKey: qk.pricing.all });
    },
    onError: (err) => toastApiError(err, "Could not create pricing."),
  });
}

export function useUpdatePricing(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PricingInput) => updatePricing(id, body),
    onSuccess: () => {
      toast.success("Pricing updated");
      qc.invalidateQueries({ queryKey: qk.pricing.all });
    },
    onError: (err) => toastApiError(err, "Could not update pricing."),
  });
}

export function useDeletePricing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePricing(id),
    onSuccess: () => {
      toast.success("Pricing deleted");
      qc.invalidateQueries({ queryKey: qk.pricing.all });
    },
    onError: (err) => toastApiError(err, "Could not delete pricing."),
  });
}

export function useSetPopularRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPopularRoute }: { id: string; isPopularRoute: boolean }) =>
      setPopularRoute(id, isPopularRoute),
    onSuccess: (_data, { isPopularRoute }) => {
      toast.success(isPopularRoute ? "Marked as popular route" : "Removed from popular routes");
      qc.invalidateQueries({ queryKey: qk.pricing.all });
    },
    onError: (err) => toastApiError(err, "Could not update popular route."),
  });
}
