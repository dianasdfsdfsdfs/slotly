"use client"

import { Menu } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import {
  isNavItemActive,
  visibleNavItems,
} from "@/components/dashboard/nav-items"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Role } from "@/generated/prisma/client"
import { cn } from "@/lib/utils"

export function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname()
  const router = useRouter()
  const items = visibleNavItems(role)

  return (
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex size-9 items-center justify-center rounded-md outline-none hover:bg-white/5">
          <Menu className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          {items.map((item) => {
            const Icon = item.icon
            const active = isNavItemActive(item.href, pathname)
            return (
              <DropdownMenuItem
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(active && "text-emerald-300")}
              >
                <Icon className="size-4" />
                {item.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
