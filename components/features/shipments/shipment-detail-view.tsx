"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Package, Truck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { useShipment } from "@/lib/query/hooks/use-shipments";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { shipmentStatusLabel } from "@/types/shipment";
import { TrackingTimeline } from "@/components/features/shipments/tracking-timeline";
import { TelemetryPanel } from "@/components/features/shipments/telemetry-panel";
import { EventLog } from "@/components/features/shipments/event-log";
import { FlagDelayDialog } from "@/components/features/shipments/flag-delay-dialog";
import { ReassignDriverDialog } from "@/components/features/shipments/reassign-driver-dialog";

export function ShipmentDetailView({ id }: { id: string }) {
  const { data: s, isLoading } = useShipment(id);
  const [flagOpen, setFlagOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);

  if (isLoading || !s) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-96" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-foreground">
          Live Tracking — {s.trackingId} ↔ {s.vehicleId} ({s.fleet})
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Contact driver isn't available yet.")}
          >
            Contact Driver
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-green-200 text-green-700"
            onClick={() => toast.info("Mark delivered isn't available yet.")}
          >
            Mark Delivered
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-destructive"
            onClick={() => setFlagOpen(true)}
          >
            Flag Issue
          </Button>
          <Button
            size="sm"
            className="bg-brand-red text-white"
            onClick={() => toast.info("Update status isn't available yet.")}
          >
            Update Status
          </Button>
        </div>
      </div>

      <Link
        href="/shipments"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ChevronLeft className="size-4" /> Back to Shipments
      </Link>

      {/* Summary strip */}
      <Card className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 lg:grid-cols-6">
        <Info label="Package Tracking ID" value={s.trackingId} />
        <Info label="Sync" value="Live Sync" />
        <Info label="Fleet Vehicle ID" value={s.vehicleId} />
        <Info label="Shipment Type" value={s.type} />
        <Info label="Customer" value={s.customer} />
        <Info label="Booking" value={s.bookingRef} />
      </Card>

      {/* Journey + Telemetry */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Package className="size-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-semibold">Package Journey</h2>
              <p className="text-xs text-muted-foreground">Customer-facing status</p>
            </div>
            <StatusBadge status={shipmentStatusLabel(s.status)} className="ml-auto" />
          </div>
          <TrackingTimeline
            steps={s.journey}
            progress={s.progress}
            origin={s.route.from}
            destination={s.route.to}
          />
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Truck className="size-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-semibold">Fleet Vehicle Telemetry</h2>
              <p className="text-xs text-muted-foreground">Cargoland internal vehicle data</p>
            </div>
            <span className="ml-auto rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
              {s.vehicleId}
            </span>
          </div>
          <TelemetryPanel
            shipment={s}
            onReassignDriver={() => setReassignOpen(true)}
            onFlagDelay={() => setFlagOpen(true)}
          />
        </Card>
      </div>

      {/* Package details + recipient / event log */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold">Package Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Info label="Weight" value={s.packageDetails.weight} />
            <Info label="Content" value={s.packageDetails.content} />
            <Info label="Service" value={s.packageDetails.service} />
            <Info label="Fragile" value={s.packageDetails.fragile} />
          </div>
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recipient
            </p>
            <p className="text-sm font-semibold text-foreground">{s.recipient.name}</p>
            <p className="text-sm text-muted-foreground">{s.recipient.address}</p>
            <p className="text-sm text-muted-foreground">{s.recipient.phone}</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <RefreshCw className="size-4 text-indigo-600" />
            <h2 className="text-base font-semibold">Auto-synced Event Log</h2>
          </div>
          <EventLog entries={s.eventLog} />
        </Card>
      </div>

      <FlagDelayDialog id={id} open={flagOpen} onOpenChange={setFlagOpen} />
      <ReassignDriverDialog id={id} open={reassignOpen} onOpenChange={setReassignOpen} />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
