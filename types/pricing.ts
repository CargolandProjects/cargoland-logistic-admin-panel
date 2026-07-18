/** Backend pricing shipment-type enum (renamed from pricingShippingType). */
export type PricingShipmentType = "DOMESTIC" | "INTERNATIONAL";

export const PRICING_TYPE_LABELS: Record<PricingShipmentType, string> = {
  DOMESTIC: "Domestic",
  INTERNATIONAL: "International",
};

export const PRICING_TYPE_OPTIONS = (
  Object.keys(PRICING_TYPE_LABELS) as PricingShipmentType[]
).map((value) => ({ value, label: PRICING_TYPE_LABELS[value] }));

/** A pricing rule item (IPricingDoc). Rates are strings in the API. */
export interface Pricing {
  id: string;
  shipmentType: PricingShipmentType;
  airFreightRate: string;
  roadFreightRate: string;
  oceanFreightRate: string;
  fromWhere: string;
  toWhere: string;
  isPopularRoute?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** POST/PUT /admin/pricing body (PricingDto). */
export interface PricingInput {
  shipmentType: PricingShipmentType;
  airFreightRate: string;
  roadFreightRate: string;
  oceanFreightRate: string;
  fromWhere: string;
  toWhere: string;
}

// --- Domestic (local) pricing ------------------------------------------------
// Separate backend resource under /admin/pricing/*local-pricing*. Priced by a
// per-route list of weight brackets instead of the flat air/road/ocean rates.
// NOTE the API asymmetry the mapper hides: rates are NUMBERS here (strings for
// international), the request key is `pricingBrackets` but the response key is
// `brackets`, and the response has no `isPopularRoute` field.

/** One weight bracket. `id` is only present on response rows (PricingBacketDoc). */
export interface PricingBracket {
  id?: string;
  minWeight: number;
  maxWeight: number;
  ratePerKg: number;
}

/** A domestic pricing rule (LocalPricingDoc). */
export interface DomesticPricing {
  id: string;
  shipmentType: PricingShipmentType; // always "DOMESTIC" for these rows
  fromState: string;
  fromCity: string;
  toWhereState: string;
  toWhereCity: string;
  brackets: PricingBracket[];
  /** Not returned by the API; client-only (see plan — toggle without a badge). */
  isPopularRoute?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * POST create-local-pricing / PUT {id} body (LocalPricingDto / UpdateLocalPricingDto).
 * The bracket array is keyed `pricingBrackets` on the wire.
 */
export interface DomesticPricingInput {
  shipmentType: PricingShipmentType; // "DOMESTIC"
  fromState: string;
  fromCity: string;
  toWhereState: string;
  toWhereCity: string;
  pricingBrackets: Array<{ minWeight: number; maxWeight: number; ratePerKg: number }>;
}
