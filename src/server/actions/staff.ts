"use server"

import { revalidatePath } from "next/cache"

import { PLAN_LIMITS } from "@/lib/constants"
import { staffFormSchema, workingHoursSchema } from "@/lib/validations/staff"
import { db } from "@/server/db"
import { getOwnerContext } from "@/server/tenant"

type ActionResult = { success: true } | { success: false; error: string }
type CreateResult =
  | { success: true; id: string }
  | { success: false; error: string }

const NOT_AUTHORIZED = {
  success: false as const,
  error: "You are not authorized to do that.",
}

export async function createStaff(input: unknown): Promise<CreateResult> {
  const ctx = await getOwnerContext()
  if (!ctx) return NOT_AUTHORIZED

  const parsed = staffFormSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." }
  }

  const limit = PLAN_LIMITS[ctx.tenant.plan].staff
  const count = await db.staff.count({ where: { tenantId: ctx.tenant.id } })
  if (count >= limit) {
    return {
      success: false,
      error: `Your ${ctx.tenant.plan} plan allows up to ${limit} staff. Upgrade to Pro to add more.`,
    }
  }

  const { displayName, bio, active } = parsed.data
  const staff = await db.staff.create({
    data: {
      tenantId: ctx.tenant.id,
      displayName,
      bio: bio || null,
      active,
    },
    select: { id: true },
  })

  revalidatePath("/dashboard/staff")
  return { success: true, id: staff.id }
}

export async function updateStaff(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const ctx = await getOwnerContext()
  if (!ctx) return NOT_AUTHORIZED

  const parsed = staffFormSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Please check the form and try again." }
  }

  const existing = await db.staff.findFirst({
    where: { id, tenantId: ctx.tenant.id },
    select: { id: true },
  })
  if (!existing) return { success: false, error: "Staff member not found." }

  const { displayName, bio, active } = parsed.data
  await db.staff.update({
    where: { id },
    data: { displayName, bio: bio || null, active },
  })

  revalidatePath("/dashboard/staff")
  revalidatePath(`/dashboard/staff/${id}`)
  return { success: true }
}

export async function deleteStaff(id: string): Promise<ActionResult> {
  const ctx = await getOwnerContext()
  if (!ctx) return NOT_AUTHORIZED

  const existing = await db.staff.findFirst({
    where: { id, tenantId: ctx.tenant.id },
    select: { id: true },
  })
  if (!existing) return { success: false, error: "Staff member not found." }

  await db.staff.delete({ where: { id } })

  revalidatePath("/dashboard/staff")
  return { success: true }
}

export async function setStaffServices(
  staffId: string,
  serviceIds: string[]
): Promise<ActionResult> {
  const ctx = await getOwnerContext()
  if (!ctx) return NOT_AUTHORIZED

  const staff = await db.staff.findFirst({
    where: { id: staffId, tenantId: ctx.tenant.id },
    select: { id: true },
  })
  if (!staff) return { success: false, error: "Staff member not found." }

  // Only keep service ids that actually belong to this tenant.
  const valid = await db.service.findMany({
    where: { id: { in: serviceIds }, tenantId: ctx.tenant.id },
    select: { id: true },
  })

  await db.$transaction([
    db.staffService.deleteMany({ where: { staffId } }),
    db.staffService.createMany({
      data: valid.map((s) => ({ staffId, serviceId: s.id })),
    }),
  ])

  revalidatePath(`/dashboard/staff/${staffId}`)
  return { success: true }
}

export async function setWorkingHours(
  staffId: string,
  input: unknown
): Promise<ActionResult> {
  const ctx = await getOwnerContext()
  if (!ctx) return NOT_AUTHORIZED

  const staff = await db.staff.findFirst({
    where: { id: staffId, tenantId: ctx.tenant.id },
    select: { id: true },
  })
  if (!staff) return { success: false, error: "Staff member not found." }

  const parsed = workingHoursSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Please check the working hours." }
  }

  await db.$transaction([
    db.workingHours.deleteMany({ where: { staffId } }),
    db.workingHours.createMany({
      data: parsed.data.map((wh) => ({
        staffId,
        weekday: wh.weekday,
        startMinutes: wh.startMinutes,
        endMinutes: wh.endMinutes,
      })),
    }),
  ])

  revalidatePath(`/dashboard/staff/${staffId}`)
  return { success: true }
}
