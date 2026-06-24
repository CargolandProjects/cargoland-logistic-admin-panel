import type { Pricing } from "@/types/pricing";

// Fallback demo data (only used if MOCKS.pricing is flipped back on).
export const MOCK_PRICING: Pricing[] = [
  {
    id: "PR-001",
    pricingShippingType: "INTERNATION_SHIPPING",
    airFreightRate: "18000",
    roadFreightRate: "12000",
    oceanFreightRate: "9000",
    fromWhere: "Lagos",
    toWhere: "London",
  },
  {
    id: "PR-002",
    pricingShippingType: "LOCAL_SHIPPING",
    airFreightRate: "5000",
    roadFreightRate: "3000",
    oceanFreightRate: "2500",
    fromWhere: "Lagos",
    toWhere: "Abuja",
  },
];
