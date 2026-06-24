import { useQuery } from "@tanstack/react-query";

import { qk } from "@/lib/query/keys";
import { getProfile } from "@/lib/api/services/auth";

/** Signed-in admin profile (GET /admin/profile). */
export function useProfile() {
  return useQuery({
    queryKey: qk.auth.profile(),
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000,
  });
}
