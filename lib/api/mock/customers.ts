import type { Customer } from "@/types/customer";

/** Demo directory (used only when MOCKS.customers is true). */
export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "emeka.obi@email.com",
    name: "Emeka Obi",
    email: "emeka.obi@email.com",
    phone: "+234 812 345 6789",
    country: "Nigeria",
    bookings: 14,
    totalSpent: 4200000,
    delivered: 11,
    customerSince: "2024-01-12T00:00:00.000Z",
    lastActive: "2024-04-18T00:00:00.000Z",
  },
  {
    id: "amara.eze@email.com",
    name: "Amara Eze",
    email: "amara.eze@email.com",
    phone: "+234 803 111 2222",
    country: "Nigeria",
    bookings: 6,
    totalSpent: 980000,
    delivered: 5,
    customerSince: "2024-02-03T00:00:00.000Z",
    lastActive: "2024-04-10T00:00:00.000Z",
  },
];
