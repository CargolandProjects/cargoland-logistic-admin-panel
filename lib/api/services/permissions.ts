import { DEFAULT_MATRIX, type PageKey, type PermissionMatrix } from "@/types/permissions";
import type { Role } from "@/types/auth";

/**
 * Permissions backend seam. There is no permissions API yet — the client store
 * (`stores/access-store.ts`) is authoritative for now. When the backend ships the
 * endpoints in `docs/permissions-api-spec.md`, wire these to it and add a React
 * Query hook; the store then keeps only `previewRole`.
 */

// TODO(backend): GET /admin/permissions -> full matrix
export async function getPermissions(): Promise<PermissionMatrix> {
  return DEFAULT_MATRIX;
}

// TODO(backend): PATCH /admin/permissions (Super Admin only) -> updated matrix
export async function updateRolePermissions(
  role: Role,
  pages: Partial<Record<PageKey, boolean>>,
): Promise<PermissionMatrix> {
  void role;
  void pages;
  throw new Error("Permissions API not implemented yet (see docs/permissions-api-spec.md)");
}
