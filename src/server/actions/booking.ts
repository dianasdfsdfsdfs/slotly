"use server"

import { TZDate } from "@date-fns/tz"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getAvailableSlots } from "@/server/availability"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export type SlotOption = { start: string; staffId: string }

const slotsSchema = z.object({
  tenantId: z.string().min(1),
  serviceId: z.string().min(1),
  staffId: z.string().min(1), // a staff id or "any"
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

/** Public: available slots for a service on a date, for one staff or "any". */
export async function fetchAvailableSlots(
  input: unknown
): Promise<SlotOption[]> {
  const parsed = slotsSchema.safeParse(input)
  if (!parsed.success) return []
  const { tenantId, serviceId, staffId, dateISO } = parsed.data

  if (staffId !== "any") {
    const slots = await getAvailableSlots({
      tenantId,
      staffId,
      serviceId,
      dateISO,
    })
    return slots.map((s) => ({ start: s.start.toISOString(), staffId }))
  }

  // "any": union across eligible staff; first staff to offer a start wins.
  const links = await db.staffService.findMany({
    where: { serviceId, staff: { tenantId, active: true } },
    select: { staffId: true },
  })

  const byStart = new Map<string, string>()
  for (const { staffId: sid } of links) {
    const slots = await getAvailableSlots({
      tenantId,
      staffId: sid,
      serviceId,
      dateISO,
    })
    for (const s of slots) {
      const iso = s.start.toISOString()
      if (!byStart.has(iso)) byStart.set(iso, sid)
    }
  }

  return [...byStart.entries()]
    .map(([start, sid]) => ({ start, staffId: sid }))
    .sort((a, b) => (a.start < b.start ? -1 : 1))
}

const createSchema = z.object({
  tenantId: z.string().min(1),
  serviceId: z.string().min(1),
  staffId: z.string().min(1),
  startISO: z.string().min(1),
})

type CreateResult =
  | { ok: true; bookingId: string; slug: string }
  | { ok: false; code: "AUTH" | "INVALID" | "CONFLICT"; error: string }

function localDateISO(instant: Date, timeZone: string): string {
  const z = new TZDate(instant.getTime(), timeZone)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${z.getFullYear()}-${pad(z.getMonth() + 1)}-${pad(z.getDate())}`
}

export async function createBooking(input: unknown): Promise<CreateResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "AUTH", error: "Please sign in to book." }
  }

  const parsed = createSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: "INVALID", error: "Invalid booking details." }
  }
  const { tenantId, serviceId, staffId, startISO } = parsed.data

  const [tenant, service, staff, user] = await Promise.all([
    db.tenant.findUnique({ where: { id: tenantId } }),
    db.service.findFirst({ where: { id: serviceId, tenantId } }),
    db.staff.findFirst({ where: { id: staffId, tenantId } }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true },
    }),
  ])

  if (!tenant || !service?.active || !staff?.active || !user) {
    return { ok: false, code: "INVALID", error: "This booking is unavailable." }
  }

  const link = await db.staffService.findUnique({
    where: { staffId_serviceId: { staffId, serviceId } },
  })
  if (!link) {
    return {
      ok: false,
      code: "INVALID",
      error: "This staff member can't do that service.",
    }
  }

  const start = new Date(startISO)
  if (Number.isNaN(start.getTime()) || start.getTime() < Date.now()) {
    return {
      ok: false,
      code: "CONFLICT",
      error: "That time is no longer available.",
    }
  }

  // Re-check the slot is genuinely free (working hours, bookings, time off).
  const dateISO = localDateISO(start, tenant.timezone)
  const available = await getAvailableSlots({
    tenantId,
    staffId,
    serviceId,
    dateISO,
  })
  const isFree = available.some(
    (s) => s.start.toISOString() === start.toISOString()
  )
  if (!isFree) {
    return {
      ok: false,
      code: "CONFLICT",
      error: "Sorry, that time was just taken. Please pick another.",
    }
  }

  const endAt = new Date(start.getTime() + service.durationMinutes * 60_000)

  try {
    const booking = await db.booking.create({
      data: {
        tenantId,
        serviceId,
        staffId,
        customerId: user.id,
        startAt: start,
        endAt,
        status: "CONFIRMED",
        customerName: user.name ?? "Customer",
        customerEmail: user.email ?? "",
        customerPhone: user.phone ?? null,
        priceCents: service.priceCents,
      },
      select: { id: true },
    })

    revalidatePath(`/book/${tenant.slug}`)
    return { ok: true, bookingId: booking.id, slug: tenant.slug }
  } catch (error) {
    // GiST exclusion constraint (Booking_no_overlap) -> someone booked it first.
    if (
      String(error).includes("Booking_no_overlap") ||
      String(error).includes("23P01") ||
      String(error).toLowerCase().includes("exclusion")
    ) {
      return {
        ok: false,
        code: "CONFLICT",
        error: "Sorry, that time was just taken. Please pick another.",
      }
    }
    console.error("createBooking failed:", error)
    return {
      ok: false,
      code: "INVALID",
      error: "Something went wrong. Try again.",
    }
  }
}

type CancelResult = { success: true } | { success: false; error: string }

export async function cancelBooking(bookingId: string): Promise<CancelResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Please sign in." }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, customerId: true, tenantId: true, status: true },
  })
  if (!booking) return { success: false, error: "Booking not found." }

  let allowed = booking.customerId === session.user.id
  if (!allowed) {
    const membership = await db.membership.findUnique({
      where: {
        userId_tenantId: {
          userId: session.user.id,
          tenantId: booking.tenantId,
        },
      },
    })
    allowed = membership?.role === "OWNER"
  }
  if (!allowed)
    return { success: false, error: "You can't cancel this booking." }

  if (booking.status !== "CANCELLED") {
    await db.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    })
  }

  revalidatePath("/account")
  revalidatePath("/dashboard/bookings")
  return { success: true }
}
