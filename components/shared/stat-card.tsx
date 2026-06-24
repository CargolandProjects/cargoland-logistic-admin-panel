import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  /** Tailwind classes for the icon chip (bg + text). */
  iconClassName?: string;
  /** Footer trend text, e.g. "+12% this month". */
  trend?: string;
  trendDirection?: "up" | "down";
  /** Tinted variant used by the payments summary cards. */
  tone?: "default" | "green" | "amber" | "red";
  /** Show a small "Demo" pill when the card is backed by mock data. */
  demo?: boolean;
  className?: string;
}

const TONE_CARD: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "",
  green: "bg-green-50 border-green-100",
  amber: "bg-amber-50 border-amber-100",
  red: "bg-red-50 border-red-100",
};

const TONE_VALUE: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-foreground",
  green: "text-green-700",
  amber: "text-amber-700",
  red: "text-red-700",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName = "bg-indigo-100 text-indigo-600",
  trend,
  trendDirection = "up",
  tone = "default",
  demo = false,
  className,
}: StatCardProps) {
  const TrendIcon = trendDirection === "down" ? TrendingDown : TrendingUp;

  return (
    <Card className={cn("gap-0 p-5", TONE_CARD[tone], className)}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {demo && (
          <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
            Demo
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3">
        {Icon && (
          <span className={cn("flex size-10 items-center justify-center rounded-lg", iconClassName)}>
            <Icon className="size-5" />
          </span>
        )}
        <span className={cn("text-2xl font-bold", TONE_VALUE[tone])}>{value}</span>
      </div>
      {trend && (
        <div
          className={cn(
            "mt-4 flex items-center gap-1 text-xs font-medium",
            trendDirection === "down" ? "text-red-600" : "text-green-600",
          )}
        >
          <TrendIcon className="size-3.5" />
          {trend}
        </div>
      )}
    </Card>
  );
}
