import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ShipmentStatus } from "@/types/shipment";

export type StatusTab = "all" | ShipmentStatus;

interface ShipmentFilterState {
  search: string;
  type: string;
  status: string;
  transport: string;
  tab: StatusTab;
  setSearch: (v: string) => void;
  setType: (v: string) => void;
  setStatus: (v: string) => void;
  setTransport: (v: string) => void;
  setTab: (v: StatusTab) => void;
  reset: () => void;
}

const initial = {
  search: "",
  type: "all",
  status: "all",
  transport: "all",
  tab: "all" as StatusTab,
};

export const useShipmentFilterStore = create<ShipmentFilterState>()(
  persist(
    (set) => ({
      ...initial,
      setSearch: (search) => set({ search }),
      setType: (type) => set({ type }),
      setStatus: (status) => set({ status }),
      setTransport: (transport) => set({ transport }),
      setTab: (tab) => set({ tab }),
      reset: () => set(initial),
    }),
    // v2: status enum values changed (PENDING/IN_TRANSIT/... ) — new key drops stale persisted tabs.
    { name: "cargoland.shipment-filters.v2" },
  ),
);
