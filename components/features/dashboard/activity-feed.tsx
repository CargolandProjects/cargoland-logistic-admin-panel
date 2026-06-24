import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/types/dashboard";

const DOT_COLOR: Record<ActivityItem["kind"], string> = {
  booking: "bg-red-500",
  payment: "bg-green-500",
  shipment: "bg-indigo-500",
  quote: "bg-amber-500",
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <ul className="space-y-5">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3">
          <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", DOT_COLOR[item.kind])} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.meta}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
