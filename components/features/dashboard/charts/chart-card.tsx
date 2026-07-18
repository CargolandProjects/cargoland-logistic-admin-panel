"use client";

import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shared shell for a dashboard chart — matches the section-card pattern used on
 * the dashboard (Card + header). Reserves a fixed-height box so loading and
 * empty states don't shift layout.
 */
export function ChartCard({
  title,
  action,
  isLoading,
  isEmpty,
  emptyMessage = "No data yet.",
  children,
}: {
  title: string;
  action?: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : isEmpty ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </Card>
  );
}
