import { api, apiList } from "@/lib/api/client";
import { MOCKS, mockDelay } from "@/lib/api/mock/config";
import { MOCK_PAYMENTS } from "@/lib/api/mock/payments";
import type {
  PaymentMethod,
  PaymentStatus,
  PaymentSummary,
  PaymentTransaction,
  PaymentsData,
} from "@/types/payment";

export interface PaymentFilters {
  search?: string;
  status?: string;
  method?: string;
  skip?: number;
  take?: number;
}

/** Best-effort shape of a payments row (unverified — data empty on dev). */
interface RawPayment {
  id?: string;
  transactionId?: string;
  reference?: string;
  bookingRef?: string;
  bookingReference?: string;
  customer?: string;
  customerName?: string;
  amount?: number;
  method?: string;
  date?: string;
  createdAt?: string;
  status?: string;
}

function mapPayment(raw: RawPayment, i: number): PaymentTransaction {
  return {
    id: raw.transactionId ?? raw.id ?? raw.reference ?? `TXN-${i}`,
    bookingRef: raw.bookingRef ?? raw.bookingReference ?? "",
    customer: raw.customer ?? raw.customerName ?? "",
    amount: raw.amount ?? 0,
    method: (raw.method as PaymentMethod) ?? "Card",
    date: raw.date ?? raw.createdAt ?? "",
    status: (raw.status as PaymentStatus) ?? "Pending",
  };
}

async function getSummary(): Promise<PaymentSummary> {
  if (MOCKS.payments) return MOCK_PAYMENTS.summary;
  return api.get<PaymentSummary>("/admin/payments/stats");
}

export async function getPayments(filters: PaymentFilters = {}): Promise<PaymentsData> {
  if (MOCKS.payments) {
    let transactions = MOCK_PAYMENTS.transactions;
    const { search, status, method } = filters;
    if (search) {
      const q = search.toLowerCase();
      transactions = transactions.filter(
        (t) => t.bookingRef.toLowerCase().includes(q) || t.customer.toLowerCase().includes(q),
      );
    }
    if (status && status !== "all") transactions = transactions.filter((t) => t.status === status);
    if (method && method !== "all") transactions = transactions.filter((t) => t.method === method);
    return mockDelay({ ...MOCK_PAYMENTS, transactions });
  }

  const params = new URLSearchParams();
  params.set("skip", String(filters.skip ?? 0));
  params.set("take", String(filters.take ?? 10));
  if (filters.search) params.set("search", filters.search);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.method && filters.method !== "all") params.set("method", filters.method);

  const [summary, list] = await Promise.all([
    getSummary(),
    apiList.get<RawPayment>(`/admin/payments?${params.toString()}`),
  ]);

  return {
    summary,
    transactions: list.data.map(mapPayment),
  };
}
