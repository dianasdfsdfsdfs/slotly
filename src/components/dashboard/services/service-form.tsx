"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  DURATION_OPTIONS,
  SERVICE_COLORS,
  serviceFormSchema,
  type ServiceFormValues,
} from "@/lib/validations/service"
import {
  createService,
  deleteService,
  updateService,
} from "@/server/actions/service"

const fieldClass =
  "border-input bg-background/40 focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"

type Props =
  | { mode: "create" }
  | { mode: "edit"; serviceId: string; defaultValues: ServiceFormValues }

export function ServiceForm(props: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleting] = useTransition()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues:
      props.mode === "edit"
        ? props.defaultValues
        : {
            name: "",
            description: "",
            durationMinutes: 30,
            price: 0,
            color: SERVICE_COLORS[0],
            active: true,
          },
  })

  const onSubmit = (values: ServiceFormValues) => {
    startTransition(async () => {
      const result =
        props.mode === "create"
          ? await createService(values)
          : await updateService(props.serviceId, values)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(
        props.mode === "create" ? "Service created" : "Service updated"
      )
      router.push("/dashboard/services")
      router.refresh()
    })
  }

  const onDelete = () => {
    if (props.mode !== "edit") return
    startDeleting(async () => {
      const result = await deleteService(props.serviceId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Service deleted")
      router.push("/dashboard/services")
      router.refresh()
    })
  }

  const busy = isPending || isDeleting

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="glass max-w-xl space-y-5 rounded-xl p-6"
    >
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Haircut" {...register("name")} />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={3}
          placeholder="Optional details shown on the booking page."
          className={fieldClass}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="durationMinutes">Duration</Label>
          <select
            id="durationMinutes"
            className={cn(fieldClass, "h-9 py-0")}
            {...register("durationMinutes", { valueAsNumber: true })}
          >
            {DURATION_OPTIONS.map((d) => (
              <option key={d} value={d} className="bg-popover">
                {formatDuration(d)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && (
            <p className="text-xs text-destructive">{errors.price.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <div className="flex gap-2">
              {SERVICE_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => field.onChange(c)}
                  aria-label={c}
                  className={cn(
                    "size-7 rounded-full border-2 transition-transform hover:scale-110",
                    field.value === c ? "border-white" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-emerald-500"
          {...register("active")}
        />
        Active (bookable on your public page)
      </label>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={busy} className="h-10">
          {isPending
            ? "Saving…"
            : props.mode === "create"
              ? "Create service"
              : "Save changes"}
        </Button>
        {props.mode === "edit" && (
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={onDelete}
            className="h-10"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        )}
      </div>
    </form>
  )
}
