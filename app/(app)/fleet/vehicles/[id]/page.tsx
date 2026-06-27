import { VehicleStatusView } from "@/components/features/vehicles/vehicle-status-view";

export default async function VehicleStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VehicleStatusView id={id} />;
}
