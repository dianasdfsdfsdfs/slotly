"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  isNavItemActive,
  visibleNavItems,
} from "@/components/dashboard/nav-items"
import type { Role } from "@/generated/prisma/client"
import { siteConfig } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function DashboardSidebar({ role }: { role: Role }) {
  const pathname = usePathname()
  const items = visibleNavItems(role)

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
          const active = isNavItemActive(item.href, pathname)
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
