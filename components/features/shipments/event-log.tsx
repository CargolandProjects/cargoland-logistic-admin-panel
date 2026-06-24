import { cn } from "@/lib/utils";
import type { EventLogEntry } from "@/types/shipment";

const DOT: Record<EventLogEntry["tone"], string> = {
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-indigo-500",
  gray: "bg-zinc-400",
};

export function EventLog({ entries }: { entries: EventLogEntry[] }) {
  return (
    <ul className="space-y-4">
      {entries.map((e) => (
        <li key={e.id} className="flex gap-3">
          <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", DOT[e.tone])} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{e.title}</p>
            <p className="text-xs text-muted-foreground">{e.meta}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
