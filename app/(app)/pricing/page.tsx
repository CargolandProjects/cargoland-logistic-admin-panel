"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PricingTable } from "@/components/features/pricing/pricing-table";
import { DomesticPricingTable } from "@/components/features/pricing/domestic-pricing-table";
import { usePricing } from "@/lib/query/hooks/use-pricing";
import { useDomesticPricing } from "@/lib/query/hooks/use-domestic-pricing";

type PricingTab = "international" | "domestic";

function PricingTabs() {
  const params = useSearchParams();
  const initialTab: PricingTab = params.get("tab") === "domestic" ? "domestic" : "international";
  const [tab, setTab] = useState<PricingTab>(initialTab);

  const intl = usePricing();
  const domestic = useDomesticPricing();

  // The flat /admin/pricing endpoint can carry legacy domestic rows; the
  // International tab only shows international ones.
  const internationalRows = useMemo(
    () => (intl.data ?? []).filter((p) => p.shipmentType === "INTERNATIONAL"),
    [intl.data],
  );

  const addHref = tab === "domestic" ? "/pricing/new?type=domestic" : "/pricing/new";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing Management"
        subtitle="Manage live pricing rules. Changes reflect instantly on the user platform."
        actions={
          <Button
            className="bg-brand-red text-white"
            nativeButton={false}
            render={<Link href={addHref} />}
          >
            <Plus className="size-4" /> Add Pricing
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as PricingTab)}>
        <TabsList>
          <TabsTrigger value="international">International</TabsTrigger>
          <TabsTrigger value="domestic">Domestic</TabsTrigger>
        </TabsList>

        <TabsContent value="international">
          <Card className="p-2">
            <PricingTable data={internationalRows} isLoading={intl.isLoading} />
          </Card>
        </TabsContent>

        <TabsContent value="domestic">
          <Card className="p-2">
            <DomesticPricingTable data={domestic.data ?? []} isLoading={domestic.isLoading} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="h-40" />}>
      <PricingTabs />
    </Suspense>
  );
}
