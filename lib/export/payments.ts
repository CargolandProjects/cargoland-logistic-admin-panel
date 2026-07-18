import { formatDateTime } from "@/lib/utils";
import {
  PAYMENT_STATUS_LABELS,
  paymentMethodLabel,
  type PaymentTransaction,
} from "@/types/payment";

/**
 * Export the given (already-filtered) payment transactions as a real .xlsx.
 * The library is dynamically imported (browser build) so it stays out of the
 * initial bundle and only loads when an admin actually exports.
 */
export async function exportPaymentsXlsx(
  transactions: PaymentTransaction[],
  today: Date = new Date(),
): Promise<void> {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");

  const fileDate = today.toISOString().slice(0, 10);
  const header = (value: string) => ({ value, fontWeight: "bold" as const });

  await writeXlsxFile(transactions, {
    columns: [
      { header: header("Transaction ID"), width: 28, cell: (t) => t.id },
      { header: header("Booking Ref"), width: 18, cell: (t) => t.bookingRef },
      { header: header("Customer"), width: 24, cell: (t) => t.customer },
      { header: header("Method"), width: 16, cell: (t) => paymentMethodLabel(t.method) },
      { header: header("Date"), width: 22, cell: (t) => formatDateTime(t.date) },
      {
        header: header("Amount (NGN)"),
        width: 16,
        cell: (t) => ({ type: Number, value: t.amount, format: "#,##0.00" }),
      },
      {
        header: header("Status"),
        width: 14,
        cell: (t) => PAYMENT_STATUS_LABELS[t.status] ?? t.status,
      },
    ],
  }).toFile(`payments-${fileDate}.xlsx`);
}
