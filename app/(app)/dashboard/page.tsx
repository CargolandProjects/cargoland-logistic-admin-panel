"use client";

import Link from "next/link";
import {
  ClipboardList,
  Truck,
  Banknote,
  FileText,
  PackageCheck,
  Users,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

import { useDashboard } from "@/lib/query/hooks/use-dashboard";
import { useProfile } from "@/lib/query/hooks/use-profile";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/stat-card";
import { RecentBookings } from "@/components/features/dashboard/recent-bookings";
import { ActivityFeed } from "@/components/features/dashboard/activity-feed";

const STAT_ICONS: Record<string, { icon: LucideIcon; className: string }> = {
  bookings: { icon: ClipboardList, className: "bg-indigo-100 text-indigo-600" },
  active: { icon: Truck, className: "bg-blue-100 text-blue-600" },
  revenue: { icon: Banknote, className: "bg-rose-100 text-rose-600" },
  quotes: { icon: FileText, className: "bg-amber-100 text-amber-600" },
  delivered: { icon: PackageCheck, className: "bg-violet-100 text-violet-600" },
  users: { icon: Users, className: "bg-teal-100 text-teal-600" },
};

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const { data: profile } = useProfile();
  const firstName = profile?.name?.split(" ")[0] || "there";

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hello {firstName}</h1>
        <p className="text-sm text-muted-foreground">It&apos;s {today}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          : data?.stats.map((stat) => {
              const meta = STAT_ICONS[stat.key];
              return (
                <StatCard
                  key={stat.key}
                  label={stat.label}
                  value={stat.value}
                  icon={meta?.icon}
                  iconClassName={meta?.className}
                  trend={stat.trend}
                  trendDirection={stat.trendDirection}
                />
              );
            })}
      </div>

      {/* Recent bookings + activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Bookings</h2>
            <Link
              href="/shipments"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              See all <ArrowRight className="size-4" />
            </Link>
          </div>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <RecentBookings data={data?.recentBookings ?? []} />
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Activity Feed</h2>
            <Link
              href="#"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ActivityFeed items={data?.activity ?? []} />
          )}
        </Card>
      </div>
    </div>
  );
}
