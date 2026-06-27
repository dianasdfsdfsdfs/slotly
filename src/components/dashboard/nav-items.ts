import {
  CalendarDays,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Scissors,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react"

import type { Role } from "@/generated/prisma/client"

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  ownerOnly?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/bookings", label: "Bookings", icon: ClipboardList },
  {
    href: "/dashboard/services",
    label: "Services",
    icon: Scissors,
    ownerOnly: true,
  },
  { href: "/dashboard/staff", label: "Staff", icon: Users, ownerOnly: true },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    ownerOnly: true,
  },
  {
    href: "/dashboard/billing",
    label: "Billing",
    icon: CreditCard,
    ownerOnly: true,
  },
]

export function visibleNavItems(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.ownerOnly || role === "OWNER")
}

export function isNavItemActive(href: string, pathname: string): boolean {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href)
}
