import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { VehicleForm } from "@/components/features/vehicles/vehicle-form";

export default function NewVehiclePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fleet"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ChevronLeft className="size-4" /> Fleet
        </Link>
        <span className="text-sm font-medium text-muted-foreground">Add New Vehicle</span>
      </div>
      <h1 className="text-xl font-semibold text-foreground">Add New Vehicle</h1>
      <VehicleForm />
    </div>
  );
}
