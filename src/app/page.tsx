import {
  ArrowRight,
  CalendarClock,
  Check,
  Globe,
  Mail,
  Users,
} from "lucide-react"
import Link from "next/link"

import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"
import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { auth } from "@/server/auth"

const FEATURES = [
  {
    icon: Globe,
    title: "Your own booking page",
    text: "Share one link. Clients pick a service, a team member and a time — no calls, no DMs.",
  },
  {
    icon: CalendarClock,
    title: "Smart availability",
    text: "Real-time slots from each staff member's hours and time off, with no double-booking.",
  },
  {
    icon: Users,
    title: "Staff & schedules",
    text: "Manage your team, services, prices and weekly working hours in one place.",
  },
  {
    icon: Mail,
    title: "Automatic emails",
    text: "Confirmations and cancellations are sent to your clients for you.",
  },
]

const STEPS = [
  {
    title: "Create your page",
    text: "Sign up and set your business name, timezone and services.",
  },
  {
    title: "Add your team",
    text: "Add staff, assign services and set their working hours.",
  },
  {
    title: "Share your link",
    text: "Send clients your booking link and watch your calendar fill up.",
  },
]

export default async function Home() {
  const session = await auth()
  const isAuthed = Boolean(session?.user?.id)

  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <SiteHeader isAuthed={isAuthed} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-24 sm:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[130px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-1/4 bottom-0 h-[300px] w-[300px] rounded-full bg-teal-400/10 blur-[110px]"
          />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-xs tracking-widest text-emerald-300 uppercase backdrop-blur">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Booking for service businesses
            </span>
            <h1 className="text-5xl font-semibold tracking-tight text-balance sm:text-6xl md:text-7xl">
              <span className="text-gradient">Online booking</span>
              <br />
              your clients actually finish
            </h1>
            <p className="mt-6 max-w-xl text-lg text-balance text-muted-foreground">
              {siteConfig.name} gives salons, studios, clinics and independent
              pros a beautiful booking page, smart availability and automatic
              reminders — set up in minutes.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 px-6 text-sm"
                )}
              >
                Start free →
              </Link>
              <Link
                href="/book/demo"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 px-6 text-sm"
                )}
              >
                See a live demo
              </Link>
            </div>
            <p className="mt-6 font-mono text-xs text-muted-foreground/70">
              No credit card · Free plan forever
            </p>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight">
                Everything you need to take bookings
              </h2>
              <p className="mt-3 text-muted-foreground">
                Run the whole thing from one clean dashboard.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {FEATURES.map((f) => {
                const Icon = f.icon
                return (
                  <div key={f.title} className="card p-6">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-medium">{f.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {f.text}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight">
                Live in three steps
              </h2>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.title} className="card p-6">
                  <span className="font-mono text-sm font-semibold text-emerald-300">
                    0{i + 1}
                  </span>
                  <h3 className="mt-3 font-medium">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {s.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight">
                Simple pricing
              </h2>
              <p className="mt-3 text-muted-foreground">
                Start free. Upgrade when you grow.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              <PricingCard
                name="Free"
                price="$0"
                period="forever"
                features={[
                  "Up to 5 services",
                  "Up to 3 staff",
                  "Public booking page",
                  "Email confirmations",
                ]}
              />
              <PricingCard
                name="Pro"
                price="$19"
                period="per month"
                highlighted
                features={[
                  "Unlimited services",
                  "Unlimited staff",
                  "Public booking page",
                  "Email confirmations",
                  "Priority support",
                ]}
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20">
          <div className="card relative mx-auto max-w-4xl overflow-hidden p-10 text-center sm:p-14">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-16 left-1/2 size-72 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl"
            />
            <h2 className="relative text-3xl font-semibold tracking-tight text-balance">
              Start taking bookings today
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">
              Set up your booking page in minutes — free, no credit card.
            </p>
            <div className="relative mt-8">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 px-6 text-sm"
                )}
              >
                Create your free account
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

function PricingCard({
  name,
  price,
  period,
  features,
  highlighted,
}: {
  name: string
  price: string
  period: string
  features: string[]
  highlighted?: boolean
}) {
  return (
    <div
      className={cn(
        "card relative flex flex-col overflow-hidden p-6",
        highlighted && "border-emerald-500/40"
      )}
    >
      {highlighted && (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-12 left-1/2 size-40 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl"
        />
      )}
      <div className="relative flex items-center justify-between">
        <h3 className="font-semibold">{name}</h3>
        {highlighted && (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
            Popular
          </span>
        )}
      </div>
      <p className="relative mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tracking-tight">{price}</span>
        <span className="text-sm text-muted-foreground">{period}</span>
      </p>
      <ul className="relative mt-5 space-y-2.5 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check className="size-4 shrink-0 text-emerald-400" />
            {f}
          </li>
        ))}
      </ul>
      <div className="relative mt-auto pt-6">
        <Link
          href="/register"
          className={cn(
            buttonVariants({ variant: highlighted ? "default" : "outline" }),
            "h-10 w-full"
          )}
        >
          Get started
        </Link>
      </div>
    </div>
  )
}
