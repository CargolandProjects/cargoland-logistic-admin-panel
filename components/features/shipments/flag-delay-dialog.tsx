"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFlagDelay } from "@/lib/query/hooks/use-shipments";

const schema = z.object({
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function FlagDelayDialog({
  id,
  open,
  onOpenChange,
}: {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const flagDelay = useFlagDelay(id);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "", notes: "" },
  });

  const onSubmit = (values: FormValues) =>
    flagDelay.mutate(values, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Flag Delay</DialogTitle>
          <DialogDescription>Record a delay for this shipment.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Input id="reason" className="h-10" placeholder="e.g. Traffic on route" {...register("reason")} />
            {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input id="notes" className="h-10" placeholder="Additional context" {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={flagDelay.isPending} className="bg-brand-red text-white">
              {flagDelay.isPending ? "Flagging…" : "Flag Delay"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
