import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { qk } from "@/lib/query/keys";
import {
  listShipments,
  getShipment,
  getShipmentRecord,
  reassignDriver,
  flagDelay,
  updateTelemetry,
  type ShipmentFilters,
} from "@/lib/api/services/shipments";
import { toastApiError } from "@/lib/api/form-errors";
import type {
  FlagDelayInput,
  ReassignDriverInput,
  UpdateTelemetryInput,
} from "@/types/shipment";

export function useShipments(filters: ShipmentFilters) {
  return useQuery({
    queryKey: qk.shipments.list(filters),
    queryFn: () => listShipments(filters),
  });
}

export function useShipment(id: string) {
  return useQuery({
    queryKey: qk.shipments.detail(id),
    queryFn: () => getShipment(id),
    enabled: Boolean(id),
  });
}

export function useShipmentRecord(id: string) {
  return useQuery({
    queryKey: qk.shipments.record(id),
    queryFn: () => getShipmentRecord(id),
    enabled: Boolean(id),
  });
}

export function useReassignDriver(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ReassignDriverInput) => reassignDriver(id, body),
    onSuccess: () => {
      toast.success("Driver reassigned");
      qc.invalidateQueries({ queryKey: qk.shipments.detail(id) });
    },
    onError: (err) => toastApiError(err, "Could not reassign driver."),
  });
}

export function useFlagDelay(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FlagDelayInput) => flagDelay(id, body),
    onSuccess: () => {
      toast.success("Delay flagged");
      qc.invalidateQueries({ queryKey: qk.shipments.detail(id) });
    },
    onError: (err) => toastApiError(err, "Could not flag delay."),
  });
}

export function useUpdateTelemetry(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateTelemetryInput) => updateTelemetry(id, body),
    onSuccess: () => {
      toast.success("Telemetry updated");
      qc.invalidateQueries({ queryKey: qk.shipments.detail(id) });
    },
    onError: (err) => toastApiError(err, "Could not update telemetry."),
  });
}
