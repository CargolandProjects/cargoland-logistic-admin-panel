"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { useVehicle } from "@/lib/query/hooks/use-vehicles";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleForm } from "@/components/features/vehicles/vehicle-form";

export function EditVehicleView({ id }: { id: string }) {
  const { data, isLoading } = useVehicle(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fleet"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ChevronLeft className="size-4" /> Fleet
        </Link>
        <span className="text-sm font-medium text-muted-foreground">Edit Vehicle</span>
      </div>
      <h1 className="text-xl font-semibold text-foreground">
        Edit Vehicle{data?.vehicleTrackingId ? ` — ${data.vehicleTrackingId}` : ""}
      </h1>
      {isLoading || !data ? <Skeleton className="h-96" /> : <VehicleForm initial={data} />}
    </div>
  );
}
