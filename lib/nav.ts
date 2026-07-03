import {
  LayoutGrid,
  Truck,
  Warehouse,
  Wallet,
  Tag,
  Users,
  ShieldCheck,
  Bell,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  /** Section heading (e.g. MAIN, FINANCE). */
  title: string;
  items: NavItem[];
}

/**
 * Single source of truth for the sidebar.
 * Adding a page = add an item here + create its route folder. Nothing else
 * needs to change for the new page to appear in the nav.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
      { label: "Shipments", href: "/shipments", icon: Truck },
      { label: "Fleet", href: "/fleet", icon: Warehouse },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Payments", href: "/payments", icon: Wallet },
      { label: "Pricing", href: "/pricing", icon: Tag },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Users", href: "/users", icon: Users },
      { label: "Admins", href: "/admins", icon: ShieldCheck },
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
];
