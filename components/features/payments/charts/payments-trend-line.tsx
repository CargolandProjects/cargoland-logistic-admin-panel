"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { byMonth } from "@/lib/analytics/payments";
import type { PaymentTransaction } from "@/types/payment";

const RANGES = [
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "12M", months: 12 },
  { label: "All", months: 0 },
];

export function PaymentsTrendLine({ transactions }: { transactions: PaymentTransaction[] }) {
  const series = useMemo(() => byMonth(transactions), [transactions]);
  const [rangeIdx, setRangeIdx] = useState(RANGES.length - 1); // default "All"

  const months = RANGES[rangeIdx].months;
  const data = months > 0 ? series.slice(-months) : series;

  return (
    <div>
      {/* Range presets */}
      <div className="mb-3 flex justify-end">
        <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-0.5">
          {RANGES.map((r, i) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setRangeIdx(i)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                i === rangeIdx
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6b7090", fontSize: 12 }}
            minTickGap={16}
          />
          <YAxis
            allowDecimals={false}
            width={28}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6b7090", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as { label: string; value: number };
              return (
                <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
                  <span className="font-medium text-foreground">{d.label}</span>
                  <span className="ml-2 text-muted-foreground">
                    {d.value} payment{d.value === 1 ? "" : "s"}
                  </span>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--chart-1)", strokeWidth: 0 }}
            activeDot={{ r: 5, stroke: "var(--card)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
