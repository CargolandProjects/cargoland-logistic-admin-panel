import { EditDriverView } from "@/components/features/drivers/edit-driver-view";

export default async function EditDriverPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditDriverView id={id} />;
}
