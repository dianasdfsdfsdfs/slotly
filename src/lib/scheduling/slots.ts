export type Interval = { start: number; end: number }

/** Half-open overlap test: [a.start, a.end) intersects [b.start, b.end). */
export function intervalsOverlap(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end
}

export interface GenerateSlotsParams {
  /** Bookable windows (e.g. a staff member's working hours for the day). */
  windows: Interval[]
  /** Unavailable ranges (existing bookings, time off). */
  busy?: Interval[]
  /** Length of the service being booked. */
  durationMinutes: number
  /** Granularity between candidate start times. */
  stepMinutes: number
  /** Required gap kept clear before/after each busy range. */
  bufferMinutes?: number
  /** Slots starting before this value are dropped (e.g. "now"). */
  earliestStart?: number
}

/**
 * Pure availability core. Returns sorted, de-duplicated slot start values.
 *
 * Unit-agnostic on purpose: the app passes epoch-minutes (resolved from the
 * tenant timezone elsewhere), so this function has no dates/timezones and is
 * trivially unit-testable.
 */
export function generateSlots({
  windows,
  busy = [],
  durationMinutes,
  stepMinutes,
  bufferMinutes = 0,
  earliestStart = Number.NEGATIVE_INFINITY,
}: GenerateSlotsParams): number[] {
  if (durationMinutes <= 0 || stepMinutes <= 0) return []

  // Expand busy ranges by the buffer so slots keep a gap around them.
  const blocked = busy.map((b) => ({
    start: b.start - bufferMinutes,
    end: b.end + bufferMinutes,
  }))

  const starts = new Set<number>()
  for (const window of windows) {
    for (
      let start = window.start;
      start + durationMinutes <= window.end;
      start += stepMinutes
    ) {
      if (start < earliestStart) continue
      const candidate: Interval = { start, end: start + durationMinutes }
      if (blocked.some((range) => intervalsOverlap(candidate, range))) continue
      starts.add(start)
    }
  }

  return [...starts].sort((a, b) => a - b)
}
