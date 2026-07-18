"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { useDomesticPricingRow } from "@/lib/query/hooks/use-domestic-pricing";
import { Skeleton } from "@/components/ui/skeleton";
import { DomesticPricingForm } from "@/components/features/pricing/domestic-pricing-form";

export function DomesticPricingDetailView({ id }: { id: string }) {
  // No GET-by-id for local pricing — the row is resolved from the list query.
  const { row, isLoading } = useDomesticPricingRow(id);

  return (
    <div className="space-y-6">
      <Link
        href="/pricing?tab=domestic"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ChevronLeft className="size-4" /> Back to Pricing
      </Link>

      <h1 className="text-xl font-semibold text-foreground">Edit Domestic Pricing</h1>

      {isLoading ? (
        <Skeleton className="h-80" />
      ) : row ? (
        <DomesticPricingForm initial={row} />
      ) : (
        <p className="text-sm text-muted-foreground">
          This pricing rule could not be found. It may have been deleted.
        </p>
      )}
    </div>
  );
}
