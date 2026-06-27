"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useVehicleTracking,
  useFleetTracking,
  useSingleFleetTracking,
} from "@/lib/query/hooks/use-vehicles";
import { SHIPMENT_STATUS_LABELS, type ShipmentStatus } from "@/types/shipment";

const STATUS_VALUES = Object.keys(SHIPMENT_STATUS_LABELS) as ShipmentStatus[];

export function FleetTrackingDialog({
  open,
  onOpenChange,
  vehicleTrackingId,
  singleShipmentId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleTrackingId?: string;
  /** When set, the modal tracks just this one shipment (single-fleet-tracking). */
  singleShipmentId?: string;
}) {
  const isSingle = Boolean(singleShipmentId);
  // Only load the package list for the whole-vehicle (multi) mode.
  const { data: tracking } = useVehicleTracking(open && !isSingle ? vehicleTrackingId : undefined);
  const fleet = useFleetTracking();
  const single = useSingleFleetTracking();
  const pending = fleet.isPending || single.isPending;

  const [status, setStatus] = useState<ShipmentStatus>("IN_TRANSIT");
  const [selected, setSelected] = useState<string[]>([]);

  const packages = tracking?.assignedShipments ?? [];

  const toggle = (id: string, checked: boolean) =>
    setSelected((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((p) => p !== id)));

  const close = () => {
    setSelected([]);
    onOpenChange(false);
  };

  const onUpdate = () => {
    if (!vehicleTrackingId) return;
    if (isSingle) {
      single.mutate(
        { vehicleTrackingId, shipmentTrackingId: singleShipmentId as string, status },
        { onSuccess: close },
      );
    } else {
      fleet.mutate({ vehicleTrackingId, status, selectedPackages: selected }, { onSuccess: close });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Fleet Tracking</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Delivery Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ShipmentStatus)}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue>{(v) => SHIPMENT_STATUS_LABELS[v as ShipmentStatus]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_VALUES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SHIPMENT_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isSingle ? (
            <div className="space-y-1.5">
              <Label>Package</Label>
              <div className="flex h-10 items-center rounded-lg border border-input bg-secondary/50 px-3 text-sm font-medium">
                {singleShipmentId}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>
                Select Packages <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="outline" className="h-10 w-full justify-between font-normal" />}
                >
                  <span className={selected.length ? "" : "text-muted-foreground"}>
                    {selected.length ? `${selected.length} selected` : "Select packages onboard"}
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-(--anchor-width)">
                  {packages.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No packages onboard.</div>
                  ) : (
                    packages.map((p) => (
                      <DropdownMenuCheckboxItem
                        key={p.id}
                        checked={selected.includes(p.trackingId)}
                        onCheckedChange={(c) => toggle(p.trackingId, Boolean(c))}
                        closeOnClick={false}
                      >
                        {p.trackingId}
                      </DropdownMenuCheckboxItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onUpdate} disabled={pending} className="h-11 w-full bg-brand-red text-white">
            {pending ? "Updating…" : "Update"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full border-brand-red text-brand-red"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
