import { cn } from "@/lib/utils";

/** Persona block shown at the bottom of the sidebar. */
export function UserBadge({
  name,
  role,
  collapsed = false,
}: {
  name: string;
  role: string;
  collapsed?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg bg-white/10 p-3",
        collapsed && "justify-center p-2",
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white/20 text-xs font-semibold text-white">
        {initials}
      </span>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <p className="truncate text-xs text-white/70">{role}</p>
        </div>
      )}
    </div>
  );
}
