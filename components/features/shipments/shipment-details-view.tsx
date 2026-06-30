"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { formatNaira, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignShipmentToVehicleDialog } from "@/components/features/shipments/assign-shipment-to-vehicle-dialog";
import { useShipmentRecord } from "@/lib/query/hooks/use-shipments";
import type { ShipmentParty } from "@/types/shipment";

export function ShipmentDetailsView({ id }: { id: string }) {
  const { data: record, isLoading } = useShipmentRecord(id);
  const [assignOpen, setAssignOpen] = useState(false);

  if (isLoading || !record) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  const trackingLabel = record.trackingId.startsWith("#")
    ? record.trackingId
    : `#${record.trackingId}`;
  const amount = formatNaira(Number(record.price) || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-foreground">Shipment — {trackingLabel}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-brand-red"
            onClick={() => setAssignOpen(true)}
          >
            Assign to truck
          </Button>
          <Button
            size="sm"
            className="bg-brand-red text-white"
            nativeButton={false}
            render={<Link href={`/shipments/${id}/track`} />}
          >
            Track Shipment
          </Button>
        </div>
      </div>

      <Link
        href="/shipments"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ChevronLeft className="size-4" /> Back to Shipments
      </Link>

      {/* Shipment details */}
      <Card className="gap-6 p-6">
        <h2 className="text-base font-semibold text-foreground">Shipment details</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Party label="From" party={record.sender} />
          <Party label="To" party={record.receiver} />
          <Field label="Invoice Date" value={formatDate(record.invoiceDate)} />
          <Field label="Subject" value={record.freightType || "—"} />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            label="Shipment Summary"
            value={`${record.summaryFrom || "—"} → ${record.summaryTo || "—"}`}
          />
          <Field label="ID Number" value={record.idNumber || "—"} />
          <div className="lg:col-span-2 lg:text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Invoice of Naira</p>
            <p className="mt-1 text-2xl font-bold text-brand-red">{amount}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Shipment Weight</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Total Shipment Weight: {record.totalWeight || "—"} kg
            </p>
          </div>
          {record.images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {record.images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.publicId || i}
                  src={img.url}
                  alt={`Package ${i + 1}`}
                  className="size-14 rounded-lg border border-border object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <p className="text-sm text-brand-red">
          Please note that VAT is included in the total payment amount.
        </p>
      </Card>

      <AssignShipmentToVehicleDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        shipmentTrackingId={record.trackingId}
      />
    </div>
  );
}

function Party({ label, party }: { label: string; party: ShipmentParty }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{party.name || "—"}</p>
      {party.address && <p className="text-sm text-muted-foreground">{party.address}</p>}
      {party.city && <p className="text-sm text-muted-foreground">{party.city}</p>}
      {party.phone && <p className="text-sm text-muted-foreground">{party.phone}</p>}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
