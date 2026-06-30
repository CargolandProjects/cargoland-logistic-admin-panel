import { apiList } from "@/lib/api/client";
import { MOCKS, mockDelay } from "@/lib/api/mock/config";
import { MOCK_CUSTOMERS } from "@/lib/api/mock/customers";
import type { Customer, CustomerProfile } from "@/types/customer";
import type { Shipment, ShipmentStatus, ShipmentType } from "@/types/shipment";

/**
 * Customers are derived from `/admin/shipments` — there is no customer-list
 * endpoint. The current shipment list-mapper drops the customer-identifying
 * fields (email/phone/price/createdAt), so we read the raw rows here.
 */
interface RawCustomerShipment {
  id?: string;
  trackingId?: string;
  userId?: string;
  fullName?: string;
  customer?: string;
  customerName?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  country?: string;
  stateOrCity?: string;
  receiverCountry?: string;
  receiverStateOrCity?: string;
  price?: string | number;
  shipmentType?: string;
  type?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
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

function str(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return 0;
}

function coerceType(raw?: string): ShipmentType {
  return (raw ?? "").toLowerCase().includes("inter") ? "International" : "Local";
}

function coerceStatus(raw?: string): ShipmentStatus {
  const up = (raw ?? "").toUpperCase().replace(/[\s-]+/g, "_") as ShipmentStatus;
  return VALID_STATUSES.includes(up) ? up : "PENDING";
}

function pickName(r: RawCustomerShipment): string {
  return str(r.fullName) || str(r.customer) || str(r.customerName) || str(r.email) || "Customer";
}

/** Stable directory key: prefer email, fall back to userId, then name. */
function customerKey(r: RawCustomerShipment): string {
  return (str(r.email) || str(r.userId) || pickName(r)).toLowerCase();
}

function minDate(dates: string[]): string {
  return dates.reduce((min, d) => (!min || new Date(d) < new Date(min) ? d : min), "");
}

function maxDate(dates: string[]): string {
  return dates.reduce((max, d) => (!max || new Date(d) > new Date(max) ? d : max), "");
}

function rawToShipment(raw: RawCustomerShipment, i: number): Shipment {
  return {
    id: str(raw.id ?? raw.trackingId) || String(i),
    trackingId: str(raw.trackingId ?? raw.id),
    vehicleId: "",
    type: coerceType(raw.type ?? raw.shipmentType),
    customer: pickName(raw),
    route: {
      from: str(raw.stateOrCity) || str(raw.country),
      to: str(raw.receiverStateOrCity) || str(raw.receiverCountry),
    },
    lastUpdated: str(raw.updatedAt) || str(raw.createdAt),
    status: coerceStatus(raw.status),
  };
}

function buildCustomer(key: string, rows: RawCustomerShipment[]): Customer {
  const withName = rows.find((r) => pickName(r) !== "Customer") ?? rows[0] ?? {};
  const withPhone = rows.find((r) => str(r.phoneNumber) || str(r.phone));
  const withCountry = rows.find((r) => str(r.country));
  return {
    id: key,
    name: pickName(withName),
    email: str(rows.find((r) => str(r.email))?.email),
    phone: str(withPhone?.phoneNumber ?? withPhone?.phone),
    country: str(withCountry?.country),
    bookings: rows.length,
    totalSpent: rows.reduce((s, r) => s + num(r.price), 0),
    delivered: rows.filter((r) => coerceStatus(r.status) === "DELIVERED").length,
    customerSince: minDate(rows.map((r) => str(r.createdAt)).filter(Boolean)),
    lastActive: maxDate(rows.map((r) => str(r.updatedAt)).filter(Boolean)),
  };
}

function groupByCustomer(rows: RawCustomerShipment[]): Map<string, RawCustomerShipment[]> {
  const map = new Map<string, RawCustomerShipment[]>();
  for (const r of rows) {
    const key = customerKey(r);
    if (!key) continue;
    const bucket = map.get(key);
    if (bucket) bucket.push(r);
    else map.set(key, [r]);
  }
  return map;
}

function mostFrequentRoute(shipments: Shipment[]): string {
  const tally = new Map<string, number>();
  for (const s of shipments) {
    if (!s.route.from && !s.route.to) continue;
    const label = `${s.route.from || "—"} → ${s.route.to || "—"}`;
    tally.set(label, (tally.get(label) ?? 0) + 1);
  }
  let best = "—";
  let max = 0;
  for (const [label, count] of tally) {
    if (count > max) {
      best = label;
      max = count;
    }
  }
  return best;
}

async function fetchRawShipments(): Promise<RawCustomerShipment[]> {
  const res = await apiList.get<RawCustomerShipment>(`/admin/shipments?skip=0&take=100`);
  return res.data;
}

/** Customer directory derived from all shipments. */
export async function listCustomers(): Promise<Customer[]> {
  if (MOCKS.customers) return mockDelay(MOCK_CUSTOMERS);
  const rows = await fetchRawShipments();
  return [...groupByCustomer(rows).entries()].map(([key, rs]) => buildCustomer(key, rs));
}

/** Single customer profile (header stats + their shipments). */
export async function getCustomer(key: string): Promise<CustomerProfile | null> {
  const k = key.toLowerCase();
  if (MOCKS.customers) {
    const c = MOCK_CUSTOMERS.find((x) => x.id === k);
    if (!c) return null;
    return mockDelay({
      ...c,
      preferredRoute: "Lagos → London",
      averageSpend: c.bookings ? Math.round(c.totalSpent / c.bookings) : 0,
      shipments: [],
    });
  }
  const rows = (await fetchRawShipments()).filter((r) => customerKey(r) === k);
  if (rows.length === 0) return null;
  const base = buildCustomer(k, rows);
  const shipments = rows.map(rawToShipment);
  return {
    ...base,
    preferredRoute: mostFrequentRoute(shipments),
    averageSpend: base.bookings ? Math.round(base.totalSpent / base.bookings) : 0,
    shipments,
  };
}
