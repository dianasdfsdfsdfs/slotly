import { type Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { CancelBookingButton } from "@/components/booking/cancel-booking-button"
import { BookingStatusBadge } from "@/components/booking/status-badge"
import { buttonVariants } from "@/components/ui/button"
import { formatDateTime, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export const metadata: Metadata = { title: "My bookings" }

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const bookings = await db.booking.findMany({
    where: { customerId: session.user.id },
    include: { service: true, staff: true, tenant: true },
    orderBy: { startAt: "desc" },
  })

  const now = new Date()
  const upcoming = bookings.filter(
    (b) => b.status !== "CANCELLED" && b.startAt > now
  )
  const past = bookings.filter(
    (b) => !(b.status !== "CANCELLED" && b.startAt > now)
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">My bookings</h1>
        <Link
          href="/account/settings"
          className={cn(buttonVariants({ variant: "outline" }), "h-9")}
        >
          Settings
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="card p-8 text-center text-sm text-muted-foreground">
            No upcoming bookings.
          </div>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((b) => (
              <li
                key={b.id}
                className="card flex flex-wrap items-center gap-4 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {b.service.name}
                    <span className="text-muted-foreground">
                      {" "}
                      · {b.tenant.name}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(b.startAt, b.tenant.timezone)} · with{" "}
                    {b.staff.displayName}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {formatPrice(b.priceCents)}
                </span>
                <CancelBookingButton bookingId={b.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Past &amp; cancelled
          </h2>
          <ul className="space-y-2">
            {past.map((b) => (
              <li
                key={b.id}
                className="card flex flex-wrap items-center gap-4 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {b.service.name}
                    <span className="text-muted-foreground">
                      {" "}
                      · {b.tenant.name}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(b.startAt, b.tenant.timezone)} · with{" "}
                    {b.staff.displayName}
                  </p>
                </div>
                <BookingStatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
