"use client";

import { Donut } from "./donut";
import type { StatusDatum } from "@/types/dashboard";

/** Shipment status distribution donut. Zero-count statuses are dropped. */
export function StatusDonut({ data }: { data: StatusDatum[] }) {
  const slices = data
    .filter((d) => d.value > 0)
    .map((d) => ({ id: d.status, label: d.label, value: d.value, color: d.color }));
  return <Donut slices={slices} />;
}
