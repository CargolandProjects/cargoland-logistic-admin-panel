import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { qk } from "@/lib/query/keys";
import {
  listDomesticPricing,
  createDomesticPricing,
  updateDomesticPricing,
  deleteDomesticPricing,
  type DomesticPricingListParams,
} from "@/lib/api/services/domestic-pricing";
import { toastApiError } from "@/lib/api/form-errors";
import type { DomesticPricingInput } from "@/types/pricing";

export function useDomesticPricing(params?: DomesticPricingListParams) {
  return useQuery({
    queryKey: qk.pricing.localList(params),
    queryFn: () => listDomesticPricing(params),
  });
}

/**
 * Resolve a single domestic row for the edit form. There is no GET-by-id in the
 * local-pricing namespace, so we read it from the list query (fetching the list
 * on a cold load / direct URL).
 */
export function useDomesticPricingRow(id: string) {
  const query = useDomesticPricing();
  const row = query.data?.find((r) => r.id === id);
  return { ...query, row };
}

export function useCreateDomesticPricing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: DomesticPricingInput) => createDomesticPricing(body),
    onSuccess: () => {
      toast.success("Pricing created");
      qc.invalidateQueries({ queryKey: qk.pricing.all });
    },
    onError: (err) => toastApiError(err, "Could not create pricing."),
  });
}

export function useUpdateDomesticPricing(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<DomesticPricingInput>) => updateDomesticPricing(id, body),
    onSuccess: () => {
      toast.success("Pricing updated");
      qc.invalidateQueries({ queryKey: qk.pricing.all });
    },
    onError: (err) => toastApiError(err, "Could not update pricing."),
  });
}

export function useDeleteDomesticPricing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDomesticPricing(id),
    onSuccess: () => {
      toast.success("Pricing deleted");
      qc.invalidateQueries({ queryKey: qk.pricing.all });
    },
    onError: (err) => toastApiError(err, "Could not delete pricing."),
  });
}
