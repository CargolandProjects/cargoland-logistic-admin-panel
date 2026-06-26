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
    method: (raw.method as PaymentMethod) ?? "CARD",
    date: raw.date ?? raw.createdAt ?? "",
    status: (raw.status as PaymentStatus) ?? "PENDING",
  };
}

/**
 * Filter transactions client-side. The backend's `search`/`method` filters are
 * unreliable (return empty even for matching rows) and mixed-case status/method
 * values 500, so we fetch unfiltered and narrow here against the real values.
 */
function filterTransactions(
  rows: PaymentTransaction[],
  filters: PaymentFilters,
): PaymentTransaction[] {
  let out = rows;
  const { search, status, method } = filters;
  if (search) {
    const q = search.toLowerCase();
    out = out.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.bookingRef.toLowerCase().includes(q) ||
        t.customer.toLowerCase().includes(q),
    );
  }
  if (status && status !== "all") out = out.filter((t) => t.status === status);
  if (method && method !== "all") out = out.filter((t) => t.method === method);
  return out;
}

async function getSummary(): Promise<PaymentSummary> {
  if (MOCKS.payments) return MOCK_PAYMENTS.summary;
  return api.get<PaymentSummary>("/admin/payments/stats");
}

export async function getPayments(filters: PaymentFilters = {}): Promise<PaymentsData> {
  if (MOCKS.payments) {
    return mockDelay({
      ...MOCK_PAYMENTS,
      transactions: filterTransactions(MOCK_PAYMENTS.transactions, filters),
    });
  }

  // Fetch unfiltered (only paginate) — server-side search/method are broken and
  // bad enum casing 500s — then filter client-side against the real values.
  const params = new URLSearchParams();
  params.set("skip", String(filters.skip ?? 0));
  params.set("take", String(filters.take ?? 100));

  const [summary, list] = await Promise.all([
    getSummary(),
    apiList.get<RawPayment>(`/admin/payments?${params.toString()}`),
  ]);

  return {
    summary,
    transactions: filterTransactions(list.data.map(mapPayment), filters),
  };
}
