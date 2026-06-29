import { Check } from "lucide-react"
import { type Metadata } from "next"

import {
  ManageButton,
  UpgradeButton,
} from "@/components/dashboard/billing-actions"
import { buttonVariants } from "@/components/ui/button"
import { PLAN_LIMITS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { syncTenantFromStripe } from "@/server/billing"
import { db } from "@/server/db"
import { getOwnerDashboardContext } from "@/server/tenant"

export const metadata: Metadata = { title: "Billing" }

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>
}) {
  const { tenant } = await getOwnerDashboardContext()
  const sp = await searchParams

  if (sp.success && tenant.stripeCustomerId) {
    await syncTenantFromStripe(tenant.id, tenant.stripeCustomerId)
  }

  const fresh =
    (await db.tenant.findUnique({ where: { id: tenant.id } })) ?? tenant
  const isPro = fresh.plan === "PRO"

  const [services, staff] = await Promise.all([
    db.service.count({ where: { tenantId: tenant.id } }),
    db.staff.count({ where: { tenantId: tenant.id } }),
  ])
  const limits = PLAN_LIMITS[fresh.plan]

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <p className="font-mono text-xs tracking-widest text-emerald-300/80 uppercase">
          Billing
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">
          Subscription
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your plan and usage.
        </p>
      </div>

      {/* Current plan + usage */}
      <div className="card relative overflow-hidden p-6">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              {isPro ? (
                <span className="bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
                  Pro
                </span>
              ) : (
                "Free"
              )}
            </p>
            {fresh.subscriptionStatus &&
              fresh.subscriptionStatus !== "active" && (
                <p className="mt-1 text-xs text-muted-foreground capitalize">
                  Status: {fresh.subscriptionStatus}
                </p>
              )}
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            {isPro ? "PRO" : "FREE"}
          </span>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
          <Usage label="Services" used={services} limit={limits.services} />
          <Usage label="Staff" used={staff} limit={limits.staff} />
        </div>
      </div>

      {/* Plans */}
      <div className="grid gap-4 sm:grid-cols-2">
        <PlanCard
          name="Free"
          price="$0"
          period="forever"
          current={!isPro}
          features={[
            "Up to 5 services",
            "Up to 3 staff",
            "Public booking page",
            "Email confirmations",
          ]}
          cta={
            isPro ? (
              <p className="text-center text-xs text-muted-foreground">
                Downgrade anytime via Manage billing.
              </p>
            ) : (
              <span
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "pointer-events-none h-10 w-full opacity-60"
                )}
              >
                Current plan
              </span>
            )
          }
        />
        <PlanCard
          name="Pro"
          price="$19"
          period="per month"
          highlighted
          current={isPro}
          features={[
            "Unlimited services",
            "Unlimited staff",
            "Public booking page",
            "Email confirmations",
            "Priority support",
          ]}
          cta={isPro ? <ManageButton /> : <UpgradeButton />}
        />
      </div>
    </div>
  )
}

function Usage({
  label,
  used,
  limit,
}: {
  label: string
  used: number
  limit: number
}) {
  const unlimited = limit === Infinity
  const pct = unlimited ? 100 : Math.min(100, Math.round((used / limit) * 100))
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {used} <span className="text-muted-foreground">/ </span>
          {unlimited ? "∞" : limit}
        </span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full rounded-full",
            unlimited ? "bg-emerald-500/40" : "bg-emerald-500"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function PlanCard({
  name,
  price,
  period,
  features,
  highlighted,
  current,
  cta,
}: {
  name: string
  price: string
  period: string
  features: string[]
  highlighted?: boolean
  current?: boolean
  cta: React.ReactNode
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
        {current ? (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
            Current
          </span>
        ) : (
          highlighted && (
            <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-xs text-muted-foreground">
              Popular
            </span>
          )
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
      <div className="relative mt-auto pt-6">{cta}</div>
    </div>
  )
}
