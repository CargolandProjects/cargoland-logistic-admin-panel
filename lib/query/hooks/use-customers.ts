import { useQuery } from "@tanstack/react-query";

import { qk } from "@/lib/query/keys";
import { listCustomers, getCustomer } from "@/lib/api/services/customers";

export function useCustomers() {
  return useQuery({
    queryKey: qk.customers.list(),
    queryFn: () => listCustomers(),
  });
}

export function useCustomer(key: string) {
  return useQuery({
    queryKey: qk.customers.detail(key),
    queryFn: () => getCustomer(key),
    enabled: Boolean(key),
  });
}
