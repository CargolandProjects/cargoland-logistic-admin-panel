import { api, apiList } from "@/lib/api/client";
import { MOCKS, mockDelay } from "@/lib/api/mock/config";
import { MOCK_SHIPMENTS, mockShipmentDetail } from "@/lib/api/mock/shipments";
import type {
  EventLogEntry,
  FlagDelayInput,
  JourneyStep,
  ReassignDriverInput,
  Shipment,
  ShipmentDetail,
  ShipmentStatus,
  ShipmentType,
  TelemetryReading,
  UpdateTelemetryInput,
} from "@/types/shipment";

export interface ShipmentFilters {
  search?: string;
  type?: string;
  status?: string;
  transport?: string;
  skip?: number;
  take?: number;
}

/** Shape of a shipment list row (verified against live `/admin/shipments`). */
interface RawShipment {
  id?: string;
  trackingId?: string;
  vehicleId?: string;
  carrierId?: string;
  vehicle?: string;
  type?: string;
  shipmentType?: string;
  customer?: string;
  customerName?: string;
  fullName?: string;
  route?: { from?: string; to?: string; origin?: string; destination?: string };
  origin?: string;
  destination?: string;
  stateOrCity?: string;
  country?: string;
  receiverStateOrCity?: string;
  receiverCountry?: string;
  lastUpdated?: string;
  updatedAt?: string;
  status?: string;
}

const VALID_STATUSES: ShipmentStatus[] = [
  "PENDING",
  "ASSIGNED",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
  "PICKED_UP",
  "AT_ORIGIN_HUB",
  "DESTINATION",
  "CUSTOM_CLEARANCE",
];

function coerceType(raw?: string): ShipmentType {
  return (raw ?? "").toLowerCase().includes("inter") ? "International" : "Local";
}

function coerceStatus(raw?: string): ShipmentStatus {
  const up = (raw ?? "").toUpperCase().replace(/[\s-]+/g, "_") as ShipmentStatus;
  return VALID_STATUSES.includes(up) ? up : "PENDING";
}

function mapShipment(raw: RawShipment, i: number): Shipment {
  return {
    id: raw.id ?? raw.trackingId ?? String(i),
    trackingId: raw.trackingId ?? raw.id ?? "",
    vehicleId: raw.vehicleId ?? raw.carrierId ?? raw.vehicle ?? "",
    type: coerceType(raw.type ?? raw.shipmentType),
    customer: raw.customer ?? raw.customerName ?? raw.fullName ?? "",
    route: {
      from: raw.route?.from ?? raw.route?.origin ?? raw.origin ?? raw.stateOrCity ?? raw.country ?? "",
      to:
        raw.route?.to ??
        raw.route?.destination ??
        raw.destination ??
        raw.receiverStateOrCity ??
        raw.receiverCountry ??
        "",
    },
    lastUpdated: raw.lastUpdated ?? raw.updatedAt ?? "",
    status: coerceStatus(raw.status),
  };
}

export async function listShipments(filters: ShipmentFilters = {}): Promise<Shipment[]> {
  if (MOCKS.shipments) {
    let rows = MOCK_SHIPMENTS;
    const { search, type, status } = filters;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (s) => s.trackingId.toLowerCase().includes(q) || s.customer.toLowerCase().includes(q),
      );
    }
    if (type && type !== "all") rows = rows.filter((s) => s.type === type);
    if (status && status !== "all") rows = rows.filter((s) => s.status === status);
    return mockDelay(rows);
  }

  const params = new URLSearchParams();
  params.set("skip", String(filters.skip ?? 0));
  params.set("take", String(filters.take ?? 10));
  if (filters.search) params.set("search", filters.search);
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  const res = await apiList.get<RawShipment>(`/admin/shipments?${params.toString()}`);
  return res.data.map(mapShipment);
}

/** Paged fetch that also exposes the total count (used by the dashboard). */
export async function getShipmentsPage(
  filters: ShipmentFilters = {},
): Promise<{ data: Shipment[]; total: number }> {
  if (MOCKS.shipments) {
    const data = await listShipments(filters);
    return { data, total: data.length };
  }
  const params = new URLSearchParams();
  params.set("skip", String(filters.skip ?? 0));
  params.set("take", String(filters.take ?? 10));
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  const res = await apiList.get<RawShipment>(`/admin/shipments?${params.toString()}`);
  return { data: res.data.map(mapShipment), total: res.meta?.total ?? res.data.length };
}

// --- Live-detail normalizer ------------------------------------------------
// The `/admin/shipments/{id}/live` payload shape is only partially known, so we
// defensively coerce every field and default all nested objects/arrays. This
// guarantees a fully-formed ShipmentDetail (no `undefined.x` crashes) and
// renders whatever data is present. Refine the field paths as the shape firms up.

function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}
function str(v: unknown): string {
  return typeof v === "string" ? v : typeof v === "number" || typeof v === "boolean" ? String(v) : "";
}
function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return 0;
}
function arr(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v) ? v.map(obj) : [];
}
function pick(...vals: unknown[]): string {
  for (const v of vals) {
    const s = str(v);
    if (s) return s;
  }
  return "";
}

function mapJourneyStep(raw: Record<string, unknown>): JourneyStep {
  const state = str(raw.state ?? raw.status).toLowerCase();
  return {
    title: pick(raw.title, raw.name, raw.label),
    description: pick(raw.description, raw.detail, raw.note),
    timestamp: pick(raw.timestamp, raw.time, raw.createdAt, raw.date),
    state:
      state === "done" || state === "completed"
        ? "done"
        : state === "active" || state === "current"
          ? "active"
          : "upcoming",
  };
}

function mapEvent(raw: Record<string, unknown>, i: number): EventLogEntry {
  const tone = str(raw.tone).toLowerCase();
  return {
    id: pick(raw.id) || String(i),
    title: pick(raw.title, raw.message, raw.description, raw.event),
    meta: pick(raw.meta, raw.createdAt, raw.time, raw.source),
    tone: (["red", "green", "blue", "gray"].includes(tone) ? tone : "blue") as EventLogEntry["tone"],
  };
}

function mapTelemetry(raw: Record<string, unknown>): TelemetryReading[] {
  if (Array.isArray(raw.telemetry)) {
    return arr(raw.telemetry).map((t) => ({
      label: str(t.label),
      value: str(t.value),
      hint: str(t.hint) || undefined,
    }));
  }
  const readings: TelemetryReading[] = [];
  const add = (label: string, value: string) => {
    if (value) readings.push({ label, value });
  };
  add("Last GPS ping", pick(raw.lastGpsPing, raw.lastPing));
  add("GPS Coordinates", str(raw.gpsCoordinates));
  add("Packages onboard", str(raw.packagesOnboard));
  add(
    "Fuel level",
    raw.fuelLevel != null
      ? `${str(raw.fuelLevel)}%${raw.fuelRangeKm ? ` · ~${str(raw.fuelRangeKm)}km range` : ""}`
      : "",
  );
  add("Engine status", str(raw.engineStatus));
  return readings;
}

function mapShipmentDetail(raw: Record<string, unknown>, id: string): ShipmentDetail {
  const route = obj(raw.route);
  const driver = obj(raw.driver);
  const vehicle = obj(raw.vehicle);
  const vehicleStatus = obj(raw.vehicleStatus);
  const pkg = obj(raw.packageDetails);
  const recipient = obj(raw.recipient);

  return {
    id: pick(raw.id, id),
    trackingId: pick(raw.trackingId, raw.shipmentTrackingId, raw.id, id),
    vehicleId: pick(raw.vehicleId, raw.vehicleTrackingId, vehicle.id),
    type: coerceType(pick(raw.type, raw.shipmentType)),
    customer: pick(raw.customer, raw.customerName, raw.fullName),
    route: {
      from: pick(route.from, route.origin, raw.routeOrigin, raw.origin),
      to: pick(route.to, route.destination, raw.routeDestination, raw.destination),
    },
    lastUpdated: pick(raw.lastUpdated, raw.updatedAt),
    status: coerceStatus(pick(raw.status, raw.eventStatus)),
    bookingRef: pick(raw.bookingRef, raw.bookingReference, raw.booking),
    fleet: pick(raw.fleet) || "Cargoland Fleet",
    driver: {
      name: pick(driver.name, raw.driverName),
      id: pick(driver.id, raw.driverId),
      status: pick(driver.status, raw.driverStatus),
    },
    vehicle: {
      model: pick(vehicle.model, raw.vehicleName),
      plate: pick(vehicle.plate, raw.vehiclePlate),
    },
    progress: num(raw.progress ?? raw.completionRate),
    vehicleStatus: {
      headline: pick(
        vehicleStatus.headline,
        raw.vehicleOperatingNormally ? "Vehicle operating normally" : "",
      ),
      subtext: pick(vehicleStatus.subtext),
      location: pick(vehicleStatus.location, raw.location),
      speed: pick(vehicleStatus.speed, raw.speed != null ? `${str(raw.speed)} km/h` : ""),
    },
    journey: arr(raw.journey ?? raw.timeline).map(mapJourneyStep),
    telemetry: mapTelemetry(raw),
    packageDetails: {
      weight: pick(pkg.weight, raw.weight),
      content: pick(pkg.content, raw.content, raw.descriptionOfGoods),
      service: pick(pkg.service, raw.service),
      fragile: pick(pkg.fragile, raw.fragile),
      images: Array.isArray(pkg.images)
        ? (pkg.images as string[])
        : Array.isArray(raw.images)
          ? (raw.images as string[])
          : [],
    },
    recipient: {
      name: pick(recipient.name, raw.receiverName),
      address: pick(recipient.address, raw.receiverAddress),
      phone: pick(recipient.phone, raw.receiverNumber),
    },
    eventLog: arr(raw.eventLog ?? raw.events).map(mapEvent),
  };
}

export async function getShipment(id: string): Promise<ShipmentDetail> {
  if (MOCKS.shipments) return mockDelay(mockShipmentDetail(id));
  // GET /admin/shipments/{id}/live -> composite detail (shape partially known).
  const raw = await api.get<Record<string, unknown>>(`/admin/shipments/${id}/live`);
  return mapShipmentDetail(obj(raw), id);
}

export async function reassignDriver(id: string, body: ReassignDriverInput): Promise<void> {
  if (MOCKS.shipments) return mockDelay(undefined);
  await api.patch(`/admin/shipments/${id}/reassign-driver`, body);
}

export async function flagDelay(id: string, body: FlagDelayInput): Promise<void> {
  if (MOCKS.shipments) return mockDelay(undefined);
  await api.post(`/admin/shipments/${id}/flag-delay`, body);
}

export async function updateTelemetry(id: string, body: UpdateTelemetryInput): Promise<void> {
  if (MOCKS.shipments) return mockDelay(undefined);
  await api.post(`/admin/shipments/${id}/telemetry`, body);
}
