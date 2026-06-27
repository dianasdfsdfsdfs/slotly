import "server-only"

import { TZDate } from "@date-fns/tz"

import { generateSlots, type Interval } from "@/lib/scheduling/slots"
import { db } from "@/server/db"

const MS_PER_MIN = 60_000

export type AvailableSlot = { start: Date; end: Date }

/**
 * Available start times for a service performed by a staff member on a given
 * local date (YYYY-MM-DD, interpreted in the tenant's timezone).
 *
 * Working hours are stored as local minutes-from-midnight; bookings and time
 * off are absolute instants. Everything is reduced to epoch-minutes and fed to
 * the pure {@link generateSlots} core.
 */
export async function getAvailableSlots(params: {
  tenantId: string
  staffId: string
  serviceId: string
  dateISO: string
}): Promise<AvailableSlot[]> {
  const { tenantId, staffId, serviceId, dateISO } = params

  const [tenant, service, staff] = await Promise.all([
    db.tenant.findUnique({ where: { id: tenantId } }),
    db.service.findFirst({ where: { id: serviceId, tenantId } }),
    db.staff.findFirst({ where: { id: staffId, tenantId } }),
  ])
  if (!tenant || !service?.active || !staff?.active) return []

  const tz = tenant.timezone
  const [year, month, day] = dateISO.split("-").map(Number)
  if (!year || !month || !day) return []

  // local minutes-from-midnight on this date -> epoch minutes
  const localMinuteToEpochMin = (minutes: number) =>
    new TZDate(
      year,
      month - 1,
      day,
      Math.floor(minutes / 60),
      minutes % 60,
      0,
      tz
    ).getTime() / MS_PER_MIN

  const dayStart = new TZDate(year, month - 1, day, 0, 0, 0, tz)
  const dayEnd = new TZDate(year, month - 1, day + 1, 0, 0, 0, tz)
  const weekday = dayStart.getDay()

  const workingHours = await db.workingHours.findMany({
    where: { staffId, weekday },
  })
  if (workingHours.length === 0) return []

  const windows: Interval[] = workingHours.map((wh) => ({
    start: localMinuteToEpochMin(wh.startMinutes),
    end: localMinuteToEpochMin(wh.endMinutes),
  }))

  const dayStartDate = new Date(dayStart.getTime())
  const dayEndDate = new Date(dayEnd.getTime())

  const [bookings, timeOff] = await Promise.all([
    db.booking.findMany({
      where: {
        staffId,
        status: { not: "CANCELLED" },
        startAt: { lt: dayEndDate },
        endAt: { gt: dayStartDate },
      },
      select: { startAt: true, endAt: true },
    }),
    db.timeOff.findMany({
      where: {
        staffId,
        startAt: { lt: dayEndDate },
        endAt: { gt: dayStartDate },
      },
      select: { startAt: true, endAt: true },
    }),
  ])

  const busy: Interval[] = [...bookings, ...timeOff].map((b) => ({
    start: b.startAt.getTime() / MS_PER_MIN,
    end: b.endAt.getTime() / MS_PER_MIN,
  }))

  const slotStarts = generateSlots({
    windows,
    busy,
    durationMinutes: service.durationMinutes,
    stepMinutes: tenant.slotStepMinutes,
    bufferMinutes: tenant.bufferMinutes,
    earliestStart: Date.now() / MS_PER_MIN,
  })

  return slotStarts.map((startMin) => ({
    start: new Date(startMin * MS_PER_MIN),
    end: new Date((startMin + service.durationMinutes) * MS_PER_MIN),
  }))
}
