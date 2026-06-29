"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { openBillingPortal, startCheckout } from "@/server/actions/billing"

export function UpgradeButton({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <Button
      className={cn("h-10 w-full", className)}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await startCheckout()
          if (res?.error) toast.error(res.error)
        })
      }
    >
      {isPending ? "Redirecting…" : "Upgrade to Pro"}
    </Button>
  )
}

export function ManageButton({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <Button
      variant="outline"
      className={cn("h-10 w-full", className)}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await openBillingPortal()
          if (res?.error) toast.error(res.error)
        })
      }
    >
      {isPending ? "Opening…" : "Manage billing"}
    </Button>
  )
}
