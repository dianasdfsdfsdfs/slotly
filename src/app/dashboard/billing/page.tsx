import { Check } from "lucide-react"
import { type Metadata } from "next"

import { BillingActions } from "@/components/dashboard/billing-actions"
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

  // Returning from Checkout: pull the latest subscription right away.
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
  const fmtLimit = (n: number) => (n === Infinity ? "Unlimited" : String(n))

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your Slotly subscription.
        </p>
      </div>

      <div className="card space-y-5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="text-xl font-semibold">
              {isPro ? "Pro" : "Free"}
              {fresh.subscriptionStatus &&
                fresh.subscriptionStatus !== "active" && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({fresh.subscriptionStatus})
                  </span>
                )}
            </p>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            {isPro ? "PRO" : "FREE"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <UsageRow
            label="Services"
            used={services}
            limit={fmtLimit(limits.services)}
          />
          <UsageRow label="Staff" used={staff} limit={fmtLimit(limits.staff)} />
        </div>

        <BillingActions isPro={isPro} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PlanCard
          name="Free"
          price="$0"
          current={!isPro}
          features={[
            "Up to 5 services",
            "Up to 3 staff",
            "Public booking page",
            "Email confirmations",
          ]}
        />
        <PlanCard
          name="Pro"
          price="$19/mo"
          highlighted
          current={isPro}
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
  )
}

function UsageRow({
  label,
  used,
  limit,
}: {
  label: string
  used: number
  limit: string
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">
        {used} <span className="text-muted-foreground">/ {limit}</span>
      </p>
    </div>
  )
}

function PlanCard({
  name,
  price,
  features,
  highlighted,
  current,
}: {
  name: string
  price: string
  features: string[]
  highlighted?: boolean
  current?: boolean
}) {
  return (
    <div className={cn("card p-6", highlighted && "border-emerald-500/40")}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{name}</h3>
        {current && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
            Current
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold">{price}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check className="size-4 shrink-0 text-emerald-400" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}
