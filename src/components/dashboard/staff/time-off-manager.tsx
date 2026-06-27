"use client"

import { Trash2 } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { addTimeOff, deleteTimeOff } from "@/server/actions/staff"

type TimeOffItem = {
  id: string
  startAt: string
  endAt: string
  reason: string | null
}

const fieldClass =
  "border-input bg-background/40 focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"

export function TimeOffManager({
  staffId,
  items,
  timeZone,
}: {
  staffId: string
  items: TimeOffItem[]
  timeZone: string
}) {
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [reason, setReason] = useState("")
  const [isPending, startTransition] = useTransition()

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      timeZone,
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const add = () => {
    if (!start || !end) {
      toast.error("Pick a start and end time.")
      return
    }
    startTransition(async () => {
      const res = await addTimeOff(staffId, {
        startAt: start,
        endAt: end,
        reason,
      })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success("Time off added")
      setStart("")
      setEnd("")
      setReason("")
    })
  }

  const remove = (id: string) =>
    startTransition(async () => {
      const res = await deleteTimeOff(id)
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success("Removed")
    })

  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {fmt(t.startAt)} → {fmt(t.endAt)}
                </p>
                {t.reason && (
                  <p className="text-xs text-muted-foreground">{t.reason}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(t.id)}
                disabled={isPending}
                aria-label="Remove time off"
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="to-start">Start</Label>
          <input
            id="to-start"
            type="datetime-local"
            className={fieldClass}
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to-end">End</Label>
          <input
            id="to-end"
            type="datetime-local"
            className={fieldClass}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="to-reason">Reason (optional)</Label>
        <input
          id="to-reason"
          type="text"
          placeholder="Vacation"
          className={fieldClass}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <Button onClick={add} disabled={isPending} className="h-9">
        {isPending ? "Saving…" : "Add time off"}
      </Button>
    </div>
  )
}
