import { api, apiList } from "@/lib/api/client";
import { MOCKS, mockDelay } from "@/lib/api/mock/config";
import { MOCK_PRICING } from "@/lib/api/mock/pricing";
import {
  FREIGHT_TYPES,
  type FreightType,
  type InternationalPricingBracket,
  type Pricing,
  type PricingInput,
  type PricingShipmentType,
} from "@/types/pricing";

export interface PricingListParams {
  page?: number;
  limit?: number;
}

/**
 * Coerce one raw bracket into `InternationalPricingBracket`, or null if unusable.
 *
 * The backend's read endpoints (list + detail) return brackets WITHOUT a
 * `freightType` field and with weights as strings, e.g.
 * `{ minWeight:"0", maxWeight:"5", airFreightRate:"1500", oceanFreightRate:"0", roadFreightRate:"0" }`.
 * (The POST/PUT response does echo `freightType`, but the UI reads via GET.) So
 * when `freightType` is absent we infer it from whichever rate is non-zero.
 */
function mapBracket(raw: unknown): InternationalPricingBracket | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const airFreightRate = String(b.airFreightRate ?? "0");
  const oceanFreightRate = String(b.oceanFreightRate ?? "0");
  const roadFreightRate = String(b.roadFreightRate ?? "0");

  const declared = String(b.freightType ?? "").toUpperCase();
  let freightType = FREIGHT_TYPES.includes(declared as FreightType)
    ? (declared as FreightType)
    : undefined;
  if (!freightType) {
    // Infer from the non-zero rate (the write side puts the price in exactly one).
    if (Number(airFreightRate) > 0) freightType = "AIR_FREIGHT";
    else if (Number(oceanFreightRate) > 0) freightType = "OCEAN_FREIGHT";
    else if (Number(roadFreightRate) > 0) freightType = "ROAD_FREIGHT";
    else freightType = "AIR_FREIGHT"; // all-zero: keep the row rather than drop it
  }

  return {
    minWeight: Number(b.minWeight ?? 0),
    maxWeight: Number(b.maxWeight ?? 0),
    freightType,
    airFreightRate,
    roadFreightRate,
    oceanFreightRate,
  };
}

/** Map a pricing row defensively (the type field was renamed to `shipmentType`). */
function mapPricing(raw: Record<string, unknown>): Pricing {
  const rawType = String(raw.shipmentType ?? raw.pricingShippingType ?? "").toUpperCase();
  const shipmentType: PricingShipmentType = rawType.includes("INTER") ? "INTERNATIONAL" : "DOMESTIC";
  // Tolerate either `pricingBrackets` or `brackets`, and a missing/non-array field.
  const rawBrackets = raw.pricingBrackets ?? raw.brackets;
  const pricingBrackets = Array.isArray(rawBrackets)
    ? rawBrackets.map(mapBracket).filter((b): b is InternationalPricingBracket => b !== null)
    : undefined;
  return {
    id: String(raw.id ?? ""),
    shipmentType,
    airFreightRate: String(raw.airFreightRate ?? ""),
    roadFreightRate: String(raw.roadFreightRate ?? ""),
    oceanFreightRate: String(raw.oceanFreightRate ?? ""),
    fromWhere: String(raw.fromWhere ?? ""),
    toWhere: String(raw.toWhere ?? ""),
    pricingBrackets,
    isPopularRoute: Boolean(raw.isPopularRoute),
    createdAt: raw.createdAt as string | undefined,
    updatedAt: raw.updatedAt as string | undefined,
  };
}

export async function listPricing(params: PricingListParams = {}): Promise<Pricing[]> {
  if (MOCKS.pricing) return mockDelay(MOCK_PRICING);
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 100));
  const res = await apiList.get<Record<string, unknown>>(`/admin/pricing?${qs.toString()}`);
  return res.data.map(mapPricing);
}

export async function getPricing(id: string): Promise<Pricing> {
  if (MOCKS.pricing) {
    return mockDelay(MOCK_PRICING.find((p) => p.id === id) ?? MOCK_PRICING[0]);
  }
  const raw = await api.get<Record<string, unknown>>(`/admin/pricing/${id}`);
  return mapPricing(raw);
}

/** Merge a `PricingInput` into a full `Pricing` for the mock branches (flat rates default to ""). */
function mockPricingFrom(id: string, body: PricingInput): Pricing {
  return {
    id,
    shipmentType: body.shipmentType,
    airFreightRate: body.airFreightRate ?? "",
    roadFreightRate: body.roadFreightRate ?? "",
    oceanFreightRate: body.oceanFreightRate ?? "",
    fromWhere: body.fromWhere,
    toWhere: body.toWhere,
    pricingBrackets: body.pricingBrackets,
  };
}

export async function createPricing(body: PricingInput): Promise<Pricing> {
  if (MOCKS.pricing) return mockDelay(mockPricingFrom("PR-new", body));
  return mapPricing(await api.post<Record<string, unknown>>("/admin/pricing", body));
}

export async function updatePricing(id: string, body: PricingInput): Promise<Pricing> {
  if (MOCKS.pricing) return mockDelay(mockPricingFrom(id, body));
  return mapPricing(await api.put<Record<string, unknown>>(`/admin/pricing/${id}`, body));
}

export async function deletePricing(id: string): Promise<void> {
  if (MOCKS.pricing) return mockDelay(undefined);
  await api.delete(`/admin/pricing/${id}`);
}

/** Toggle a pricing rule's "popular route" flag (POST /admin/pricing/popular-route/{id}). */
export async function setPopularRoute(id: string, isPopularRoute: boolean): Promise<void> {
  if (MOCKS.pricing) return mockDelay(undefined);
  await api.post(`/admin/pricing/popular-route/${id}`, { isPopularRoute });
}
