"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUnassignDriver } from "@/lib/query/hooks/use-vehicles";

/**
 * Confirmation for releasing a driver↔vehicle assignment. Prefers a known
 * `assignmentId`; otherwise the hook resolves the active assignment by `vehicleId`.
 * Reused by the driver card, the vehicles tab, and the vehicle status view.
 */
export function UnassignDriverDialog({
  open,
  onOpenChange,
  driverName,
  vehicleLabel,
  assignmentId,
  vehicleId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverName?: string;
  vehicleLabel?: string;
  assignmentId?: string;
  vehicleId?: string;
}) {
  const unassign = useUnassignDriver();

  const onConfirm = () => {
    unassign.mutate(
      { assignmentId, vehicleId },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unassign Driver</DialogTitle>
          <DialogDescription>
            Unassign {driverName ? `“${driverName}”` : "this driver"}
            {vehicleLabel ? ` from “${vehicleLabel}”` : ""}? The driver will return to the
            Unassigned state.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            disabled={unassign.isPending}
            className="h-11 w-full bg-brand-red text-white"
            onClick={onConfirm}
          >
            {unassign.isPending ? "Unassigning…" : "Unassign"}
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
