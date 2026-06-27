import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { DriverForm } from "@/components/features/drivers/driver-form";

export default function NewDriverPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fleet"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ChevronLeft className="size-4" /> Fleet
        </Link>
        <span className="text-sm font-medium text-muted-foreground">Add New Driver</span>
      </div>
      <h1 className="text-xl font-semibold text-foreground">Add New Driver</h1>
      <DriverForm />
    </div>
  );
}
