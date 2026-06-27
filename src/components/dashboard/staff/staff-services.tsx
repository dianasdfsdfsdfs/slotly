"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { setStaffServices } from "@/server/actions/staff"

export function StaffServices({
  staffId,
  services,
  initialSelected,
}: {
  staffId: string
  services: { id: string; name: string }[]
  initialSelected: string[]
}) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelected)
  )
  const [isPending, startTransition] = useTransition()

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const save = () =>
    startTransition(async () => {
      const result = await setStaffServices(staffId, [...selected])
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Services updated")
    })

  if (services.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add services first, then assign them here.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {services.map((service) => (
          <label key={service.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-emerald-500"
              checked={selected.has(service.id)}
              onChange={() => toggle(service.id)}
            />
            {service.name}
          </label>
        ))}
      </div>
      <Button onClick={save} disabled={isPending} className="h-9">
        {isPending ? "Saving…" : "Save services"}
      </Button>
    </div>
  )
}
