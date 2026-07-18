"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { TablePagination } from "@/components/shared/table-pagination";
import type { ActivityItem } from "@/types/dashboard";

const DOT_COLOR: Record<ActivityItem["kind"], string> = {
  booking: "bg-red-500",
  payment: "bg-green-500",
  shipment: "bg-indigo-500",
  quote: "bg-amber-500",
};

const PAGE_SIZE = 5;

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  // Reset to the first page when the dataset size changes (render-phase, per
  // React's recommended pattern — avoids a set-state-in-effect cascade).
  const [prevLength, setPrevLength] = useState(items.length);
  if (prevLength !== items.length) {
    setPrevLength(items.length);
    setPage(1);
  }

  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No recent activity.</p>;
  }

  const currentPage = Math.min(page, pageCount);
  const visible = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <ul className="space-y-5">
        {visible.map((item) => (
          <li key={item.id} className="flex gap-3">
            <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", DOT_COLOR[item.kind])} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.meta}</p>
            </div>
          </li>
        ))}
      </ul>
      <TablePagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
    </div>
  );
}
