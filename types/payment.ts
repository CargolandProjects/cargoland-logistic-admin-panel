// Backend values are uppercase enums (verified from live data).
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";
export type PaymentMethod = "CARD" | "BANK_TRANSFER" | "USSD";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  SUCCESS: "Successful",
  FAILED: "Failed",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  USSD: "USSD",
};

/** Friendly label for a method value, falling back to the raw value. */
export function paymentMethodLabel(method: string): string {
  return PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? method;
}

export interface PaymentTransaction {
  id: string;
  bookingRef: string;
  customer: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  status: PaymentStatus;
}

export interface PaymentSummary {
  totalCollected: number;
  pending: number;
  failed: number;
}

export interface PaymentsData {
  summary: PaymentSummary;
  transactions: PaymentTransaction[];
}
