import type { BookingStatus } from "@/generated/prisma/client"
import { cn } from "@/lib/utils"

const STYLES: Record<BookingStatus, string> = {
  CONFIRMED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  COMPLETED: "text-muted-foreground border-white/15 bg-white/5",
  CANCELLED: "border-rose-500/30 bg-rose-500/10 text-rose-300",
}

const LABELS: Record<BookingStatus, string> = {
  CONFIRMED: "Confirmed",
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STYLES[status]
      )}
    >
      {LABELS[status]}
    </span>
  )
}
