import { api, apiList } from "@/lib/api/client";
import { MOCKS, mockDelay } from "@/lib/api/mock/config";
import { MOCK_DOMESTIC_PRICING } from "@/lib/api/mock/domestic-pricing";
import type { DomesticPricing, DomesticPricingInput, PricingBracket } from "@/types/pricing";

export interface DomesticPricingListParams {
  page?: number;
  limit?: number;
  fromState?: string;
  fromCity?: string;
  toWhereState?: string;
  toWhereCity?: string;
}

const num = (v: unknown): number => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Response bracket (PricingBacketDoc) -> UI bracket. The API is inconsistent:
 * requests use `ratePerKg` (capital K) but responses return `ratePerkg`
 * (lowercase k) and weights/rates as strings — so read both keys defensively.
 */
function mapBracket(raw: Record<string, unknown>): PricingBracket {
  return {
    id: raw.id ? String(raw.id) : undefined,
    minWeight: num(raw.minWeight),
    maxWeight: num(raw.maxWeight),
    ratePerKg: num(raw.ratePerkg ?? raw.ratePerKg),
  };
}

/**
 * Map a LocalPricingDoc defensively. Rates are numbers here (strings for
 * international) and the response bracket array is keyed `brackets` (the request
 * key is `pricingBrackets`).
 */
function mapDomesticPricing(raw: Record<string, unknown>): DomesticPricing {
  const rawBrackets = Array.isArray(raw.brackets)
    ? (raw.brackets as Record<string, unknown>[])
    : Array.isArray(raw.pricingBrackets)
      ? (raw.pricingBrackets as Record<string, unknown>[])
      : [];
  return {
    id: String(raw.id ?? ""),
    shipmentType: "DOMESTIC",
    fromState: String(raw.fromState ?? ""),
    fromCity: String(raw.fromCity ?? ""),
    toWhereState: String(raw.toWhereState ?? ""),
    toWhereCity: String(raw.toWhereCity ?? ""),
    brackets: rawBrackets.map(mapBracket),
    isPopularRoute: Boolean(raw.isPopularRoute),
    createdAt: raw.createdAt as string | undefined,
    updatedAt: raw.updatedAt as string | undefined,
  };
}

export async function listDomesticPricing(
  params: DomesticPricingListParams = {},
): Promise<DomesticPricing[]> {
  if (MOCKS.pricing) return mockDelay(MOCK_DOMESTIC_PRICING);
  const qs = new URLSearchParams();
  qs.set("shipmentType", "DOMESTIC");
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 100));
  if (params.fromState) qs.set("fromState", params.fromState);
  if (params.fromCity) qs.set("fromCity", params.fromCity);
  if (params.toWhereState) qs.set("toWhereState", params.toWhereState);
  if (params.toWhereCity) qs.set("toWhereCity", params.toWhereCity);
  const res = await apiList.get<Record<string, unknown>>(
    `/admin/pricing/local-pricing?${qs.toString()}`,
  );
  return res.data.map(mapDomesticPricing);
}

export async function createDomesticPricing(
  body: DomesticPricingInput,
): Promise<DomesticPricing> {
  if (MOCKS.pricing) return mockDelay(mockRow("DP-new", body));
  return mapDomesticPricing(
    await api.post<Record<string, unknown>>("/admin/pricing/create-local-pricing", body),
  );
}

export async function updateDomesticPricing(
  id: string,
  body: Partial<DomesticPricingInput>,
): Promise<DomesticPricing> {
  if (MOCKS.pricing) return mockDelay(mockRow(id, body));
  // Distinct local route (backend split it from the international PUT /admin/pricing/{id}).
  return mapDomesticPricing(
    await api.put<Record<string, unknown>>(`/admin/pricing/local-pricing/${id}`, body),
  );
}

export async function deleteDomesticPricing(id: string): Promise<void> {
  if (MOCKS.pricing) return mockDelay(undefined);
  await api.delete(`/admin/pricing/local-pricing/${id}`);
}

/** Build a UI row from an input body (mock paths only). */
function mockRow(id: string, body: Partial<DomesticPricingInput>): DomesticPricing {
  return {
    id,
    shipmentType: "DOMESTIC",
    fromState: body.fromState ?? "",
    fromCity: body.fromCity ?? "",
    toWhereState: body.toWhereState ?? "",
    toWhereCity: body.toWhereCity ?? "",
    brackets: (body.pricingBrackets ?? []).map((b, i) => ({ id: `b${i}`, ...b })),
  };
}
