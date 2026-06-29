"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ACTIVE_TENANT_COOKIE } from "@/lib/constants"
import { slugify } from "@/lib/slug"
import {
  createTenantSchema,
  tenantSettingsSchema,
} from "@/lib/validations/tenant"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { getOwnerContext } from "@/server/tenant"

type ActionError = { success: false; error: string }

function setActiveTenantCookie(
  store: Awaited<ReturnType<typeof cookies>>,
  id: string
) {
  store.set(ACTIVE_TENANT_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })
}

export async function createTenant(
  input: unknown
): Promise<ActionError | void> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in." }
  }

  const parsed = createTenantSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." }
  }

  const { name, timezone } = parsed.data

  // Ensure a unique slug.
  const base = slugify(name) || "business"
  let slug = base
  let suffix = 1
  while (await db.tenant.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix++}`
  }

  const tenant = await db.tenant.create({
    data: {
      name,
      slug,
      timezone,
      memberships: { create: { userId: session.user.id, role: "OWNER" } },
    },
  })

  const cookieStore = await cookies()
  setActiveTenantCookie(cookieStore, tenant.id)

  redirect("/dashboard")
}

export async function setActiveTenant(tenantId: string) {
  const session = await auth()
  if (!session?.user?.id) return

  const membership = await db.membership.findUnique({
    where: { userId_tenantId: { userId: session.user.id, tenantId } },
  })
  if (!membership) return

  const cookieStore = await cookies()
  setActiveTenantCookie(cookieStore, tenantId)

  revalidatePath("/dashboard")
}

export async function updateTenantSettings(
  input: unknown
): Promise<{ success: true } | { success: false; error: string }> {
  const ctx = await getOwnerContext()
  if (!ctx) return { success: false, error: "You are not authorized." }

  const parsed = tenantSettingsSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." }
  }

  const { name, timezone, slotStepMinutes, bufferMinutes } = parsed.data
  const slug = slugify(parsed.data.slug) || "business"

  const clash = await db.tenant.findFirst({
    where: { slug, NOT: { id: ctx.tenant.id } },
    select: { id: true },
  })
  if (clash) {
    return { success: false, error: "That booking link is taken. Try another." }
  }

  await db.tenant.update({
    where: { id: ctx.tenant.id },
    data: { name, slug, timezone, slotStepMinutes, bufferMinutes },
  })

  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard")
  return { success: true }
}
