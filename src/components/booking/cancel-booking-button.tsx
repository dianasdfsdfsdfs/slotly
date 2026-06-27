"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cancelBooking } from "@/server/actions/booking"

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await cancelBooking(bookingId)
          if (!res.success) {
            toast.error(res.error)
            return
          }
          toast.success("Booking cancelled")
        })
      }
    >
      {isPending ? "Cancelling…" : "Cancel"}
    </Button>
  )
}
