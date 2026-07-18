"use client";

import { Donut } from "./donut";
import type { TypeDatum } from "@/types/dashboard";

/** Local vs International shipment split. */
export function TypeSplit({ data }: { data: TypeDatum[] }) {
  const slices = data
    .filter((d) => d.value > 0)
    .map((d) => ({ id: d.type, label: d.type, value: d.value, color: d.color }));
  return <Donut slices={slices} />;
}
