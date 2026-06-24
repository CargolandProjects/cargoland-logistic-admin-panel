import { useQuery } from "@tanstack/react-query";

import { qk } from "@/lib/query/keys";
import { getPayments, type PaymentFilters } from "@/lib/api/services/payments";

export function usePayments(filters: PaymentFilters) {
  return useQuery({
    queryKey: qk.payments.list(filters),
    queryFn: () => getPayments(filters),
  });
}
