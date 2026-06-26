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
  enableTelemetryAlert: boolean;
  setVehicleStatus: VehicleStatus;
  createdAt?: string;
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
  enableTelemetryAlert: boolean;
  setVehicleStatus: VehicleStatus;
}

/** POST /admin/vehicle/assign-shipment body (AssignShipmentToVehicleDto). */
export interface AssignVehicleInput {
  shipmentTrackingId: string;
  vehicleTrackingId: string;
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
