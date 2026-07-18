import type { DomesticPricing } from "@/types/pricing";

// Fallback demo data (only used if MOCKS.pricing is flipped back on).
export const MOCK_DOMESTIC_PRICING: DomesticPricing[] = [
  {
    id: "DP-001",
    shipmentType: "DOMESTIC",
    fromState: "Lagos",
    fromCity: "Ikeja",
    toWhereState: "Ondo",
    toWhereCity: "Akure",
    brackets: [
      { id: "b1", minWeight: 0, maxWeight: 3, ratePerKg: 45000 },
      { id: "b2", minWeight: 4, maxWeight: 5, ratePerKg: 45000 },
      { id: "b3", minWeight: 6, maxWeight: 8, ratePerKg: 45000 },
    ],
  },
  {
    id: "DP-002",
    shipmentType: "DOMESTIC",
    fromState: "Lagos",
    fromCity: "Lekki",
    toWhereState: "Oyo",
    toWhereCity: "Ibadan",
    brackets: [
      { id: "b4", minWeight: 0, maxWeight: 4, ratePerKg: 18000 },
      { id: "b5", minWeight: 5, maxWeight: 10, ratePerKg: 25000 },
    ],
  },
];
