import { type Metadata } from "next"
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Globe,
  Scissors,
  Users,
} from "lucide-react"
import Link from "next/link"

import { BookingLink } from "@/components/dashboard/booking-link"
import { cn } from "@/lib/utils"
import { db } from "@/server/db"
import { getDashboardContext } from "@/server/tenant"

export const metadata: Metadata = { title: "Overview" }

export default async function DashboardOverviewPage() {
  const { tenant, user } = await getDashboardContext()

  const [services, staff, bookings] = await Promise.all([
    db.service.count({ where: { tenantId: tenant.id } }),
    db.staff.count({ where: { tenantId: tenant.id } }),
    db.booking.count({ where: { tenantId: tenant.id } }),
  ])

  const firstName = user.name?.split(" ")[0]
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000"

  const stats = [
    {
      label: "Services",
      value: services,
      icon: Scissors,
      href: "/dashboard/services",
    },
    { label: "Staff", value: staff, icon: Users, href: "/dashboard/staff" },
    {
      label: "Bookings",
      value: bookings,
      icon: CalendarCheck,
      href: "/dashboard/bookings",
    },
  ]

  const steps: {
    label: string
    hint: string
    icon: typeof Scissors
    href: string | null
    done: boolean
  }[] = [
    {
      label: "Add your first service",
      hint: "Set a name, duration and price",
      icon: Scissors,
      href: "/dashboard/services/new",
      done: services > 0,
    },
    {
      label: "Add a staff member",
      hint: "Assign services and working hours",
      icon: Users,
      href: "/dashboard/staff/new",
      done: staff > 0,
    },
    {
      label: "Share your booking page",
      hint: "Copy your link and send it to clients",
      icon: Globe,
      href: "/dashboard/settings",
      done: false,
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-widest text-emerald-300/80 uppercase">
            Dashboard
          </p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight">
            Welcome back
            {firstName && (
              <>
                ,{" "}
                <span className="bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
                  {firstName}
                </span>
              </>
            )}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening at{" "}
            <span className="font-medium text-foreground">{tenant.name}</span>.
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          {tenant.plan} plan
        </span>
      </div>

      <div className="card relative overflow-hidden p-5">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <div className="relative">
          <p className="font-medium">Your booking page</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Share this link with clients — they pick a service and time, you get
            the booking.
          </p>
          <div className="mt-3">
            <BookingLink url={`${baseUrl}/book/${tenant.slug}`} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group card card-interactive relative overflow-hidden p-5"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/20"
              />
              <div className="relative flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
                <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
                  <Icon className="size-5" />
                </span>
              </div>
              <p className="mt-4 text-4xl font-semibold tabular-nums">
                {stat.value}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground/60 transition-colors group-hover:text-emerald-300">
                Manage
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          )
        })}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-medium">Get set up</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Finish these steps to start taking bookings.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            {steps.filter((s) => s.done).length} / {steps.length} done
          </span>
        </div>

        <ul className="mt-5 space-y-2.5">
          {steps.map((step) => {
            const Icon = step.icon
            const soon = step.href === null
            const inner = (
              <div
                className={cn(
                  "flex items-center gap-4 rounded-xl border p-3.5 transition-all",
                  step.done
                    ? "border-emerald-500/25 bg-emerald-500/[0.07]"
                    : soon
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-white/10 bg-white/[0.03] group-hover:-translate-y-px group-hover:border-emerald-500/40 group-hover:bg-emerald-500/[0.06]"
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                    step.done
                      ? "bg-emerald-500 text-black"
                      : "bg-emerald-500/10 text-emerald-300"
                  )}
                >
                  {step.done ? (
                    <Check className="size-5" />
                  ) : (
                    <Icon className="size-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      step.done && "text-muted-foreground line-through"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.hint}</p>
                </div>
                {step.done ? (
                  <span className="text-xs font-medium text-emerald-300">
                    Done
                  </span>
                ) : soon ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    Soon
                  </span>
                ) : (
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-300" />
                )}
              </div>
            )

            return step.href ? (
              <li key={step.label}>
                <Link href={step.href} className="group block">
                  {inner}
                </Link>
              </li>
            ) : (
              <li key={step.label}>{inner}</li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
