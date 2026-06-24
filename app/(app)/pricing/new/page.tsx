import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { PricingForm } from "@/components/features/pricing/pricing-form";

export default function NewPricingPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/pricing"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ChevronLeft className="size-4" /> Back to Pricing
      </Link>
      <h1 className="text-xl font-semibold text-foreground">Add Pricing</h1>
      <PricingForm />
    </div>
  );
}
