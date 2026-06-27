import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import { ACTIVE_TENANT_COOKIE } from "@/lib/constants"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

/**
 * Resolves the signed-in user, their tenant memberships, and the currently
 * active tenant (from the `slotly_active_tenant` cookie, falling back to the
 * first membership). Redirects to /login or /onboarding when appropriate.
 *
 * Wrapped in React `cache` so multiple calls within one request hit the DB once.
 */
export const getDashboardContext = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const memberships = await db.membership.findMany({
    where: { userId: session.user.id },
    include: { tenant: true },
    orderBy: { createdAt: "asc" },
  })

  if (memberships.length === 0) redirect("/onboarding")

  const cookieStore = await cookies()
  const activeId = cookieStore.get(ACTIVE_TENANT_COOKIE)?.value
  const active =
    memberships.find((m) => m.tenantId === activeId) ?? memberships[0]

  return {
    user: session.user,
    memberships,
    tenant: active.tenant,
    role: active.role,
  }
})

export type DashboardContext = Awaited<ReturnType<typeof getDashboardContext>>
