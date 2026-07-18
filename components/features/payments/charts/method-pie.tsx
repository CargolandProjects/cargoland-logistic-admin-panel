"use client";

import { useMemo } from "react";

import { Donut } from "@/components/features/dashboard/charts/donut";
import { byMethod } from "@/lib/analytics/payments";
import type { PaymentTransaction } from "@/types/payment";

/** Payments split by method (Card / Bank Transfer / USSD). */
export function MethodPie({ transactions }: { transactions: PaymentTransaction[] }) {
  const slices = useMemo(() => byMethod(transactions), [transactions]);
  return <Donut slices={slices} />;
}
