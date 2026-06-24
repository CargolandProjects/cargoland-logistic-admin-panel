import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { JourneyStep } from "@/types/shipment";

export function TrackingTimeline({
  steps,
  progress,
  origin,
  destination,
}: {
  steps: JourneyStep[];
  progress: number;
  origin: string;
  destination: string;
}) {
  return (
    <div>
      {/* Progress header */}
      <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>{origin}</span>
        <span className="text-foreground">{progress}% Complete</span>
        <span>{destination}</span>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-brand-red" style={{ width: `${progress}%` }} />
      </div>

      {/* Steps */}
      <ol className="relative space-y-6">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <li key={step.title} className="relative flex gap-3">
              {!isLast && (
                <span
                  className={cn(
                    "absolute left-[11px] top-6 h-[calc(100%+2px)] w-0.5",
                    step.state === "done" ? "bg-indigo-500" : "bg-border",
                  )}
                />
              )}
              <span
                className={cn(
                  "z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                  step.state === "done" && "border-indigo-500 bg-indigo-500 text-white",
                  step.state === "active" && "border-brand-red bg-white text-brand-red",
                  step.state === "upcoming" && "border-border bg-white text-transparent",
                )}
              >
                {step.state === "done" ? (
                  <Check className="size-3.5" />
                ) : (
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      step.state === "active" ? "bg-brand-red" : "bg-border",
                    )}
                  />
                )}
              </span>
              <div className="min-w-0 pb-1">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    step.state === "upcoming" ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{step.timestamp}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
