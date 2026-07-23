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
import { usePricing, usePricingBracketsHydration } from "@/lib/query/hooks/use-pricing";
import { useDomesticPricing } from "@/lib/query/hooks/use-domestic-pricing";
import { domesticRouteMode } from "@/types/pricing";

type PricingTab = "international" | "domestic";
type DomesticSub = "range" | "single";

function PricingTabs() {
  const params = useSearchParams();
  const initialTab: PricingTab = params.get("tab") === "domestic" ? "domestic" : "international";
  const [tab, setTab] = useState<PricingTab>(initialTab);
  const [domSub, setDomSub] = useState<DomesticSub>("range");

  const intl = usePricing();
  const domestic = useDomesticPricing();

  // The flat /admin/pricing endpoint can carry legacy domestic rows; the
  // International tab only shows international ones.
  const internationalRows = useMemo(
    () => (intl.data ?? []).filter((p) => p.shipmentType === "INTERNATIONAL"),
    [intl.data],
  );

  // The list endpoint truncates each row's brackets to one per freight type;
  // hydrate the full set from the detail endpoint so the range dropdown/prices
  // are complete (interim — see docs/pricing-list-brackets-spec.md).
  const { rows: hydratedInternational } = usePricingBracketsHydration(internationalRows);

  const rangeRows = useMemo(
    () => (domestic.data ?? []).filter((r) => domesticRouteMode(r) === "range"),
    [domestic.data],
  );
  const singleRows = useMemo(
    () => (domestic.data ?? []).filter((r) => domesticRouteMode(r) === "single"),
    [domestic.data],
  );

  const addHref =
    tab === "domestic" ? `/pricing/new?type=domestic&mode=${domSub}` : "/pricing/new";

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
            <PricingTable data={hydratedInternational} isLoading={intl.isLoading} />
          </Card>
        </TabsContent>

        <TabsContent value="domestic">
          <Tabs value={domSub} onValueChange={(v) => setDomSub(v as DomesticSub)}>
            <TabsList variant="line">
              <TabsTrigger value="range">Range</TabsTrigger>
              <TabsTrigger value="single">Single</TabsTrigger>
            </TabsList>

            <TabsContent value="range">
              <Card className="p-2">
                <DomesticPricingTable
                  mode="range"
                  data={rangeRows}
                  isLoading={domestic.isLoading}
                />
              </Card>
            </TabsContent>

            <TabsContent value="single">
              <Card className="p-2">
                <DomesticPricingTable
                  mode="single"
                  data={singleRows}
                  isLoading={domestic.isLoading}
                />
              </Card>
            </TabsContent>
          </Tabs>
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
