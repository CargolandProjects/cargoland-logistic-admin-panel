"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatNaira } from "@/lib/utils";
import type { PaymentSummary } from "@/types/payment";

/** Collected / Pending / Failed payments as a single-measure bar chart. */
export function PaymentsBar({ data }: { data: PaymentSummary }) {
  const bars = [
    { name: "Collected", value: data.totalCollected, color: "#0ca30c" },
    { name: "Pending", value: data.pending, color: "#f59e0b" },
    { name: "Failed", value: data.failed, color: "#e5392f" },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={bars} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#6b7090", fontSize: 12 }}
        />
        <YAxis hide />
        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as { name: string; value: number };
            return (
              <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
                <span className="font-medium text-foreground">{d.name}</span>
                <span className="ml-2 text-muted-foreground">{formatNaira(d.value)}</span>
              </div>
            );
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={64}>
          {bars.map((b) => (
            <Cell key={b.name} fill={b.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
