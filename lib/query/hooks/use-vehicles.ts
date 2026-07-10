import { useMemo } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { qk } from "@/lib/query/keys";
import { useDrivers } from "@/lib/query/hooks/use-drivers";
import type { Driver } from "@/types/driver";
import {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  assignVehicle,
  assignDriverToVehicle,
  unassignDriverFromVehicle,
  getVehicleAssignment,
  listVehicleAssignments,
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

/** Driver↔vehicle assignment records (used to resolve a vehicle's driver name). */
export function useVehicleAssignments() {
  return useQuery({
    queryKey: qk.vehicles.assignments(),
    queryFn: () => listVehicleAssignments(),
  });
}

export interface DriverAssignmentInfo {
  /** Human-readable vehicle label (plate / tracking id / id). */
  label: string;
  vehicleId: string;
  /** Assignment record id, when known — lets unassign target it directly. */
  assignmentId?: string;
}

export interface AssignmentIndex {
  /** driverId → assigned vehicle info. Absence means the driver is unassigned. */
  driverAssignment: Map<string, DriverAssignmentInfo>;
  /** vehicleId → assigned driver name. */
  vehicleDriverName: Map<string, string>;
}

/**
 * Shared driver↔vehicle assignment index so the Fleet page and the vehicle status
 * view derive assignment state from the same signals. Combined in priority order:
 * (1) active assignment records — also captures the assignment id so unassign is
 * reliable; (2) each vehicle's own `assignDriver` — per-vehicle linkage for the whole
 * fleet even when the assignment endpoint returns a single record; (3) the driver's
 * own `assignToVehicle` fallback (often empty). The three queries are shared/deduped.
 */
export function useAssignmentIndex(): AssignmentIndex {
  const { data: vehicles } = useVehicles();
  const { data: drivers } = useDrivers();
  const { data: assignments } = useVehicleAssignments();

  return useMemo(() => {
    const vehById = new Map((vehicles ?? []).map((v) => [v.id, v]));
    const driverById = new Map((drivers ?? []).map((d) => [d.id, d]));
    const nameOf = (d: Driver) => `${d.firstName} ${d.lastname}`.trim();
    const labelFor = (vehicleId: string) => {
      const v = vehById.get(vehicleId);
      return v ? v.plateNumber || v.vehicleTrackingId || v.id : vehicleId;
    };

    const driverAssignment = new Map<string, DriverAssignmentInfo>();
    const vehicleDriverName = new Map<string, string>();

    // (1) active assignment records — authoritative link + assignment id.
    (assignments ?? []).forEach((a) => {
      if (a.unassignedAt || !a.driverId || !a.vehicleId) return;
      driverAssignment.set(a.driverId, {
        label: labelFor(a.vehicleId),
        vehicleId: a.vehicleId,
        assignmentId: a.id || undefined,
      });
      const d = driverById.get(a.driverId);
      if (d) vehicleDriverName.set(a.vehicleId, nameOf(d));
    });

    // (2) vehicle.assignDriver — per-vehicle linkage across the fleet.
    (vehicles ?? []).forEach((v) => {
      const driverId = v.assignDriver;
      if (!driverId) return;
      if (!driverAssignment.has(driverId)) {
        driverAssignment.set(driverId, { label: labelFor(v.id), vehicleId: v.id });
      }
      const d = driverById.get(driverId);
      if (d && !vehicleDriverName.has(v.id)) vehicleDriverName.set(v.id, nameOf(d));
    });

    // (3) driver.assignToVehicle — last-resort fallback (id / tracking id / plate).
    (drivers ?? []).forEach((d) => {
      if (driverAssignment.has(d.id) || !d.assignToVehicle) return;
      const v =
        vehById.get(d.assignToVehicle) ??
        (vehicles ?? []).find(
          (x) =>
            x.vehicleTrackingId === d.assignToVehicle || x.plateNumber === d.assignToVehicle,
        );
      driverAssignment.set(d.id, {
        label: v ? v.plateNumber || v.vehicleTrackingId || v.id : d.assignToVehicle,
        vehicleId: v?.id ?? "",
      });
      const name = nameOf(d);
      if (v && name && !vehicleDriverName.has(v.id)) vehicleDriverName.set(v.id, name);
    });

    return { driverAssignment, vehicleDriverName };
  }, [vehicles, drivers, assignments]);
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
    const plate = v.plateNumber || v.vehicleTrackingId;
    // Primary source: the vehicle's own assigned-shipments (0 extra requests).
    (v.assignShipmentToVehicle ?? []).forEach((sh) => {
      const key = sh.trackingId || sh.id;
      if (key) map[key] = plate;
    });
    // Fallback/merge: the per-vehicle tracking endpoint (whichever carries the data).
    results[i]?.data?.assignedShipments.forEach((sh) => {
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
    // Prefer a known assignment id (reliable when the caller already loaded the
    // assignment records). Otherwise resolve the current assignment for the vehicle
    // via the single-record endpoint and unassign by its id.
    mutationFn: async ({
      assignmentId,
      vehicleId,
    }: {
      assignmentId?: string;
      vehicleId?: string;
    }) => {
      if (assignmentId) {
        await unassignDriverFromVehicle({ assignmentId });
        return;
      }
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
