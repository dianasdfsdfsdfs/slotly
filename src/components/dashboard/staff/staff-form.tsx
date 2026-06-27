"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { staffFormSchema, type StaffFormValues } from "@/lib/validations/staff"
import { createStaff, deleteStaff, updateStaff } from "@/server/actions/staff"

const fieldClass =
  "border-input bg-background/40 focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"

type Props =
  | { mode: "create" }
  | { mode: "edit"; staffId: string; defaultValues: StaffFormValues }

export function StaffForm(props: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleting] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues:
      props.mode === "edit"
        ? props.defaultValues
        : { displayName: "", bio: "", active: true },
  })

  const onSubmit = (values: StaffFormValues) => {
    startTransition(async () => {
      if (props.mode === "create") {
        const result = await createStaff(values)
        if (!result.success) {
          toast.error(result.error)
          return
        }
        toast.success("Staff member added")
        router.push(`/dashboard/staff/${result.id}`)
        router.refresh()
      } else {
        const result = await updateStaff(props.staffId, values)
        if (!result.success) {
          toast.error(result.error)
          return
        }
        toast.success("Saved")
        router.refresh()
      }
    })
  }

  const onDelete = () => {
    if (props.mode !== "edit") return
    startDeleting(async () => {
      const result = await deleteStaff(props.staffId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Staff member removed")
      router.push("/dashboard/staff")
      router.refresh()
    })
  }

  const busy = isPending || isDeleting

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="displayName">Name</Label>
        <Input
          id="displayName"
          placeholder="Alex Morgan"
          {...register("displayName")}
        />
        {errors.displayName && (
          <p className="text-xs text-destructive">
            {errors.displayName.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          rows={3}
          placeholder="Optional short bio shown on the booking page."
          className={fieldClass}
          {...register("bio")}
        />
        {errors.bio && (
          <p className="text-xs text-destructive">{errors.bio.message}</p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-emerald-500"
          {...register("active")}
        />
        Active (accepts bookings)
      </label>

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={busy} className="h-10">
          {isPending
            ? "Saving…"
            : props.mode === "create"
              ? "Add staff member"
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
