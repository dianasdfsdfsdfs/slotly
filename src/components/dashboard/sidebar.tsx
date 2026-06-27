"use client"

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
import Link from "next/link"
import { usePathname } from "next/navigation"

import type { Role } from "@/generated/prisma/client"
import { siteConfig } from "@/lib/constants"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  ownerOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
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

export function DashboardSidebar({ role }: { role: Role }) {
  const pathname = usePathname()
  const items = NAV_ITEMS.filter((item) => !item.ownerOnly || role === "OWNER")

  return (
    <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
      <Link
        href="/dashboard"
        className="flex h-14 items-center gap-2 px-5 font-mono text-sm font-semibold tracking-widest text-emerald-300 uppercase"
      >
        <span className="size-2 rounded-full bg-emerald-400" />
        {siteConfig.name}
      </Link>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
