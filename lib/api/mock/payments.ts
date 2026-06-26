import type { PaymentsData } from "@/types/payment";

export const MOCK_PAYMENTS: PaymentsData = {
  summary: {
    totalCollected: 8420000,
    pending: 1240000,
    failed: 110000,
  },
  transactions: [
    {
      id: "#TXN-7821",
      bookingRef: "#BK-0090",
      customer: "Emeka Obi",
      amount: 450000,
      method: "CARD",
      date: "Apr 18, 12:04",
      status: "PENDING",
    },
    {
      id: "#TXN-7820",
      bookingRef: "#BK-0265",
      customer: "Fatima Yusuf",
      amount: 220000,
      method: "BANK_TRANSFER",
      date: "Apr 18, 09:31",
      status: "SUCCESS",
    },
    {
      id: "#TXN-7820",
      bookingRef: "#BK-0264",
      customer: "Chidi Nwosu",
      amount: 95000,
      method: "USSD",
      date: "Apr 17, 16:55",
      status: "FAILED",
    },
    {
      id: "#TXN-7818",
      bookingRef: "#BK-0263",
      customer: "Amara Eze",
      amount: 130000,
      method: "BANK_TRANSFER",
      date: "Apr 17, 16:55",
      status: "SUCCESS",
    },
  ],
};
