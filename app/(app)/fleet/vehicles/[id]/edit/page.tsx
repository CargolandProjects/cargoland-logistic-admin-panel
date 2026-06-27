import { EditVehicleView } from "@/components/features/vehicles/edit-vehicle-view";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditVehicleView id={id} />;
}
