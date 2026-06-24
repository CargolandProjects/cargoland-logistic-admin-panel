import { api, apiList } from "@/lib/api/client";
import { MOCKS, mockDelay } from "@/lib/api/mock/config";
import { MOCK_SHIPMENTS, mockShipmentDetail } from "@/lib/api/mock/shipments";
import type {
  FlagDelayInput,
  ReassignDriverInput,
  Shipment,
  ShipmentDetail,
  ShipmentStatus,
  ShipmentType,
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

/** Best-effort shape of a shipment row (unverified — data empty on dev). */
interface RawShipment {
  id?: string;
  trackingId?: string;
  vehicleId?: string;
  carrierId?: string;
  vehicle?: string;
  type?: string;
  customer?: string;
  customerName?: string;
  route?: { from?: string; to?: string; origin?: string; destination?: string };
  origin?: string;
  destination?: string;
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
    type: coerceType(raw.type),
    customer: raw.customer ?? raw.customerName ?? "",
    route: {
      from: raw.route?.from ?? raw.route?.origin ?? raw.origin ?? "",
      to: raw.route?.to ?? raw.route?.destination ?? raw.destination ?? "",
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

export async function getShipment(id: string): Promise<ShipmentDetail> {
  if (MOCKS.shipments) return mockDelay(mockShipmentDetail(id));
  // GET /admin/shipments/{id}/live -> composite detail.
  // Shape unverified (no seeded data); the backend object is passed through and
  // is expected to satisfy ShipmentDetail. Refine the mapper once data exists.
  return api.get<ShipmentDetail>(`/admin/shipments/${id}/live`);
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
