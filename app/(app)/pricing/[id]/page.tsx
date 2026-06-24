import { PricingDetailView } from "@/components/features/pricing/pricing-detail-view";

export default async function PricingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PricingDetailView id={id} />;
}
