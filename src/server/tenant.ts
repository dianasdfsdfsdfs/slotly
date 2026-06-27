import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import { ACTIVE_TENANT_COOKIE } from "@/lib/constants"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

async function loadMemberships(userId: string) {
  return db.membership.findMany({
    where: { userId },
    include: { tenant: true },
    orderBy: { createdAt: "asc" },
  })
}

async function pickActive<T extends { tenantId: string }>(
  memberships: T[]
): Promise<T> {
  const cookieStore = await cookies()
  const activeId = cookieStore.get(ACTIVE_TENANT_COOKIE)?.value
  return memberships.find((m) => m.tenantId === activeId) ?? memberships[0]
}

/**
 * Signed-in user + memberships + active tenant. Redirects to /login or
 * /onboarding when appropriate. Cached per request.
 */
export const getDashboardContext = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const memberships = await loadMemberships(session.user.id)
  if (memberships.length === 0) redirect("/onboarding")

  const active = await pickActive(memberships)
  return {
    user: session.user,
    memberships,
    tenant: active.tenant,
    role: active.role,
  }
})

/** Same as getDashboardContext but sends non-owners back to the dashboard. */
export const getOwnerDashboardContext = cache(async () => {
  const ctx = await getDashboardContext()
  if (ctx.role !== "OWNER") redirect("/dashboard")
  return ctx
})

/**
 * For server actions: never redirects. Returns null unless the signed-in user
 * is the OWNER of the active tenant.
 */
export async function getOwnerContext() {
  const session = await auth()
  if (!session?.user?.id) return null

  const memberships = await loadMemberships(session.user.id)
  if (memberships.length === 0) return null

  const active = await pickActive(memberships)
  if (active.role !== "OWNER") return null

  return { userId: session.user.id, tenant: active.tenant }
}

export type DashboardContext = Awaited<ReturnType<typeof getDashboardContext>>
