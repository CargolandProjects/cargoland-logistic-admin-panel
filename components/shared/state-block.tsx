import type { ReactNode } from "react";
import { AlertTriangle, Inbox, SearchX, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Variant = "error" | "not-found" | "empty";

const PRESET: Record<Variant, { icon: LucideIcon; title: string; message: string }> = {
  error: {
    icon: AlertTriangle,
    title: "Something went wrong",
    message: "We couldn't load this right now. Please try again.",
  },
  "not-found": {
    icon: SearchX,
    title: "Not found",
    message: "This record doesn't exist or may have been removed.",
  },
  empty: {
    icon: Inbox,
    title: "Nothing here yet",
    message: "",
  },
};

/**
 * Centered icon + title + message for error / not-found / empty states. Replaces
 * infinite skeletons on failed reads and ad-hoc empty text.
 */
export function StateBlock({
  variant = "empty",
  title,
  message,
  icon,
  action,
  className,
}: {
  variant?: Variant;
  title?: string;
  message?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}) {
  const preset = PRESET[variant];
  const Icon = icon ?? preset.icon;
  const resolvedMessage = message ?? preset.message;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          variant === "error"
            ? "bg-destructive/10 text-destructive"
            : "bg-secondary text-muted-foreground",
        )}
      >
        <Icon className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title ?? preset.title}</p>
        {resolvedMessage && <p className="text-sm text-muted-foreground">{resolvedMessage}</p>}
      </div>
      {action}
    </div>
  );
}
