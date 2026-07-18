"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { availableMonths, topCustomers } from "@/lib/analytics/payments";
import type { PaymentTransaction } from "@/types/payment";

/** Top 5 customers by payment count for a selected month. */
export function TopCustomersBar({ transactions }: { transactions: PaymentTransaction[] }) {
  const months = useMemo(() => availableMonths(transactions), [transactions]);
  const [monthKey, setMonthKey] = useState("");
  const activeKey = months.some((m) => m.key === monthKey) ? monthKey : (months[0]?.key ?? "");

  const data = useMemo(
    () => topCustomers(transactions, activeKey, 5),
    [transactions, activeKey],
  );

  return (
    <div>
      {/* Month picker */}
      <div className="mb-3 flex justify-end">
        <Select value={activeKey} onValueChange={(v) => setMonthKey(v as string)}>
          <SelectTrigger className="h-9 min-w-[150px]">
            <SelectValue>
              {(v) => months.find((m) => m.key === v)?.label ?? "Select month"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.key} value={m.key}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[230px] items-center justify-center text-sm text-muted-foreground">
          No payments in this month.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={230}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
          >
            <XAxis type="number" allowDecimals={false} hide />
            <YAxis
              type="category"
              dataKey="customer"
              width={110}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7090", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as { customer: string; value: number };
                return (
                  <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
                    <span className="font-medium text-foreground">{d.customer}</span>
                    <span className="ml-2 text-muted-foreground">
                      {d.value} payment{d.value === 1 ? "" : "s"}
                    </span>
                  </div>
                );
              }}
            />
            <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 4, 4, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
