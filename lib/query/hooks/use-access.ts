"use client";

import { useProfile } from "@/lib/query/hooks/use-profile";
import { useAccessStore } from "@/stores/access-store";
import { NAV_GROUPS, type NavGroup } from "@/lib/nav";
import { pageKeyForPath, type PageKey } from "@/types/permissions";
import type { Role } from "@/types/auth";

/**
 * Central access hook — resolves the effective role (real, or a preview override)
 * and answers `can(page)` + the permitted nav. Fails OPEN while the profile/store
 * are still loading so nothing flashes a denial or locks the user out.
 */
export function useAccess() {
  const { data: profile, isLoading } = useProfile();
  const matrix = useAccessStore((s) => s.matrix);
  const previewRole = useAccessStore((s) => s.previewRole);
  const hydrated = useAccessStore((s) => s.hydrated);

  const ready = hydrated && !isLoading && !!profile;
  const effectiveRole: Role | null = previewRole ?? profile?.role ?? null;
  const isPreview = Boolean(previewRole);

  const can = (page: PageKey | null): boolean => {
    if (!ready || page === null) return true; // permissive while loading / unknown route
    if (page === "dashboard") return true; // always reachable — no lockout
    if (!effectiveRole) return true;
    if (effectiveRole === "SUPER_ADMIN") return true;
    return Boolean(matrix[effectiveRole]?.[page]);
  };

  const allowedNav: NavGroup[] = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => can(pageKeyForPath(item.href))),
  })).filter((group) => group.items.length > 0);

  return { ready, effectiveRole, isPreview, can, allowedNav };
}
