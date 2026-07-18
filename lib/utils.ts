import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a Naira amount, e.g. 450000 -> "₦450,000". */
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

/** Format a date string as "Apr 18, 2024"; returns "—" for empty/invalid input. */
export function formatDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

/**
 * Format a date+time as "Apr 18, 2024, 2:30 PM" — readable for non-developers.
 * Returns "—" for empty input, and passes through any already-formatted /
 * unparseable string unchanged (so pre-formatted values aren't mangled).
 */
export function formatDateTime(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a weight bracket, e.g. (1, 10) -> "1–10 kg". A single-point bracket
 * (min === max) collapses to "4 kg". Uses an en-dash and trims trailing zeros.
 */
export function formatWeightRange(min: number, max: number): string {
  const n = (v: number) => (Number.isFinite(v) ? String(+v) : "0");
  return min === max ? `${n(min)} kg` : `${n(min)}–${n(max)} kg`;
}
