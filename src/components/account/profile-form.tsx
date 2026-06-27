"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { profileSchema, type ProfileInput } from "@/lib/validations/account"
import { updateProfile } from "@/server/actions/account"

export function ProfileForm({
  email,
  defaultValues,
}: {
  email: string
  defaultValues: ProfileInput
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  })

  const onSubmit = (values: ProfileInput) =>
    startTransition(async () => {
      const res = await updateProfile(values)
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success("Profile updated")
      router.refresh()
    })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled readOnly />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          placeholder="+1 555 000 0000"
          {...register("phone")}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isPending} className="h-10">
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  )
}
