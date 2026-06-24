import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { qk } from "@/lib/query/keys";
import {
  listPricing,
  getPricing,
  createPricing,
  updatePricing,
  deletePricing,
} from "@/lib/api/services/pricing";
import { toastApiError } from "@/lib/api/form-errors";
import type { PricingInput } from "@/types/pricing";

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
