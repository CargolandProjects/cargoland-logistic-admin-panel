import { api, apiList } from "@/lib/api/client";
import type {
  AssignDriverInput,
  AssignVehicleInput,
  UnassignDriverInput,
  Vehicle,
  VehicleAssignment,
  VehicleInput,
  VehicleStatus,
} from "@/types/vehicle";

export interface VehicleListParams {
  page?: number;
  limit?: number;
}

// Item field names from IVehicleDoc; passed through with light coercion.
function mapVehicle(raw: Partial<Vehicle> & Record<string, unknown>, i: number): Vehicle {
  return {
    id: (raw.id as string) ?? (raw.vehicleTrackingId as string) ?? String(i),
    vehicleTrackingId: raw.vehicleTrackingId ?? "",
    phoneNumber: raw.phoneNumber ?? "",
    maximumCapacity: raw.maximumCapacity ?? "",
    maximumPackages: raw.maximumPackages ?? "",
    fuelType: raw.fuelType ?? "",
    insurancePolicyNo: raw.insurancePolicyNo ?? "",
    roadWorthinessExpiry: raw.roadWorthinessExpiry ?? "",
    hackneyPermitExpiry: raw.hackneyPermitExpiry ?? "",
    assignDriver: raw.assignDriver ?? "",
    gpsDeviceId: raw.gpsDeviceId ?? "",
    telemanticProvider: raw.telemanticProvider ?? "",
    enableTelemetryAlert: Boolean(raw.enableTelemetryAlert),
    setVehicleStatus: (raw.setVehicleStatus as VehicleStatus) ?? "ACTIVE",
    createdAt: raw.createdAt,
  };
}

export async function listVehicles(params: VehicleListParams = {}): Promise<Vehicle[]> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 50));
  const res = await apiList.get<Partial<Vehicle> & Record<string, unknown>>(
    `/admin/vehicle?${qs.toString()}`,
  );
  return res.data.map(mapVehicle);
}

export async function createVehicle(body: VehicleInput): Promise<Vehicle> {
  return api.post<Vehicle>("/admin/vehicle", body);
}

export async function updateVehicle(id: string, body: VehicleInput): Promise<Vehicle> {
  return api.put<Vehicle>(`/admin/vehicle/${id}`, body);
}

/** Assign a vehicle to a shipment (by tracking IDs). */
export async function assignVehicle(body: AssignVehicleInput): Promise<void> {
  await api.post("/admin/vehicle/assign-shipment", body);
}

/** Assign a driver to a vehicle (by UUIDs). */
export async function assignDriverToVehicle(body: AssignDriverInput): Promise<void> {
  await api.post("/admin/vehicle/assign-driver", body);
}

/** Unassign a driver from a vehicle (by assignment id). */
export async function unassignDriverFromVehicle(body: UnassignDriverInput): Promise<void> {
  await api.post("/admin/vehicle/unassign-driver", body);
}

/** Current driver↔vehicle assignment record (single object; UUIDs only). */
export async function getVehicleAssignment(): Promise<VehicleAssignment | null> {
  const raw = await api.get<Partial<VehicleAssignment> | null>("/admin/vehicle/vehicle-assignment");
  if (!raw || typeof raw !== "object") return null;
  return {
    id: raw.id ?? "",
    driverId: raw.driverId ?? "",
    vehicleId: raw.vehicleId ?? "",
    assignedAt: raw.assignedAt,
    unassignedAt: raw.unassignedAt ?? null,
  };
}
