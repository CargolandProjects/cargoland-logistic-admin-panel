/**
 * Backend API contract — Cargoland (dev.cargoland.africa).
 *
 * Confirmed envelope (from live probes):
 *   object: { status, message?, data: T }
 *   list:   { status, data: T[], meta: { total, page, limit } }
 * Errors: { status, message } (axios also exposes the HTTP status code).
 */

/** Standard envelope for a single resource. */
export interface Envelope<T> {
  status: string;
  message?: string;
  data: T;
}

/** Pagination metadata for list endpoints. */
export interface PageMeta {
  total: number;
  page: number;
  limit: number;
}

/** Standard envelope for a paginated list. */
export interface Paginated<T> {
  status: string;
  data: T[];
  meta: PageMeta;
}

/** Normalized error body the UI can rely on. */
export interface ApiErrorBody {
  statusCode: number;
  message: string;
  /** Field-level validation errors, when present. */
  errors?: Array<{ field: string; message: string }>;
  timestamp?: string;
  path?: string;
}
