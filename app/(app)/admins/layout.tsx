"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, ScrollText, KeyRound, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const SUB_NAV: { label: string; description: string; href: string; icon: LucideIcon }[] = [
  { label: "Admins", description: "Accounts & roles", href: "/admins", icon: ShieldCheck },
  { label: "Activity Log", description: "Audit trail", href: "/admins/activity", icon: ScrollText },
  { label: "Manage Access", description: "Role permissions", href: "/admins/access", icon: KeyRound },
];

export default function AdminsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <PageHeader title="Admins" subtitle="Manage admin accounts, activity and access." />

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="shrink-0 lg:w-64">
          <Card className="gap-1 p-2 lg:sticky lg:top-6">
            {SUB_NAV.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition",
                    active ? "bg-brand-red text-white shadow-sm" : "hover:bg-secondary",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg transition",
                      active ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground group-hover:bg-background",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block text-sm font-medium", active ? "text-white" : "text-foreground")}>
                      {item.label}
                    </span>
                    <span className={cn("block text-xs", active ? "text-white/80" : "text-muted-foreground")}>
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </Card>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
