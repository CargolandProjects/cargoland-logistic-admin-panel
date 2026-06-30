import { ShipmentDetailsView } from "@/components/features/shipments/shipment-details-view";

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ShipmentDetailsView id={id} />;
}
