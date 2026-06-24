export type PaymentStatus = "Pending" | "Success" | "Failed";
export type PaymentMethod = "Card" | "Bank Transfer" | "USSD";

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
