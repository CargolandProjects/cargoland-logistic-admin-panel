"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Package, Route, Wallet, type LucideIcon } from "lucide-react";

import { formatNaira, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCustomer } from "@/lib/query/hooks/use-customers";
import { usePayments } from "@/lib/query/hooks/use-payments";
import { shipmentStatusLabel, type Shipment } from "@/types/shipment";
import {
  PAYMENT_STATUS_LABELS,
  paymentMethodLabel,
  type PaymentTransaction,
} from "@/types/payment";

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

const shipmentColumns: Column<Shipment>[] = [
  { header: "Tracking ID", cell: (s) => <span className="font-medium text-brand-red">{s.trackingId || "—"}</span> },
  {
    header: "Route",
    cell: (s) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {s.route.from || "—"} <span className="mx-1">→</span> {s.route.to || "—"}
      </span>
    ),
  },
  { header: "Type", cell: (s) => <StatusBadge status={s.type} tone="purple" /> },
  { header: "Status", cell: (s) => <StatusBadge status={shipmentStatusLabel(s.status)} /> },
];

const paymentColumns: Column<PaymentTransaction>[] = [
  { header: "Transaction ID", cell: (p) => <span className="font-medium">{p.id}</span> },
  {
    header: "Method",
    cell: (p) => <span className="text-muted-foreground">{paymentMethodLabel(p.method)}</span>,
  },
  { header: "Date", cell: (p) => <span className="text-muted-foreground">{p.date || "—"}</span> },
  {
    header: "Status",
    cell: (p) => <StatusBadge status={PAYMENT_STATUS_LABELS[p.status] ?? p.status} />,
  },
];

export function UserProfileView({ customerKey }: { customerKey: string }) {
  const router = useRouter();
  const { data: profile, isLoading } = useCustomer(customerKey);

  // Payments are matched client-side by customer name (the only shared key).
  const paymentFilters = useMemo(() => ({ search: profile?.name ?? "", take: 100 }), [profile?.name]);
  const { data: payments, isLoading: paymentsLoading } = usePayments(paymentFilters);

  const lastBooking = useMemo(() => {
    const list = profile?.shipments ?? [];
    if (list.length === 0) return null;
    return [...list].sort((a, b) => (b.lastUpdated || "").localeCompare(a.lastUpdated || ""))[0];
  }, [profile?.shipments]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <Link
          href="/users"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ChevronLeft className="size-4" /> Back to Users
        </Link>
        <Card className="p-10 text-center text-muted-foreground">
          No customer found for “{customerKey}”.
        </Card>
      </div>
    );
  }

  const paymentRows = payments?.transactions ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-foreground">User Profile — {profile.name}</h1>
        <Link
          href="/users"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ChevronLeft className="size-4" /> Back to Users
        </Link>
      </div>

      {/* Identity banner */}
      <Card className="gap-0 bg-gradient-to-br from-violet-700 to-indigo-700 p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-brand-red text-lg font-bold">
              {initials(profile.name)}
            </span>
            <div>
              <p className="text-lg font-semibold">{profile.name || "—"}</p>
              <p className="text-sm text-white/80">
                {profile.email || "—"}
                {profile.phone ? ` · ${profile.phone}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.country && (
                  <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-medium">
                    {profile.country}
                  </span>
                )}
                {profile.customerSince && (
                  <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-medium">
                    Customer since {formatDate(profile.customerSince)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-8 text-center">
            <div>
              <p className="text-2xl font-bold">{profile.bookings}</p>
              <p className="text-xs uppercase tracking-wide text-white/70">Bookings</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{profile.delivered}</p>
              <p className="text-xs uppercase tracking-wide text-white/70">Delivered</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNaira(profile.totalSpent)}</p>
              <p className="text-xs uppercase tracking-wide text-white/70">Total Spent</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InfoCard icon={Package} label="Last Booking">
          {lastBooking ? (
            <>
              <p className="text-base font-semibold text-foreground">{lastBooking.trackingId || "—"}</p>
              <p className="text-xs text-muted-foreground">
                {lastBooking.route.from || "—"} → {lastBooking.route.to || "—"} ·{" "}
                {shipmentStatusLabel(lastBooking.status)}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No shipments yet</p>
          )}
        </InfoCard>
        <InfoCard icon={Route} label="Preferred Route">
          <p className="text-base font-semibold text-foreground">{profile.preferredRoute}</p>
          <p className="text-xs text-muted-foreground">Most frequent route</p>
        </InfoCard>
        <InfoCard icon={Wallet} label="Average Spend">
          <p className="text-base font-semibold text-foreground">{formatNaira(profile.averageSpend)}</p>
          <p className="text-xs text-muted-foreground">Per booking</p>
        </InfoCard>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="shipments">
        <TabsList>
          <TabsTrigger value="shipments">Shipments ({profile.shipments.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="account">Account Details</TabsTrigger>
        </TabsList>

        <TabsContent value="shipments">
          <Card className="p-2">
            <DataTable
              columns={shipmentColumns}
              data={profile.shipments}
              rowKey={(s) => s.id}
              onRowClick={(s) => router.push(`/shipments/${s.id}`)}
              pageSize={10}
              emptyMessage="No shipments for this customer."
            />
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="p-2">
            <DataTable
              columns={paymentColumns}
              data={paymentRows}
              rowKey={(p) => p.id}
              isLoading={paymentsLoading}
              pageSize={10}
              emptyMessage="No payments for this customer."
            />
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card className="p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Full Name" value={profile.name} />
              <Field label="Email Address" value={profile.email} />
              <Field label="Phone" value={profile.phone} />
              <Field label="Country" value={profile.country} />
              <Field label="Member Since" value={formatDate(profile.customerSince)} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <Card className="gap-2 p-5">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-4 text-indigo-600" /> {label}
      </div>
      {children}
    </Card>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 rounded-lg bg-secondary/50 px-3 py-2 text-sm font-medium text-foreground">
        {value || "—"}
      </p>
    </div>
  );
}
