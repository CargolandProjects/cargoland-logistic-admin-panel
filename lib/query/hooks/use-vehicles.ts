import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { qk } from "@/lib/query/keys";
import {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  assignVehicle,
  assignDriverToVehicle,
  unassignDriverFromVehicle,
  getVehicleAssignment,
  getVehicleTracking,
  fleetTracking,
  singleFleetTracking,
} from "@/lib/api/services/vehicles";
import { toastApiError } from "@/lib/api/form-errors";
import type {
  AssignDriverInput,
  AssignVehicleInput,
  FleetTrackingInput,
  SingleFleetTrackingInput,
  VehicleInput,
} from "@/types/vehicle";

export function useVehicles() {
  return useQuery({
    // High limit so the derived summary counts cover the fleet (no stats endpoint).
    queryKey: qk.vehicles.list({ limit: 100 }),
    queryFn: () => listVehicles({ limit: 100 }),
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: qk.vehicles.detail(id),
    queryFn: () => getVehicle(id),
    enabled: Boolean(id),
  });
}

export function useVehicleTracking(trackingId: string | undefined) {
  return useQuery({
    queryKey: qk.vehicles.tracking(trackingId ?? ""),
    queryFn: () => getVehicleTracking(trackingId as string),
    enabled: Boolean(trackingId),
  });
}

/**
 * Derived `shipmentTrackingId → vehicle plateNumber` map. The shipments list has no
 * vehicle/plate field and no endpoint returns it directly, so we build it from the
 * fleet: each vehicle's plate mapped to the shipments currently onboard it (via the
 * per-vehicle tracking query, which is cached/shared with the fleet tracking modals).
 */
export function useShipmentPlateMap(): Record<string, string> {
  const { data: vehicles } = useVehicles();
  const trackable = (vehicles ?? []).filter((v) => v.vehicleTrackingId);
  const results = useQueries({
    queries: trackable.map((v) => ({
      queryKey: qk.vehicles.tracking(v.vehicleTrackingId),
      queryFn: () => getVehicleTracking(v.vehicleTrackingId),
      staleTime: 60_000,
    })),
  });
  const map: Record<string, string> = {};
  trackable.forEach((v, i) => {
    const tracking = results[i]?.data;
    if (!tracking) return;
    const plate = v.plateNumber || v.vehicleTrackingId;
    tracking.assignedShipments.forEach((sh) => {
      const key = sh.trackingId || sh.id;
      if (key) map[key] = plate;
    });
  });
  return map;
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
      toast.success("Vehicle assigned to shipment");
      qc.invalidateQueries({ queryKey: qk.vehicles.all });
      qc.invalidateQueries({ queryKey: qk.shipments.all });
    },
    onError: (err) => toastApiError(err, "Could not assign vehicle."),
  });
}

export function useFleetTracking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FleetTrackingInput) => fleetTracking(body),
    onSuccess: (_d, vars) => {
      toast.success("Fleet tracking updated");
      qc.invalidateQueries({ queryKey: qk.vehicles.all });
      qc.invalidateQueries({ queryKey: qk.vehicles.tracking(vars.vehicleTrackingId) });
    },
    onError: (err) => toastApiError(err, "Could not update tracking."),
  });
}

export function useSingleFleetTracking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SingleFleetTrackingInput) => singleFleetTracking(body),
    onSuccess: (_d, vars) => {
      toast.success("Shipment tracking updated");
      qc.invalidateQueries({ queryKey: qk.vehicles.all });
      qc.invalidateQueries({ queryKey: qk.vehicles.tracking(vars.vehicleTrackingId) });
    },
    onError: (err) => toastApiError(err, "Could not update tracking."),
  });
}

export function useAssignDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AssignDriverInput) => assignDriverToVehicle(body),
    onSuccess: () => {
      toast.success("Driver assigned to vehicle");
      qc.invalidateQueries({ queryKey: qk.vehicles.all });
      qc.invalidateQueries({ queryKey: qk.drivers.all });
    },
    onError: (err) => toastApiError(err, "Could not assign driver."),
  });
}

export function useUnassignDriver() {
  const qc = useQueryClient();
  return useMutation({
    // Resolve the current assignment for this vehicle, then unassign by its id.
    mutationFn: async (vehicleId: string) => {
      const assignment = await getVehicleAssignment();
      if (!assignment?.id || assignment.vehicleId !== vehicleId || assignment.unassignedAt) {
        throw new Error("NO_ACTIVE_ASSIGNMENT");
      }
      await unassignDriverFromVehicle({ assignmentId: assignment.id });
    },
    onSuccess: () => {
      toast.success("Driver unassigned");
      qc.invalidateQueries({ queryKey: qk.vehicles.all });
      qc.invalidateQueries({ queryKey: qk.drivers.all });
    },
    onError: (err) => {
      if (err instanceof Error && err.message === "NO_ACTIVE_ASSIGNMENT") {
        toast.info("No active driver assignment for this vehicle.");
        return;
      }
      toastApiError(err, "Could not unassign driver.");
    },
  });
}
