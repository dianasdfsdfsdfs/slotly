"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { minutesToTime, timeToMinutes, WEEKDAYS } from "@/lib/format"
import { setWorkingHours } from "@/server/actions/staff"

type DayState = { enabled: boolean; start: string; end: string }

const timeClass =
  "border-input bg-background/40 h-8 rounded-md border px-2 text-sm outline-none disabled:opacity-40"

export function WorkingHoursEditor({
  staffId,
  initial,
}: {
  staffId: string
  initial: { weekday: number; startMinutes: number; endMinutes: number }[]
}) {
  const [days, setDays] = useState<DayState[]>(() =>
    Array.from({ length: 7 }, (_, weekday) => {
      const wh = initial.find((i) => i.weekday === weekday)
      return wh
        ? {
            enabled: true,
            start: minutesToTime(wh.startMinutes),
            end: minutesToTime(wh.endMinutes),
          }
        : { enabled: false, start: "09:00", end: "17:00" }
    })
  )
  const [isPending, startTransition] = useTransition()

  const update = (index: number, patch: Partial<DayState>) =>
    setDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...patch } : d))
    )

  const save = () => {
    const payload = days
      .map((day, weekday) => ({ day, weekday }))
      .filter(({ day }) => day.enabled)
      .map(({ day, weekday }) => ({
        weekday,
        startMinutes: timeToMinutes(day.start),
        endMinutes: timeToMinutes(day.end),
      }))

    if (payload.some((p) => p.endMinutes <= p.startMinutes)) {
      toast.error("End time must be after start time.")
      return
    }

    startTransition(async () => {
      const result = await setWorkingHours(staffId, payload)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Working hours updated")
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {days.map((day, index) => (
          <div key={index} className="flex items-center gap-3">
            <label className="flex w-32 items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-emerald-500"
                checked={day.enabled}
                onChange={(e) => update(index, { enabled: e.target.checked })}
              />
              {WEEKDAYS[index]}
            </label>
            <input
              type="time"
              className={timeClass}
              disabled={!day.enabled}
              value={day.start}
              onChange={(e) => update(index, { start: e.target.value })}
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="time"
              className={timeClass}
              disabled={!day.enabled}
              value={day.end}
              onChange={(e) => update(index, { end: e.target.value })}
            />
          </div>
        ))}
      </div>
      <Button onClick={save} disabled={isPending} className="h-9">
        {isPending ? "Saving…" : "Save hours"}
      </Button>
    </div>
  )
}
