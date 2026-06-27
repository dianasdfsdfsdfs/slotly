import { describe, expect, it } from "vitest"

import { generateSlots, intervalsOverlap } from "./slots"

describe("intervalsOverlap", () => {
  it("detects overlapping intervals", () => {
    expect(intervalsOverlap({ start: 0, end: 10 }, { start: 5, end: 15 })).toBe(
      true
    )
  })

  it("treats touching intervals as non-overlapping (half-open)", () => {
    expect(
      intervalsOverlap({ start: 0, end: 10 }, { start: 10, end: 20 })
    ).toBe(false)
  })
})

describe("generateSlots", () => {
  it("generates slots across a window by step", () => {
    // 09:00–11:00 in minutes-from-midnight, 30 min service, 30 min step
    const slots = generateSlots({
      windows: [{ start: 540, end: 660 }],
      durationMinutes: 30,
      stepMinutes: 30,
    })
    expect(slots).toEqual([540, 570, 600, 630])
  })

  it("never returns a slot that exceeds the window", () => {
    const slots = generateSlots({
      windows: [{ start: 0, end: 50 }],
      durationMinutes: 30,
      stepMinutes: 30,
    })
    expect(slots).toEqual([0])
  })

  it("excludes slots overlapping a busy range", () => {
    const slots = generateSlots({
      windows: [{ start: 0, end: 120 }],
      busy: [{ start: 30, end: 60 }],
      durationMinutes: 30,
      stepMinutes: 30,
    })
    expect(slots).toEqual([0, 60, 90])
  })

  it("keeps a buffer around busy ranges", () => {
    const slots = generateSlots({
      windows: [{ start: 0, end: 120 }],
      busy: [{ start: 60, end: 90 }],
      durationMinutes: 30,
      stepMinutes: 30,
      bufferMinutes: 15,
    })
    expect(slots).toEqual([0])
  })

  it("drops slots starting before earliestStart", () => {
    const slots = generateSlots({
      windows: [{ start: 0, end: 120 }],
      durationMinutes: 30,
      stepMinutes: 30,
      earliestStart: 60,
    })
    expect(slots).toEqual([60, 90])
  })

  it("handles multiple windows and returns them sorted", () => {
    const slots = generateSlots({
      windows: [
        { start: 100, end: 160 },
        { start: 0, end: 60 },
      ],
      durationMinutes: 30,
      stepMinutes: 30,
    })
    expect(slots).toEqual([0, 30, 100, 130])
  })

  it("returns nothing without windows", () => {
    expect(
      generateSlots({ windows: [], durationMinutes: 30, stepMinutes: 15 })
    ).toEqual([])
  })

  it("returns nothing for non-positive duration or step", () => {
    expect(
      generateSlots({
        windows: [{ start: 0, end: 120 }],
        durationMinutes: 0,
        stepMinutes: 15,
      })
    ).toEqual([])
  })
})
