import { api } from "@/lib/api/client";
import { tokenStore } from "@/lib/api/token-store";
import { MOCKS, mockDelay } from "@/lib/api/mock/config";
import type { Admin, AuthUser, LoginCredentials, LoginResponseData } from "@/types/auth";

const MOCK_ADMIN: Admin = {
  id: "u_1",
  email: "sharon@cargoland.com",
  firstName: "Sharon",
  lastName: "Adeyemi",
  role: "SUPER_ADMIN",
};

/** Backend Admin -> UI AuthUser. */
function toAuthUser(admin: Admin): AuthUser {
  return {
    id: admin.id,
    name: `${admin.firstName} ${admin.lastName}`.trim(),
    email: admin.email,
    role: admin.role,
  };
}

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  if (MOCKS.auth) {
    await mockDelay(null);
    tokenStore.set("mock-token");
    return toAuthUser(MOCK_ADMIN);
  }

  // POST /admin/login -> { status, message, data: { accessToken, admin } }
  const data = await api.post<LoginResponseData>("/admin/login", credentials);
  tokenStore.set(data.accessToken);
  return toAuthUser(data.admin);
}

export async function getProfile(): Promise<AuthUser> {
  if (MOCKS.auth) return toAuthUser(await mockDelay(MOCK_ADMIN));
  // GET /admin/profile -> { status, message, data: <admin> }
  const admin = await api.get<Admin>("/admin/profile");
  return toAuthUser(admin);
}

export async function logout(): Promise<void> {
  // No logout endpoint documented; clear the local token.
  tokenStore.clear();
}
