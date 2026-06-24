export type ShipmentType = "Local" | "International";

/** Real backend ShipmentStatus enum (verbatim). */
export type ShipmentStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
  | "PICKED_UP"
  | "AT_ORIGIN_HUB"
  | "DESTINATION"
  | "CUSTOM_CLEARANCE";

/** Human-friendly labels for statuses. */
export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  PENDING: "Pending",
  ASSIGNED: "Assigned",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  PICKED_UP: "Picked Up",
  AT_ORIGIN_HUB: "At Origin Hub",
  DESTINATION: "At Destination",
  CUSTOM_CLEARANCE: "Customs Clearance",
};

/** Returns the label for a status string, falling back to the raw value. */
export function shipmentStatusLabel(status: string): string {
  return SHIPMENT_STATUS_LABELS[status as ShipmentStatus] ?? status;
}

/** Row in the shipment-tracking list. */
export interface Shipment {
  id: string;
  trackingId: string;
  vehicleId: string;
  type: ShipmentType;
  customer: string;
  route: { from: string; to: string };
  lastUpdated: string;
  status: ShipmentStatus;
}

export interface JourneyStep {
  title: string;
  description: string;
  timestamp: string;
  state: "done" | "active" | "upcoming";
}

export interface TelemetryReading {
  label: string;
  value: string;
  hint?: string;
}

export interface EventLogEntry {
  id: string;
  title: string;
  meta: string;
  tone: "red" | "green" | "blue" | "gray";
}

export interface PackageDetails {
  weight: string;
  content: string;
  service: string;
  fragile: string;
  images: string[];
}

export interface Recipient {
  name: string;
  address: string;
  phone: string;
}

/** PATCH /admin/shipments/{id}/reassign-driver body. */
export interface ReassignDriverInput {
  driverId: string;
  driverName: string;
  driverPhoneNumber: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
}

/** POST /admin/shipments/{id}/flag-delay body. */
export interface FlagDelayInput {
  reason: string;
  notes?: string;
}

/** POST /admin/shipments/{id}/telemetry body (UpdateTelemetryDto). */
export interface UpdateTelemetryInput {
  location: string;
  speed: number;
  fuelLevel: number;
  gpsCoordinates?: string;
  driverId?: string;
  driverName?: string;
  driverPhoneNumber?: string;
  driverStatus?: "Active" | "Inactive";
  vehicleId?: string;
  vehicleName?: string;
  vehiclePlate?: string;
  engineStatus?: string;
  vehicleOperatingNormally?: boolean;
  packagesOnboard?: number;
  packageConfirmedOnboard?: boolean;
  fuelRangeKm?: number;
  completionRate?: number;
  estimatedTime?: string;
  routeOrigin?: string;
  routeDestination?: string;
  eventStatus?: ShipmentStatus;
  eventDescription?: string;
  eventSource?: "Fleet GPS" | "Driver app" | "Admin assignment";
  isAutoSynced?: boolean;
}

/** Full live-tracking detail view. */
export interface ShipmentDetail extends Shipment {
  bookingRef: string;
  fleet: string;
  driver: { name: string; id: string; status: string };
  vehicle: { model: string; plate: string };
  progress: number;
  journey: JourneyStep[];
  telemetry: TelemetryReading[];
  vehicleStatus: { headline: string; subtext: string; location: string; speed: string };
  packageDetails: PackageDetails;
  recipient: Recipient;
  eventLog: EventLogEntry[];
}
