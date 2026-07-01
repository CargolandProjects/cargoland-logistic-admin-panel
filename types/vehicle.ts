export type VehicleStatus = "ACTIVE" | "STANDY" | "MAINTENANCE";

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  ACTIVE: "Active",
  STANDY: "Standby",
  MAINTENANCE: "Maintenance",
};

export const VEHICLE_STATUS_OPTIONS = (
  Object.keys(VEHICLE_STATUS_LABELS) as VehicleStatus[]
).map((value) => ({ value, label: VEHICLE_STATUS_LABELS[value] }));

/** Vehicle item (IVehicleDoc). */
export interface Vehicle {
  id: string;
  vehicleTrackingId: string;
  phoneNumber: string;
  maximumCapacity: string;
  maximumPackages: string;
  fuelType: string;
  insurancePolicyNo: string;
  roadWorthinessExpiry: string;
  hackneyPermitExpiry: string;
  assignDriver: string;
  gpsDeviceId: string;
  telemanticProvider: string;
  plateNumber: string;
  enableTelemetryAlert: boolean;
  setVehicleStatus: VehicleStatus;
  createdAt?: string;
  /** Shipments assigned/onboard this vehicle (runtime field; docs call it assignedShipments). */
  assignShipmentToVehicle?: AssignedShipment[];
}

/** POST/PUT /admin/vehicle body (VehicleDto). */
export interface VehicleInput {
  phoneNumber: string;
  maximumCapacity: string;
  maximumPackages: string;
  fuelType: string;
  insurancePolicyNo: string;
  roadWorthinessExpiry: string;
  hackneyPermitExpiry: string;
  gpsDeviceId: string;
  telemanticProvider: string;
  plateNumber: string;
  enableTelemetryAlert: boolean;
  setVehicleStatus: VehicleStatus;
}

/** POST /admin/vehicle/assign-shipment body (AssignShipmentToVehicleDto). */
export interface AssignVehicleInput {
  shipmentTrackingId: string;
  vehicleTrackingId: string;
  plateNumber: string;
}

/** POST /admin/vehicle/assign-driver body (AssignDriverToVehicleDto). */
export interface AssignDriverInput {
  driverId: string;
  vehicleId: string;
}

/** POST /admin/vehicle/unassign-driver body (UnassignDriverFromVehicleDto). */
export interface UnassignDriverInput {
  assignmentId: string;
}

/** GET /admin/vehicle/vehicle-assignment -> single record. */
export interface VehicleAssignment {
  id: string;
  driverId: string;
  vehicleId: string;
  assignedAt?: string;
  unassignedAt?: string | null;
}

/** A shipment/package currently onboard a vehicle (from the tracking endpoint). */
export interface AssignedShipment {
  id: string;
  trackingId: string;
  customer?: string;
  destination?: string;
  contents?: string;
  status?: string;
}

/** GET /admin/vehicle/tracking/{vehicleTrackingId} -> data. */
export interface VehicleTracking {
  id: string;
  vehicleTrackingId: string;
  maximumPackages: string;
  maximumCapacity: string;
  totalPackages: number;
  assignedShipments: AssignedShipment[];
}

/** POST /admin/vehicle/fleet-tracking/{trackingId}?status=... body { selectedPackages }. */
export interface FleetTrackingInput {
  vehicleTrackingId: string;
  status: import("@/types/shipment").ShipmentStatus;
  selectedPackages: string[];
}

/** POST /admin/vehicle/single-fleet-tracking?status=... body { shipmentTrackingId, vehicleTrackingId }. */
export interface SingleFleetTrackingInput {
  vehicleTrackingId: string;
  shipmentTrackingId: string;
  status: import("@/types/shipment").ShipmentStatus;
}
