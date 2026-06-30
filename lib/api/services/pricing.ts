import { api, apiList } from "@/lib/api/client";
import { MOCKS, mockDelay } from "@/lib/api/mock/config";
import { MOCK_PRICING } from "@/lib/api/mock/pricing";
import type { Pricing, PricingInput, PricingShipmentType } from "@/types/pricing";

export interface PricingListParams {
  page?: number;
  limit?: number;
}

/** Map a pricing row defensively (the type field was renamed to `shipmentType`). */
function mapPricing(raw: Record<string, unknown>): Pricing {
  const rawType = String(raw.shipmentType ?? raw.pricingShippingType ?? "").toUpperCase();
  const shipmentType: PricingShipmentType = rawType.includes("INTER") ? "INTERNATIONAL" : "DOMESTIC";
  return {
    id: String(raw.id ?? ""),
    shipmentType,
    airFreightRate: String(raw.airFreightRate ?? ""),
    roadFreightRate: String(raw.roadFreightRate ?? ""),
    oceanFreightRate: String(raw.oceanFreightRate ?? ""),
    fromWhere: String(raw.fromWhere ?? ""),
    toWhere: String(raw.toWhere ?? ""),
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

export async function createPricing(body: PricingInput): Promise<Pricing> {
  if (MOCKS.pricing) return mockDelay({ id: "PR-new", ...body });
  return mapPricing(await api.post<Record<string, unknown>>("/admin/pricing", body));
}

export async function updatePricing(id: string, body: PricingInput): Promise<Pricing> {
  if (MOCKS.pricing) return mockDelay({ id, ...body });
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
