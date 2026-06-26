import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { PricingForm } from "@/components/features/pricing/pricing-form";

export default function NewPricingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ChevronLeft className="size-4" /> Back
        </Link>
        <span className="text-sm font-medium text-muted-foreground">Add New Pricing</span>
      </div>
      <PricingForm />
    </div>
  );
}
