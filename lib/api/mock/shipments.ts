import type { Shipment, ShipmentDetail, ShipmentRecord } from "@/types/shipment";

export const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: "BK-0091",
    trackingId: "#BK-0091",
    vehicleId: "VH-0007",
    type: "Local",
    customer: "Emeka Obi",
    route: { from: "Lagos", to: "London" },
    lastUpdated: "Apr 18, 10:54",
    status: "PENDING",
  },
  {
    id: "BK-0090",
    trackingId: "#BK-0090",
    vehicleId: "DHL-4422",
    type: "International",
    customer: "Fatima Yusuf",
    route: { from: "Abuja", to: "Port-Harcourt" },
    lastUpdated: "Apr 18, 09:31",
    status: "ASSIGNED",
  },
  {
    id: "BK-0089",
    trackingId: "#BK-0089",
    vehicleId: "FDX-9901",
    type: "International",
    customer: "Chidi Nwosu",
    route: { from: "Lagos", to: "Dubai" },
    lastUpdated: "Apr 17, 16:55",
    status: "IN_TRANSIT",
  },
  {
    id: "BK-0088",
    trackingId: "#BK-0088",
    vehicleId: "VH-0012",
    type: "Local",
    customer: "Amara Eze",
    route: { from: "Lagos", to: "Victoria Island" },
    lastUpdated: "Apr 17, 16:55",
    status: "DELIVERED",
  },
];

export function mockShipmentRecord(id: string): ShipmentRecord {
  const base = MOCK_SHIPMENTS.find((s) => s.id === id) ?? MOCK_SHIPMENTS[0];
  return {
    id: base.id,
    trackingId: base.trackingId,
    idNumber: "CLD-12345678",
    freightType: "Air Freight",
    shipmentType: base.type,
    invoiceDate: "2026-03-12T00:00:00.000Z",
    price: "45000",
    totalWeight: "15",
    description: "Documents and personal effects",
    summaryFrom: "Nigeria",
    summaryTo: "Ghana",
    sender: {
      name: "Ajose Joshua",
      phone: "+234 812 234 2232",
      address: "24b Royal Estate, Ikeja",
      city: "Lagos state",
      country: "Nigeria",
    },
    receiver: {
      name: "Ajose Joshua",
      phone: "+234 812 234 2232",
      address: "24b Royal Estate, Ikeja",
      city: "Lagos state",
      country: "Ghana",
    },
    images: [],
  };
}

export function mockShipmentDetail(id: string): ShipmentDetail {
  const base =
    MOCK_SHIPMENTS.find((s) => s.id === id) ?? MOCK_SHIPMENTS[0];

  return {
    ...base,
    bookingRef: "#BK-0093",
    fleet: "Cargoland Fleet",
    driver: { name: "Adekoya Femi", id: "DRV-0012", status: "Active" },
    vehicle: { model: "Toyota Hiace", plate: "LND-441CG" },
    progress: 68,
    vehicleStatus: {
      headline: "Vehicle operating normally",
      subtext: "All systems normal · Last ping 1 min ago",
      location: "3rd Mainland Bridge, Lagos, Nigeria",
      speed: "47 km/h",
    },
    journey: [
      {
        title: "Booking Confirmed",
        description: "Payment received · Route assigned",
        timestamp: "Apr 18 · 09:10",
        state: "done",
      },
      {
        title: "Driver Assigned",
        description: "Adekoya Femi · VH-0007 dispatched",
        timestamp: "Apr 18 · 10:02",
        state: "done",
      },
      {
        title: "Package Picked Up",
        description: "Collected from sender at Lekki Phase 1",
        timestamp: "Apr 18 · 10:55",
        state: "done",
      },
      {
        title: "In Transit",
        description: "On route via Third Mainland Bridge",
        timestamp: "Apr 18 · 11:02 · Active now",
        state: "active",
      },
      {
        title: "Arriving Soon",
        description: "Approaching Surulere area",
        timestamp: "Est. ~30 mins",
        state: "upcoming",
      },
      {
        title: "Delivered",
        description: "Signature confirmation required",
        timestamp: "Est. 12:30 – 13:00",
        state: "upcoming",
      },
    ],
    telemetry: [
      { label: "Last GPS ping", value: "11:29 AM · 1 min ago" },
      { label: "GPS Coordinates", value: "6.4541°N · 3.3947°E" },
      { label: "Packages onboard", value: "4 packages" },
      { label: "Package #SH-0044", value: "Confirmed onboard" },
      { label: "Fuel level", value: "74% · ~180km range" },
      { label: "Engine status", value: "Running · Normal" },
    ],
    packageDetails: {
      weight: "8 kg",
      content: "Documents",
      service: "Standard",
      fragile: "No",
      images: [],
    },
    recipient: {
      name: "Bolaji Tunde",
      address: "22 Adeleke St, Surulere, Lagos",
      phone: "+234 803 442 1234",
    },
    eventLog: [
      { id: "e1", title: "VH-0007 entered Third Mainland Bridge", meta: "3:30 · Auto-synced · Fleet GPS", tone: "red" },
      { id: "e2", title: "Package loaded — driver confirmed", meta: "3:00 · Driver app confirmation", tone: "blue" },
      { id: "e3", title: "VH-0007 dispatched from Lekki depot", meta: "1:30 · Auto-synced · Fleet GPS", tone: "blue" },
      { id: "e4", title: "Driver Adekoya Femi assigned", meta: "1:30 · Admin assignment", tone: "green" },
    ],
  };
}
