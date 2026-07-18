import { PricingDetailView } from "@/components/features/pricing/pricing-detail-view";
import { DomesticPricingDetailView } from "@/components/features/pricing/domestic-pricing-detail-view";

export default async function PricingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { id } = await params;
  const { type } = await searchParams;
  return type === "domestic" ? (
    <DomesticPricingDetailView id={id} />
  ) : (
    <PricingDetailView id={id} />
  );
}
