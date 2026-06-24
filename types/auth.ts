export type Role = "SUPER_ADMIN" | "OPERATIONS_ADMIN" | "SUPPORT_ADMIN";

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  OPERATIONS_ADMIN: "Operations Admin",
  SUPPORT_ADMIN: "Support Admin",
};

export const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as Role[]).map((value) => ({
  value,
  label: ROLE_LABELS[value],
}));

export type AdminStatus = "ACTIVE" | "DEACTIVATED";

export type AdminLogAction =
  | "CREATED_ADMIN"
  | "SETUP_PASSWORD"
  | "LOGIN"
  | "LOGOUT"
  | "UPDATED_PROFILE"
  | "CHANGED_PASSWORD"
  | "RESENT_INVITATION"
  | "VERIFIED_EMAIL"
  | "DEACTIVATED_ADMIN"
  | "ACTIVATED_ADMIN"
  | "CREATED_PRICING"
  | "UPDATED_PRICING"
  | "DELETED_PRICING"
  | "CREATED_DRIVER"
  | "UPDATED_DRIVER"
  | "DELETED_DRIVER"
  | "CREATED_VEHICLE"
  | "UPDATED_VEHICLE"
  | "DELETED_VEHICLE";

/** Admin row in the Users list (GET /admin/all). */
export interface AdminListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  status?: AdminStatus;
  createdAt?: string;
}

/** POST /admin/create body (CreateAdminDto). */
export interface CreateAdminInput {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

/** PATCH /admin/status body (UpdateAdminStatusDto). */
export interface UpdateAdminStatusInput {
  adminId: string;
  status: AdminStatus;
}

/** Activity log row (GET /admin/logs). */
export interface AdminLog {
  id: string;
  action: string;
  adminName?: string;
  meta?: string;
  createdAt?: string;
}

/** Admin object as returned by the backend (login / profile). */
export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

/** View model used across the UI. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/** Shape of `data` from POST /admin/login. */
export interface LoginResponseData {
  accessToken: string;
  admin: Admin;
}
