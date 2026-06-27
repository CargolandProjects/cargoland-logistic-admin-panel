"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { useDriver } from "@/lib/query/hooks/use-drivers";
import { Skeleton } from "@/components/ui/skeleton";
import { DriverForm } from "@/components/features/drivers/driver-form";

export function EditDriverView({ id }: { id: string }) {
  const { data, isLoading } = useDriver(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fleet"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ChevronLeft className="size-4" /> Fleet
        </Link>
        <span className="text-sm font-medium text-muted-foreground">Edit Driver</span>
      </div>
      <h1 className="text-xl font-semibold text-foreground">
        Edit Driver{data ? ` — ${data.firstName} ${data.lastname}`.trimEnd() : ""}
      </h1>
      {isLoading || !data ? <Skeleton className="h-96" /> : <DriverForm initial={data} />}
    </div>
  );
}
