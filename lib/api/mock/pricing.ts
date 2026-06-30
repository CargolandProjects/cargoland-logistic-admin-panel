import type { Pricing } from "@/types/pricing";

// Fallback demo data (only used if MOCKS.pricing is flipped back on).
export const MOCK_PRICING: Pricing[] = [
  {
    id: "PR-001",
    shipmentType: "INTERNATIONAL",
    airFreightRate: "18000",
    roadFreightRate: "12000",
    oceanFreightRate: "9000",
    fromWhere: "Nigeria",
    toWhere: "United Kingdom",
  },
  {
    id: "PR-002",
    shipmentType: "DOMESTIC",
    airFreightRate: "5000",
    roadFreightRate: "3000",
    oceanFreightRate: "2500",
    fromWhere: "Lagos",
    toWhere: "FCT - Abuja",
  },
];
