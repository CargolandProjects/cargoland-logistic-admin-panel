import { api, apiList } from "@/lib/api/client";
import { MOCKS, mockDelay } from "@/lib/api/mock/config";
import { MOCK_PRICING } from "@/lib/api/mock/pricing";
import type { Pricing, PricingInput } from "@/types/pricing";

export interface PricingListParams {
  page?: number;
  limit?: number;
}

export async function listPricing(params: PricingListParams = {}): Promise<Pricing[]> {
  if (MOCKS.pricing) return mockDelay(MOCK_PRICING);
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 50));
  const res = await apiList.get<Pricing>(`/admin/pricing?${qs.toString()}`);
  return res.data;
}

export async function getPricing(id: string): Promise<Pricing> {
  if (MOCKS.pricing) {
    return mockDelay(MOCK_PRICING.find((p) => p.id === id) ?? MOCK_PRICING[0]);
  }
  return api.get<Pricing>(`/admin/pricing/${id}`);
}

export async function createPricing(body: PricingInput): Promise<Pricing> {
  if (MOCKS.pricing) return mockDelay({ id: "PR-new", ...body });
  return api.post<Pricing>("/admin/pricing", body);
}

export async function updatePricing(id: string, body: PricingInput): Promise<Pricing> {
  if (MOCKS.pricing) return mockDelay({ id, ...body });
  return api.put<Pricing>(`/admin/pricing/${id}`, body);
}

export async function deletePricing(id: string): Promise<void> {
  if (MOCKS.pricing) return mockDelay(undefined);
  await api.delete(`/admin/pricing/${id}`);
}
