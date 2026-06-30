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
