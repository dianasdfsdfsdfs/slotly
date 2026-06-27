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
      hint: "Coming soon",
      icon: Globe,
      href: null,
      done: false,
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening at {tenant.name}.
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          {tenant.plan} plan
        </span>
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
              <div className="flex items-center justify-between">
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
        <h2 className="font-medium">Get set up</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Finish these steps to start taking bookings.
        </p>
        <ul className="mt-4 space-y-2">
          {steps.map((step) => {
            const Icon = step.icon
            const inner = (
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-colors",
                  step.href &&
                    !step.done &&
                    "group-hover:border-emerald-500/30 group-hover:bg-emerald-500/[0.04]"
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    step.done
                      ? "bg-emerald-500 text-black"
                      : "bg-white/5 text-muted-foreground"
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
                {step.href && !step.done && (
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-emerald-300" />
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
              <li key={step.label} className="opacity-70">
                {inner}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
