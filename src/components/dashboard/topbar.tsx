"use client"

import { Building2, Check, ChevronsUpDown, LogOut } from "lucide-react"
import { useTransition } from "react"

import { MobileNav } from "@/components/dashboard/mobile-nav"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Role } from "@/generated/prisma/client"
import { signOutAction } from "@/server/actions/auth"
import { setActiveTenant } from "@/server/actions/tenant"

type TenantOption = { id: string; name: string }

export function DashboardTopbar({
  user,
  role,
  tenantId,
  tenantName,
  tenants,
}: {
  user: { name?: string | null; email?: string | null }
  role: Role
  tenantId: string
  tenantName: string
  tenants: TenantOption[]
}) {
  const [isPending, startTransition] = useTransition()

  const initials = (user.name ?? user.email ?? "U")
    .trim()
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/60 px-4 backdrop-blur">
      <div className="flex items-center gap-1">
        <MobileNav role={role} />

        {/* Tenant switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-white/5">
            <Building2 className="size-4 text-emerald-400" />
            <span className="max-w-[180px] truncate font-medium">
              {tenantName}
            </span>
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Businesses</DropdownMenuLabel>
              {tenants.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  disabled={isPending}
                  onClick={() =>
                    startTransition(() => {
                      if (t.id !== tenantId) void setActiveTenant(t.id)
                    })
                  }
                >
                  <span className="truncate">{t.name}</span>
                  {t.id === tenantId && (
                    <Check className="ml-auto size-4 text-emerald-400" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full outline-none">
          <Avatar className="size-8">
            <AvatarFallback className="bg-emerald-500/15 text-xs text-emerald-300">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex flex-col">
              <span className="truncate font-medium text-foreground">
                {user.name ?? "Account"}
              </span>
              {user.email && (
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {user.email}
                </span>
              )}
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={isPending}
            onClick={() => startTransition(() => void signOutAction())}
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
