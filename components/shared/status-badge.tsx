import { cn } from "@/lib/utils";

type Tone = "amber" | "green" | "blue" | "red" | "purple" | "gray";

const TONE_CLASSES: Record<Tone, string> = {
  amber: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
  blue: "bg-blue-100 text-blue-700",
  red: "bg-red-100 text-red-700",
  purple: "bg-indigo-100 text-indigo-700",
  gray: "bg-zinc-100 text-zinc-600",
};

/** Map a status label to a color tone. Unknown statuses fall back to gray. */
function toneFor(status: string): Tone {
  const s = status.toLowerCase().replace(/[\s_-]+/g, "");
  if (["pending", "processing", "awaiting", "atoriginhub", "customclearance", "customsclearance"].includes(s))
    return "amber";
  if (["approved", "delivered", "success", "successful", "active", "paid", "completed"].includes(s))
    return "green";
  if (["intransit", "transit", "shipped", "ontheway", "assigned", "pickedup", "destination", "atdestination"].includes(s))
    return "blue";
  if (["rejected", "failed", "cancelled", "canceled", "error", "inactive", "deactivated"].includes(s))
    return "red";
  if (["local", "international", "intl", "doortodoor", "maintenance", "standy"].includes(s)) return "purple";
  return "gray";
}

export function StatusBadge({
  status,
  tone,
  className,
}: {
  status: string;
  /** Override the auto-detected tone. */
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        TONE_CLASSES[tone ?? toneFor(status)],
        className,
      )}
    >
      {status}
    </span>
  );
}
