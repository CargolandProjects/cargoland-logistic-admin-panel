/**
 * Per-domain mock toggle.
 *
 * Domains with a live backend endpoint call the real API; domains without one
 * (or partial ones) stay on typed mock data, surfaced in the UI as "demo".
 * Flip a flag to `false` once its endpoint exists — no UI/hook changes needed.
 */
export const MOCKS = {
  auth: false, // POST /admin/login, GET /admin/profile
  dashboardStats: false, // GET /admin/dashboard/stats (4 metrics)
  activity: false, // GET /admin/dashboard/activity-feed
  payments: false, // GET /admin/payments(/stats)
  shipments: false, // GET /admin/shipments, /{id}/live, actions
  pricing: false, // GET/POST/PUT/DELETE /admin/pricing
  customers: false, // derived from GET /admin/shipments (no customer-list endpoint)
} as const;

/** Simulate network latency so loading states are exercised (mock paths only). */
export function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
