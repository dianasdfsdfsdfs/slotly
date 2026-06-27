"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  createTenantSchema,
  type CreateTenantInput,
} from "@/lib/validations/tenant"
import { createTenant } from "@/server/actions/tenant"

function getTimezones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone")
  } catch {
    return ["UTC"]
  }
}

function getDefaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  } catch {
    return "UTC"
  }
}

export function OnboardingForm() {
  const [isPending, startTransition] = useTransition()
  const timezones = useMemo(getTimezones, [])
  const defaultTimezone = useMemo(getDefaultTimezone, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTenantInput>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: { name: "", timezone: defaultTimezone },
  })

  const onSubmit = (values: CreateTenantInput) => {
    startTransition(async () => {
      // On success the action redirects to /dashboard; only errors return.
      const result = await createTenant(values)
      if (result && !result.success) {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Business name</Label>
        <Input id="name" placeholder="Acme Studio" {...register("name")} />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="timezone">Timezone</Label>
        <select
          id="timezone"
          {...register("timezone")}
          className="h-9 w-full rounded-md border border-input bg-background/40 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {timezones.map((tz) => (
            <option key={tz} value={tz} className="bg-popover">
              {tz}
            </option>
          ))}
        </select>
        {errors.timezone && (
          <p className="text-xs text-destructive">{errors.timezone.message}</p>
        )}
      </div>
      <Button type="submit" className="h-10 w-full" disabled={isPending}>
        {isPending ? "Creating…" : "Create business"}
      </Button>
    </form>
  )
}
