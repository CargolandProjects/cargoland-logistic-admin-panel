"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { usePricingDetail } from "@/lib/query/hooks/use-pricing";
import { Skeleton } from "@/components/ui/skeleton";
import { PricingForm } from "@/components/features/pricing/pricing-form";

export function PricingDetailView({ id }: { id: string }) {
  const { data, isLoading } = usePricingDetail(id);

  return (
    <div className="space-y-6">
      <Link
        href="/pricing"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ChevronLeft className="size-4" /> Back to Pricing
      </Link>

      <h1 className="text-xl font-semibold text-foreground">Edit Pricing</h1>

      {isLoading || !data ? (
        <Skeleton className="h-80" />
      ) : (
        <PricingForm initial={data} />
      )}
    </div>
  );
}
