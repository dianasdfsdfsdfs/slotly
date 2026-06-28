"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { openBillingPortal, startCheckout } from "@/server/actions/billing"

export function BillingActions({ isPro }: { isPro: boolean }) {
  const [isPending, startTransition] = useTransition()

  const upgrade = () =>
    startTransition(async () => {
      const res = await startCheckout()
      if (res?.error) toast.error(res.error)
    })

  const manage = () =>
    startTransition(async () => {
      const res = await openBillingPortal()
      if (res?.error) toast.error(res.error)
    })

  if (isPro) {
    return (
      <Button
        variant="outline"
        onClick={manage}
        disabled={isPending}
        className="h-10"
      >
        {isPending ? "Opening…" : "Manage billing"}
      </Button>
    )
  }

  return (
    <Button onClick={upgrade} disabled={isPending} className="h-10">
      {isPending ? "Redirecting…" : "Upgrade to Pro"}
    </Button>
  )
}
