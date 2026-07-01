import { api, apiList } from "@/lib/api/client";
import type {
  AssignDriverInput,
  AssignedShipment,
  AssignVehicleInput,
  FleetTrackingInput,
  SingleFleetTrackingInput,
  UnassignDriverInput,
  Vehicle,
  VehicleAssignment,
  VehicleInput,
  VehicleStatus,
  VehicleTracking,
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
    plateNumber: raw.plateNumber ?? "",
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

export async function getVehicle(id: string): Promise<Vehicle> {
  const raw = await api.get<Partial<Vehicle> & Record<string, unknown>>(`/admin/vehicle/${id}`);
  return mapVehicle(raw, 0);
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

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

/**
 * Map one onboard shipment defensively. The tracking DTO documents
 * `assignedShipments` as plain strings, but the runtime returns richer objects
 * (customer/destination/contents/status), so we read both shapes + many aliases.
 */
function mapAssignedShipment(raw: unknown, i: number): AssignedShipment {
  if (typeof raw === "string") return { id: raw, trackingId: raw };
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const trackingId =
    str(o.shipmentTrackingId) ?? str(o.trackingId) ?? str(o.id) ?? str(o._id) ?? `pkg-${i}`;
  return {
    id: str(o.id) ?? str(o._id) ?? trackingId,
    trackingId,
    customer:
      str(o.customer) ??
      str(o.customerName) ??
      str(o.fullName) ??
      str(o.receiverName) ??
      str(o.customerEmail),
    destination:
      str(o.destination) ??
      str(o.receiverAddress) ??
      str(o.receiverStateOrCity) ??
      str(o.receiverCountry) ??
      str(o.stateOrCity),
    contents:
      str(o.contents) ?? str(o.descriptionOfGoods) ?? str(o.packageType) ?? str(o.content),
    status: str(o.status) ?? str(o.shipmentStatus),
  };
}

/** First array found among several possible field names. */
function pickShipmentsArray(obj: Record<string, unknown>): unknown[] {
  const keys = [
    "assignShipmentToVehicle", // actual runtime field
    "assignedShipments",
    "shipments",
    "packages",
    "assignedPackages",
    "onboardShipments",
    "onboardPackages",
  ];
  for (const k of keys) {
    if (Array.isArray(obj[k])) return obj[k] as unknown[];
  }
  return [];
}

/**
 * Per-vehicle tracking detail. Real response (verified):
 * `data: { vehicle: { vehicleTrackingId, maximumPackages, maximumCapacity,
 * assignShipmentToVehicle[] }, totalPackages }` — vehicle fields are nested.
 */
export async function getVehicleTracking(trackingId: string): Promise<VehicleTracking> {
  const data = await api.get<Record<string, unknown>>(`/admin/vehicle/tracking/${trackingId}`);
  const root = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  const v = (root.vehicle && typeof root.vehicle === "object" ? root.vehicle : root) as Record<
    string,
    unknown
  >;
  const shipments = pickShipmentsArray(v);
  return {
    id: (v.id as string) ?? "",
    vehicleTrackingId: (v.vehicleTrackingId as string) ?? trackingId,
    maximumPackages: String(v.maximumPackages ?? ""),
    maximumCapacity: String(v.maximumCapacity ?? ""),
    totalPackages: Number(root.totalPackages ?? v.totalPackages ?? shipments.length) || shipments.length,
    assignedShipments: shipments.map(mapAssignedShipment),
  };
}

/** Update fleet tracking status + selected packages for a vehicle. */
export async function fleetTracking(body: FleetTrackingInput): Promise<void> {
  await api.post(
    `/admin/vehicle/fleet-tracking/${body.vehicleTrackingId}?status=${encodeURIComponent(body.status)}`,
    { selectedPackages: body.selectedPackages },
  );
}

/** Update tracking status for a single shipment on a vehicle. */
export async function singleFleetTracking(body: SingleFleetTrackingInput): Promise<void> {
  await api.post(
    `/admin/vehicle/single-fleet-tracking?status=${encodeURIComponent(body.status)}`,
    { shipmentTrackingId: body.shipmentTrackingId, vehicleTrackingId: body.vehicleTrackingId },
  );
}
