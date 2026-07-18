"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface DonutSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

/**
 * Donut with a labelled legend below (identity is never color-alone). Colors are
 * passed as explicit hex — recharts SVG fills can't read Tailwind classes.
 */
export function Donut({ slices }: { slices: DonutSlice[] }) {
  const total = slices.reduce((sum, d) => sum + d.value, 0);
  const pctOf = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="label"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={2}
            stroke="var(--card)"
            strokeWidth={2}
          >
            {slices.map((s) => (
              <Cell key={s.id} fill={s.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as DonutSlice;
              return (
                <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
                  <span className="font-medium text-foreground">{d.label}</span>
                  <span className="ml-2 text-muted-foreground">
                    {d.value} ({pctOf(d.value)}%)
                  </span>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {slices.map((s) => (
          <li key={s.id} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="truncate text-muted-foreground">{s.label}</span>
            <span className="ml-auto font-medium text-foreground">{s.value}</span>
            <span className="w-9 text-right text-muted-foreground">{pctOf(s.value)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
