"use client";

import Link from "next/link";
import {
  ClipboardList,
  Truck,
  Wallet,
  FileClock,
  PackageCheck,
  Users,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

import { useDashboard, useDashboardAnalytics } from "@/lib/query/hooks/use-dashboard";
import { useProfile } from "@/lib/query/hooks/use-profile";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/stat-card";
import { RecentBookings } from "@/components/features/dashboard/recent-bookings";
import { ActivityFeed } from "@/components/features/dashboard/activity-feed";
import { ChartCard } from "@/components/features/dashboard/charts/chart-card";
import { StatusDonut } from "@/components/features/dashboard/charts/status-donut";
import { TypeSplit } from "@/components/features/dashboard/charts/type-split";
import { PaymentsBar } from "@/components/features/dashboard/charts/payments-bar";

// Icon per stat. Chips share one restrained mono tint (StatCard's default), so
// the row reads as a cohesive unit — color is reserved for badges/charts.
const STAT_ICONS: Record<string, LucideIcon> = {
  bookings: ClipboardList,
  active: Truck,
  revenue: Wallet,
  quotes: FileClock,
  delivered: PackageCheck,
  users: Users,
};

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const { data: analytics, isLoading: analyticsLoading } = useDashboardAnalytics();
  const { data: profile } = useProfile();

  const hasStatus = (analytics?.statusCounts ?? []).some((d) => d.value > 0);
  const hasType = (analytics?.typeCounts ?? []).some((d) => d.value > 0);
  const payments = analytics?.payments ?? { totalCollected: 0, pending: 0, failed: 0 };
  const hasPayments = payments.totalCollected + payments.pending + payments.failed > 0;
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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Hello {firstName}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">It&apos;s {today}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          : data?.stats.map((stat) => (
              <StatCard
                key={stat.key}
                label={stat.label}
                value={stat.value}
                icon={STAT_ICONS[stat.key]}
                trend={stat.trend}
                trendDirection={stat.trendDirection}
              />
            ))}
      </div>

      {/* Analytics charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard
          title="Shipment Status"
          isLoading={analyticsLoading}
          isEmpty={!hasStatus}
          emptyMessage="No shipments yet."
        >
          <StatusDonut data={analytics?.statusCounts ?? []} />
        </ChartCard>
        <ChartCard
          title="Shipment Type"
          isLoading={analyticsLoading}
          isEmpty={!hasType}
          emptyMessage="No shipments yet."
        >
          <TypeSplit data={analytics?.typeCounts ?? []} />
        </ChartCard>
        <ChartCard
          title="Payments"
          isLoading={analyticsLoading}
          isEmpty={!hasPayments}
          emptyMessage="No payments yet."
        >
          <PaymentsBar data={payments} />
        </ChartCard>
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
