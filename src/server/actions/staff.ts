"use server"

import { TZDate } from "@date-fns/tz"
import { revalidatePath } from "next/cache"

import { PLAN_LIMITS } from "@/lib/constants"
import {
  staffFormSchema,
  timeOffSchema,
  workingHoursSchema,
} from "@/lib/validations/staff"
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

// Interpret a datetime-local string ("YYYY-MM-DDTHH:MM") as tenant-local time.
function parseLocalDateTime(value: string, timeZone: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!match) return null
  const [, y, mo, d, h, mi] = match
  return new Date(new TZDate(+y, +mo - 1, +d, +h, +mi, 0, timeZone).getTime())
}

export async function addTimeOff(
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

  const parsed = timeOffSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Please check the dates." }
  }

  const startAt = parseLocalDateTime(parsed.data.startAt, ctx.tenant.timezone)
  const endAt = parseLocalDateTime(parsed.data.endAt, ctx.tenant.timezone)
  if (!startAt || !endAt || endAt <= startAt) {
    return { success: false, error: "End time must be after start time." }
  }

  await db.timeOff.create({
    data: { staffId, startAt, endAt, reason: parsed.data.reason || null },
  })

  revalidatePath(`/dashboard/staff/${staffId}`)
  return { success: true }
}

export async function deleteTimeOff(id: string): Promise<ActionResult> {
  const ctx = await getOwnerContext()
  if (!ctx) return NOT_AUTHORIZED

  const existing = await db.timeOff.findFirst({
    where: { id, staff: { tenantId: ctx.tenant.id } },
    select: { id: true, staffId: true },
  })
  if (!existing) return { success: false, error: "Time off not found." }

  await db.timeOff.delete({ where: { id } })

  revalidatePath(`/dashboard/staff/${existing.staffId}`)
  return { success: true }
}
