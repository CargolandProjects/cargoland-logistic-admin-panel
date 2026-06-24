import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

import { env } from "@/lib/env";
import { tokenStore } from "@/lib/api/token-store";
import type { ApiErrorBody, Envelope, Paginated } from "@/types/api";

/**
 * Central axios instance for the Cargoland backend.
 *
 * Response-envelope unwrapping lives ONLY in the `api`/`apiList` helpers below,
 * so if the backend shape differs we change it in one place. Auth lives behind
 * `tokenStore` + `handleAuthFailure`, structured so refresh-token replay can be
 * dropped in later without touching call sites.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

// --- Request: attach bearer token when present -----------------------------
apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response: handle 401 --------------------------------------------------

function isAuthEndpoint(url?: string): boolean {
  // A 401 from the login endpoint is a bad-credentials error, not an expired
  // session — don't trigger the logout/redirect handler for it.
  return Boolean(url && (url.includes("/auth/") || url.includes("/admin/login")));
}

function handleAuthFailure(): void {
  tokenStore.clear();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.assign(`/login?next=${next}`);
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401 && !isAuthEndpoint(url)) {
      // TODO: when refresh tokens exist, await a single-flight refresh here and
      // replay the original request before falling through to a hard logout.
      handleAuthFailure();
    }

    return Promise.reject(error);
  },
);

// --- Unwrap helpers --------------------------------------------------------
// `data` here is the parsed JSON body; we assume a `{ data }` envelope.

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<Envelope<T>>(url, config).then((r) => r.data.data),

  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<Envelope<T>>(url, body, config).then((r) => r.data.data),

  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<Envelope<T>>(url, body, config).then((r) => r.data.data),

  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<Envelope<T>>(url, body, config).then((r) => r.data.data),

  delete: <T = void>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<Envelope<T>>(url, config).then((r) => r.data?.data),
};

/** List endpoints keep both `data` and pagination `meta`. */
export const apiList = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<Paginated<T>>(url, config).then((r) => r.data),
};

/** Multipart uploads — never set Content-Type manually (axios sets the boundary). */
export const apiUpload = {
  post: <T>(url: string, body: FormData, config?: AxiosRequestConfig) =>
    apiClient
      .post<Envelope<T>>(url, body, {
        ...config,
        headers: { ...config?.headers, "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data.data),

  patch: <T>(url: string, body: FormData, config?: AxiosRequestConfig) =>
    apiClient
      .patch<Envelope<T>>(url, body, {
        ...config,
        headers: { ...config?.headers, "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data.data),
};

/** Normalize any thrown error into a predictable `ApiErrorBody`. */
export function readApiError(err: unknown): ApiErrorBody | null {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as
      | (Partial<ApiErrorBody> & { message?: string | string[] })
      | undefined;
    // NestJS validation can return `message` as an array of strings.
    const rawMessage = body?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : (rawMessage ?? err.message ?? "Request failed");
    return {
      statusCode: err.response?.status ?? 0,
      message,
      errors: body?.errors,
      timestamp: body?.timestamp,
      path: body?.path,
    };
  }
  return null;
}
