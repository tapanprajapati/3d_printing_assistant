import {
  LayoutDashboard,
  Layers,
  Package,
  Printer,
  Calculator,
  BarChart2,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Filaments",
    href: "/filaments",
    icon: Layers,
  },
  {
    label: "Products",
    href: "/products",
    icon: Package,
  },
  {
    label: "Print Queue",
    href: "/print-queue",
    icon: Printer,
  },
  {
    label: "Calculator",
    href: "/calculator",
    icon: Calculator,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart2,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
