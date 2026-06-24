import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { qk } from "@/lib/query/keys";
import {
  listVehicles,
  createVehicle,
  updateVehicle,
  assignVehicle,
} from "@/lib/api/services/vehicles";
import { toastApiError } from "@/lib/api/form-errors";
import type { AssignVehicleInput, VehicleInput } from "@/types/vehicle";

export function useVehicles() {
  return useQuery({
    queryKey: qk.vehicles.list(),
    queryFn: () => listVehicles(),
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: VehicleInput) => createVehicle(body),
    onSuccess: () => {
      toast.success("Vehicle added");
      qc.invalidateQueries({ queryKey: qk.vehicles.all });
    },
    onError: (err) => toastApiError(err, "Could not add vehicle."),
  });
}

export function useUpdateVehicle(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: VehicleInput) => updateVehicle(id, body),
    onSuccess: () => {
      toast.success("Vehicle updated");
      qc.invalidateQueries({ queryKey: qk.vehicles.all });
    },
    onError: (err) => toastApiError(err, "Could not update vehicle."),
  });
}

export function useAssignVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AssignVehicleInput) => assignVehicle(body),
    onSuccess: () => {
      toast.success("Vehicle assigned");
      qc.invalidateQueries({ queryKey: qk.vehicles.all });
      qc.invalidateQueries({ queryKey: qk.shipments.all });
    },
    onError: (err) => toastApiError(err, "Could not assign vehicle."),
  });
}
