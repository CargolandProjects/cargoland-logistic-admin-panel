import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { PricingForm } from "@/components/features/pricing/pricing-form";
import { DomesticPricingForm } from "@/components/features/pricing/domestic-pricing-form";

export default async function NewPricingPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; mode?: string }>;
}) {
  const { type, mode } = await searchParams;
  const isDomestic = type === "domestic";
  const domesticMode = mode === "single" ? "single" : "range";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={isDomestic ? "/pricing?tab=domestic" : "/pricing"}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ChevronLeft className="size-4" /> Back
        </Link>
        <span className="text-sm font-medium text-muted-foreground">Add New Pricing</span>
      </div>
      {isDomestic ? <DomesticPricingForm mode={domesticMode} /> : <PricingForm />}
    </div>
  );
}
