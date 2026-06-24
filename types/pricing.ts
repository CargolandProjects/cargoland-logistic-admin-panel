/** Backend pricing shipping-type enum (verbatim — note the "INTERNATION" spelling). */
export type PricingShippingType =
  | "INTERNATION_SHIPPING"
  | "LOCAL_SHIPPING"
  | "DOOR_TO_DOOR_SHIPPING";

export const PRICING_TYPE_LABELS: Record<PricingShippingType, string> = {
  INTERNATION_SHIPPING: "International Shipping",
  LOCAL_SHIPPING: "Local Shipping",
  DOOR_TO_DOOR_SHIPPING: "Door-to-Door Shipping",
};

export const PRICING_TYPE_OPTIONS = (
  Object.keys(PRICING_TYPE_LABELS) as PricingShippingType[]
).map((value) => ({ value, label: PRICING_TYPE_LABELS[value] }));

/** A pricing rule item (IPricingDoc). Rates are strings in the API. */
export interface Pricing {
  id: string;
  pricingShippingType: PricingShippingType;
  airFreightRate: string;
  roadFreightRate: string;
  oceanFreightRate: string;
  fromWhere: string;
  toWhere: string;
  createdAt?: string;
  updatedAt?: string;
}

/** POST/PUT /admin/pricing body (PricingDto). */
export interface PricingInput {
  pricingShippingType: PricingShippingType;
  airFreightRate: string;
  roadFreightRate: string;
  oceanFreightRate: string;
  fromWhere: string;
  toWhere: string;
}
