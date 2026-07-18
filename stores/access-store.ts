import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Role } from "@/types/auth";
import { DEFAULT_MATRIX, type PageKey, type PermissionMatrix } from "@/types/permissions";

interface AccessState {
  /** Role → page access. Persisted; edited in Manage Access. */
  matrix: PermissionMatrix;
  /** Session-only role override for testing the gate (never persisted). */
  previewRole: Role | null;
  /** True once localStorage has rehydrated — gates every deny decision. */
  hydrated: boolean;
  setPermission: (role: Role, page: PageKey, allowed: boolean) => void;
  resetMatrix: () => void;
  setPreviewRole: (role: Role) => void;
  clearPreviewRole: () => void;
}

/**
 * RBAC state. Client-side for now (no backend permissions API yet — see
 * docs/permissions-api-spec.md). Only `matrix` is persisted; `previewRole` is
 * session-only so a reload always returns to the real role.
 */
export const useAccessStore = create<AccessState>()(
  persist(
    (set) => ({
      matrix: DEFAULT_MATRIX,
      previewRole: null,
      hydrated: false,
      setPermission: (role, page, allowed) =>
        set((s) => {
          if (role === "SUPER_ADMIN") return s; // Super Admin is immutable (no lockout)
          return {
            matrix: {
              ...s.matrix,
              [role]: { ...s.matrix[role], [page]: allowed },
            },
          };
        }),
      resetMatrix: () => set({ matrix: DEFAULT_MATRIX }),
      setPreviewRole: (role) => set({ previewRole: role }),
      clearPreviewRole: () => set({ previewRole: null }),
    }),
    {
      name: "cargoland.access",
      partialize: (s) => ({ matrix: s.matrix }),
      onRehydrateStorage: () => () => useAccessStore.setState({ hydrated: true }),
    },
  ),
);
