import type { Shipment } from "@/types/shipment";

/**
 * A customer is DERIVED by aggregating `/admin/shipments` rows (there is no
 * customer-list endpoint). Only fields present on the shipment payload are real.
 */
export interface Customer {
  /** Directory key — lowercased email (or userId / name fallback). Used in the URL. */
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  /** Number of shipments (the app has no separate "bookings" concept). */
  bookings: number;
  /** Sum of shipment prices. */
  totalSpent: number;
  /** Count of delivered shipments. */
  delivered: number;
  /** Earliest shipment createdAt. */
  customerSince: string;
  /** Latest shipment updatedAt. */
  lastActive: string;
}

export interface CustomerProfile extends Customer {
  /** Most frequent `from → to` across the customer's shipments. */
  preferredRoute: string;
  /** totalSpent / bookings. */
  averageSpend: number;
  /** The customer's shipments (mapped to the list view-type). */
  shipments: Shipment[];
}
