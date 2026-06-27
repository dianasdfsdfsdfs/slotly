import { CheckCircle2 } from "lucide-react"
import { type Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import { formatDuration, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export const metadata: Metadata = { title: "Booking confirmed" }

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ booking?: string }>
}) {
  const { slug } = await params
  const { booking: bookingId } = await searchParams

  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/book/${slug}`)
  }
  if (!bookingId) notFound()

  const booking = await db.booking.findFirst({
    where: { id: bookingId, customerId: session.user.id, tenant: { slug } },
    include: { service: true, staff: true, tenant: true },
  })
  if (!booking) notFound()

  const tz = booking.tenant.timezone
  const when = booking.startAt.toLocaleString("en-US", {
    timeZone: tz,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <main className="relative mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-center px-4 py-10 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute top-10 left-1/2 h-[300px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]"
      />
      <div className="relative flex flex-col items-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
          <CheckCircle2 className="size-8" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Booking confirmed
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          See you soon at {booking.tenant.name}.
        </p>

        <dl className="card mt-6 w-full divide-y divide-white/10 px-4 text-left text-sm">
          <Row label="Service" value={booking.service.name} />
          <Row label="With" value={booking.staff.displayName} />
          <Row label="When" value={when} />
          <Row
            label="Duration"
            value={formatDuration(booking.service.durationMinutes)}
          />
          <Row label="Price" value={formatPrice(booking.priceCents)} />
        </dl>

        <div className="mt-6 flex w-full flex-col gap-2">
          <Link
            href={`/book/${slug}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 w-full"
            )}
          >
            Book another appointment
          </Link>
        </div>
      </div>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
