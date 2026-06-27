import { DriverProfileView } from "@/components/features/drivers/driver-profile-view";

export default async function DriverProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DriverProfileView id={id} />;
}
