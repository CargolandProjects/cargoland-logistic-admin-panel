"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/lib/nav";
import { useUIStore } from "@/stores/ui-store";
import { useProfile } from "@/lib/query/hooks/use-profile";
import { ROLE_LABELS } from "@/types/auth";
import { UserBadge } from "@/components/layout/user-badge";

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle = useUIStore((s) => s.toggleSidebar);
  const { data: profile } = useProfile();

  return (
    <aside
      className={cn(
        "bg-sidebar-gradient sticky top-0 flex h-dvh shrink-0 flex-col text-white transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between gap-2 px-4 py-5">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white/15">
            <Package className="size-5" />
          </span>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">
              Cargo<span className="text-brand-red">Land</span>
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                {group.title}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-brand-red text-white shadow-sm"
                          : "text-white/80 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon className="size-5 shrink-0" />
                      {!collapsed && <span className="flex-1">{item.label}</span>}
                      {!collapsed && item.badge != null && (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                            active ? "bg-white/25 text-white" : "bg-white/10 text-white/70",
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Persona */}
      <div className="p-3">
        <UserBadge
          name={profile?.name || "Admin"}
          role={profile ? (ROLE_LABELS[profile.role] ?? profile.role) : "—"}
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
}
