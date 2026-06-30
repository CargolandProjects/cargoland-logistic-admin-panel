/**
 * Centralized React Query key factory.
 * Adding a domain = add a block here; existing keys are untouched.
 */
export const qk = {
  auth: {
    all: ["auth"] as const,
    profile: () => [...qk.auth.all, "profile"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    summary: () => [...qk.dashboard.all, "summary"] as const,
  },
  shipments: {
    all: ["shipments"] as const,
    list: (filters?: unknown) => [...qk.shipments.all, "list", filters ?? {}] as const,
    detail: (id: string) => [...qk.shipments.all, "detail", id] as const,
  },
  pricing: {
    all: ["pricing"] as const,
    list: (filters?: unknown) => [...qk.pricing.all, "list", filters ?? {}] as const,
    detail: (id: string) => [...qk.pricing.all, "detail", id] as const,
  },
  payments: {
    all: ["payments"] as const,
    list: (filters?: unknown) => [...qk.payments.all, "list", filters ?? {}] as const,
    summary: () => [...qk.payments.all, "summary"] as const,
  },
  vehicles: {
    all: ["vehicles"] as const,
    list: (filters?: unknown) => [...qk.vehicles.all, "list", filters ?? {}] as const,
    detail: (id: string) => [...qk.vehicles.all, "detail", id] as const,
    tracking: (trackingId: string) => [...qk.vehicles.all, "tracking", trackingId] as const,
  },
  drivers: {
    all: ["drivers"] as const,
    list: (filters?: unknown) => [...qk.drivers.all, "list", filters ?? {}] as const,
    detail: (id: string) => [...qk.drivers.all, "detail", id] as const,
  },
  admins: {
    all: ["admins"] as const,
    list: (filters?: unknown) => [...qk.admins.all, "list", filters ?? {}] as const,
    logs: (filters?: unknown) => [...qk.admins.all, "logs", filters ?? {}] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: () => [...qk.customers.all, "list"] as const,
    detail: (key: string) => [...qk.customers.all, "detail", key] as const,
  },
} as const;
