"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useMemo, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  tenantSettingsSchema,
  type TenantSettingsInput,
} from "@/lib/validations/tenant"
import { updateTenantSettings } from "@/server/actions/tenant"

const fieldClass =
  "border-input bg-background/40 focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"

const STEP_OPTIONS = [5, 10, 15, 20, 30, 60]
const BUFFER_OPTIONS = [0, 5, 10, 15, 30]

function getTimezones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone")
  } catch {
    return ["UTC"]
  }
}

export function SettingsForm({
  defaultValues,
}: {
  defaultValues: TenantSettingsInput
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const timezones = useMemo(() => getTimezones(), [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantSettingsInput>({
    resolver: zodResolver(tenantSettingsSchema),
    defaultValues,
  })

  const onSubmit = (values: TenantSettingsInput) =>
    startTransition(async () => {
      const res = await updateTenantSettings(values)
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success("Settings saved")
      router.refresh()
    })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Business name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">Booking link</Label>
        <Input id="slug" {...register("slug")} />
        <p className="text-xs text-muted-foreground">
          Your public page: /book/&lt;link&gt;. Letters, numbers and dashes.
        </p>
        {errors.slug && (
          <p className="text-xs text-destructive">{errors.slug.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="timezone">Timezone</Label>
        <select id="timezone" className={fieldClass} {...register("timezone")}>
          {timezones.map((tz) => (
            <option key={tz} value={tz} className="bg-popover">
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="slotStepMinutes">Slot interval</Label>
          <select
            id="slotStepMinutes"
            className={fieldClass}
            {...register("slotStepMinutes", { valueAsNumber: true })}
          >
            {STEP_OPTIONS.map((m) => (
              <option key={m} value={m} className="bg-popover">
                {m} min
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bufferMinutes">Buffer between bookings</Label>
          <select
            id="bufferMinutes"
            className={fieldClass}
            {...register("bufferMinutes", { valueAsNumber: true })}
          >
            {BUFFER_OPTIONS.map((m) => (
              <option key={m} value={m} className="bg-popover">
                {m === 0 ? "None" : `${m} min`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className={cn("h-10")}>
        {isPending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  )
}
