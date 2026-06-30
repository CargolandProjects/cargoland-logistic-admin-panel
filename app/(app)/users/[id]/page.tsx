import { UserProfileView } from "@/components/features/users/user-profile-view";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserProfileView customerKey={decodeURIComponent(id)} />;
}
