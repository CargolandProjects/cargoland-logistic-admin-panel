import {
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
  type PaymentTransaction,
} from "@/types/payment";

/**
 * The "amount seam": every payment currently counts as 1. When the backend adds
 * a per-transaction amount, return `t.amount` here to switch counts → naira
 * across all three charts in one place.
 */
const weight = (t: PaymentTransaction): number => {
  void t; // becomes `return t.amount` once the backend adds per-transaction amounts
  return 1;
};

const METHOD_COLORS: Record<string, string> = {
  CARD: "var(--chart-1)",
  BANK_TRANSFER: "var(--chart-2)",
  USSD: "var(--chart-3)",
};

function parseDate(value: string): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
function monthKeyOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabelOf(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1).toLocaleString("en-US", { month: "short", year: "numeric" });
}

// --- Pie: payments by method -------------------------------------------------

export interface MethodSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

export function byMethod(txns: PaymentTransaction[]): MethodSlice[] {
  const counts = new Map<string, number>();
  for (const t of txns) counts.set(t.method, (counts.get(t.method) ?? 0) + weight(t));
  return [...counts.entries()]
    .map(([method, value]) => ({
      id: method,
      label: PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? method,
      value,
      color: METHOD_COLORS[method] ?? "var(--chart-4)",
    }))
    .sort((a, b) => b.value - a.value);
}

// --- Line: payments per month (continuous, gap-filled) -----------------------

export interface MonthPoint {
  key: string; // "YYYY-MM"
  label: string; // "Jul 2026"
  value: number;
}

/** Continuous monthly series from the first to last month present (0-filled). */
export function byMonth(txns: PaymentTransaction[]): MonthPoint[] {
  const counts = new Map<string, number>();
  for (const t of txns) {
    const d = parseDate(t.date);
    if (!d) continue;
    const k = monthKeyOf(d);
    counts.set(k, (counts.get(k) ?? 0) + weight(t));
  }
  if (counts.size === 0) return [];

  const keys = [...counts.keys()].sort();
  const [firstY, firstM] = keys[0].split("-").map(Number);
  const [lastY, lastM] = keys[keys.length - 1].split("-").map(Number);

  const out: MonthPoint[] = [];
  let y = firstY;
  let m = firstM;
  while (y < lastY || (y === lastY && m <= lastM)) {
    const k = `${y}-${String(m).padStart(2, "0")}`;
    out.push({ key: k, label: monthLabelOf(k), value: counts.get(k) ?? 0 });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

// --- Bar: top customers for a given month ------------------------------------

export interface MonthOption {
  key: string;
  label: string;
}

/** Months that actually have payments, newest first (for the picker). */
export function availableMonths(txns: PaymentTransaction[]): MonthOption[] {
  const set = new Set<string>();
  for (const t of txns) {
    const d = parseDate(t.date);
    if (d) set.add(monthKeyOf(d));
  }
  return [...set]
    .sort()
    .reverse()
    .map((key) => ({ key, label: monthLabelOf(key) }));
}

export interface CustomerBar {
  customer: string;
  value: number;
}

export function topCustomers(
  txns: PaymentTransaction[],
  monthKey: string,
  n = 5,
): CustomerBar[] {
  const counts = new Map<string, number>();
  for (const t of txns) {
    const d = parseDate(t.date);
    if (!d || monthKeyOf(d) !== monthKey) continue;
    const name = t.customer || "Unknown";
    counts.set(name, (counts.get(name) ?? 0) + weight(t));
  }
  return [...counts.entries()]
    .map(([customer, value]) => ({ customer, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, n);
}
