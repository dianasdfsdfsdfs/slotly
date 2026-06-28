import "server-only"

import { db } from "@/server/db"
import { stripe } from "@/server/stripe"

/**
 * Pulls the tenant's latest subscription from Stripe and mirrors it onto the
 * Tenant row (plan + status + period). Used by the webhook and on return from
 * Checkout. Safe no-op if Stripe isn't configured.
 */
export async function syncTenantFromStripe(
  tenantId: string,
  customerId: string
) {
  if (!stripe) return

  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 1,
  })
  const sub = subs.data[0]

  if (!sub) {
    await db.tenant.update({
      where: { id: tenantId },
      data: {
        plan: "FREE",
        subscriptionStatus: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        currentPeriodEnd: null,
      },
    })
    return
  }

  const isActive = sub.status === "active" || sub.status === "trialing"
  const item = sub.items.data[0]
  const periodEndUnix =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    (item as unknown as { current_period_end?: number } | undefined)
      ?.current_period_end ??
    null

  await db.tenant.update({
    where: { id: tenantId },
    data: {
      plan: isActive ? "PRO" : "FREE",
      stripeSubscriptionId: sub.id,
      stripePriceId: item?.price.id ?? null,
      subscriptionStatus: sub.status,
      currentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : null,
    },
  })
}
