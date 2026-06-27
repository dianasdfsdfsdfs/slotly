import { TZDate } from "@date-fns/tz"
import { type Metadata } from "next"
import { notFound } from "next/navigation"

import { BookingWizard } from "@/components/booking/booking-wizard"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tenant = await db.tenant.findUnique({
    where: { slug },
    select: { name: true },
  })
  return { title: tenant ? `Book · ${tenant.name}` : "Book" }
}

function buildDates(timeZone: string) {
  const pad = (n: number) => String(n).padStart(2, "0")
  const today = new TZDate(Date.now(), timeZone)
  return Array.from({ length: 14 }, (_, i) => {
    const d = new TZDate(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + i,
      timeZone
    )
    return {
      iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      weekday: d.toLocaleDateString("en-US", { weekday: "short", timeZone }),
      day: d.toLocaleDateString("en-US", { day: "numeric", timeZone }),
      month: d.toLocaleDateString("en-US", { month: "short", timeZone }),
    }
  })
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tenant = await db.tenant.findUnique({ where: { slug } })
  if (!tenant) notFound()

  const services = await db.service.findMany({
    where: { tenantId: tenant.id, active: true },
    orderBy: { name: "asc" },
    include: {
      staff: {
        where: { staff: { active: true } },
        include: { staff: { select: { id: true, displayName: true } } },
      },
    },
  })

  const bookableServices = services
    .filter((s) => s.staff.length > 0)
    .map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      durationMinutes: s.durationMinutes,
      priceCents: s.priceCents,
      color: s.color,
      staff: s.staff.map((ss) => ss.staff),
    }))

  const session = await auth()
  const dates = buildDates(tenant.timezone)

  return (
    <main className="relative mx-auto min-h-svh w-full max-w-2xl px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[360px] w-[560px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[130px]"
      />
      <header className="relative mb-8 text-center">
        <p className="font-mono text-xs tracking-widest text-emerald-300/80 uppercase">
          Book an appointment
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {tenant.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a service and a time that works for you.
        </p>
      </header>

      {bookableServices.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted-foreground">
          This business isn&apos;t taking online bookings yet.
        </div>
      ) : (
        <BookingWizard
          tenant={{
            id: tenant.id,
            slug: tenant.slug,
            timezone: tenant.timezone,
          }}
          services={bookableServices}
          dates={dates}
          isAuthed={Boolean(session?.user?.id)}
        />
      )}
    </main>
  )
}
