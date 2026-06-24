import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { qk } from "@/lib/query/keys";
import { listDrivers, createDriver, updateDriver } from "@/lib/api/services/drivers";
import { toastApiError } from "@/lib/api/form-errors";
import type { DriverInput } from "@/types/driver";

export function useDrivers() {
  return useQuery({
    queryKey: qk.drivers.list(),
    queryFn: () => listDrivers(),
  });
}

export function useCreateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: DriverInput) => createDriver(body),
    onSuccess: () => {
      toast.success("Driver added");
      qc.invalidateQueries({ queryKey: qk.drivers.all });
    },
    onError: (err) => toastApiError(err, "Could not add driver."),
  });
}

export function useUpdateDriver(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: DriverInput) => updateDriver(id, body),
    onSuccess: () => {
      toast.success("Driver updated");
      qc.invalidateQueries({ queryKey: qk.drivers.all });
    },
    onError: (err) => toastApiError(err, "Could not update driver."),
  });
}
