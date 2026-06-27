"use server"

import { revalidatePath } from "next/cache"

import { PLAN_LIMITS } from "@/lib/constants"
import { serviceFormSchema } from "@/lib/validations/service"
import { db } from "@/server/db"
import { getOwnerContext } from "@/server/tenant"

type ActionResult = { success: true } | { success: false; error: string }

const NOT_AUTHORIZED: ActionResult = {
  success: false,
  error: "You are not authorized to do that.",
}

export async function createService(input: unknown): Promise<ActionResult> {
  const ctx = await getOwnerContext()
  if (!ctx) return NOT_AUTHORIZED

  const parsed = serviceFormSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." }
  }

  const limit = PLAN_LIMITS[ctx.tenant.plan].services
  const count = await db.service.count({ where: { tenantId: ctx.tenant.id } })
  if (count >= limit) {
    return {
      success: false,
      error: `Your ${ctx.tenant.plan} plan allows up to ${limit} services. Upgrade to Pro to add more.`,
    }
  }

  const { name, description, durationMinutes, price, color, active } =
    parsed.data
  await db.service.create({
    data: {
      tenantId: ctx.tenant.id,
      name,
      description: description || null,
      durationMinutes,
      priceCents: Math.round(price * 100),
      color,
      active,
    },
  })

  revalidatePath("/dashboard/services")
  return { success: true }
}

export async function updateService(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const ctx = await getOwnerContext()
  if (!ctx) return NOT_AUTHORIZED

  const parsed = serviceFormSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." }
  }

  const existing = await db.service.findFirst({
    where: { id, tenantId: ctx.tenant.id },
    select: { id: true },
  })
  if (!existing) return { success: false, error: "Service not found." }

  const { name, description, durationMinutes, price, color, active } =
    parsed.data
  await db.service.update({
    where: { id },
    data: {
      name,
      description: description || null,
      durationMinutes,
      priceCents: Math.round(price * 100),
      color,
      active,
    },
  })

  revalidatePath("/dashboard/services")
  return { success: true }
}

export async function deleteService(id: string): Promise<ActionResult> {
  const ctx = await getOwnerContext()
  if (!ctx) return NOT_AUTHORIZED

  const existing = await db.service.findFirst({
    where: { id, tenantId: ctx.tenant.id },
    select: { id: true },
  })
  if (!existing) return { success: false, error: "Service not found." }

  await db.service.delete({ where: { id } })

  revalidatePath("/dashboard/services")
  return { success: true }
}
