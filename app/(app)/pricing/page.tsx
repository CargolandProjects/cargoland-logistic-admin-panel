"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PricingTable } from "@/components/features/pricing/pricing-table";
import { usePricing } from "@/lib/query/hooks/use-pricing";

export default function PricingPage() {
  const { data, isLoading } = usePricing();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing Management"
        subtitle="Manage live pricing rules. Changes reflect instantly on the user platform."
        actions={
          <Button
            className="bg-brand-red text-white"
            nativeButton={false}
            render={<Link href="/pricing/new" />}
          >
            <Plus className="size-4" /> Add Pricing
          </Button>
        }
      />
      <Card className="p-2">
        <PricingTable data={data ?? []} isLoading={isLoading} />
      </Card>
    </div>
  );
}
