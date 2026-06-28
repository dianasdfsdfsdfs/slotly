"use server"

import { redirect } from "next/navigation"

import { db } from "@/server/db"
import { APP_URL, STRIPE_PRO_PRICE_ID, stripe } from "@/server/stripe"
import { getOwnerContext } from "@/server/tenant"

type ActionError = { error: string }

export async function startCheckout(): Promise<ActionError | void> {
  const ctx = await getOwnerContext()
  if (!ctx) return { error: "You are not authorized." }
  if (!stripe || !STRIPE_PRO_PRICE_ID) {
    return { error: "Billing isn't configured yet." }
  }

  let customerId = ctx.tenant.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: ctx.tenant.name,
      metadata: { tenantId: ctx.tenant.id },
    })
    customerId = customer.id
    await db.tenant.update({
      where: { id: ctx.tenant.id },
      data: { stripeCustomerId: customerId },
    })
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: STRIPE_PRO_PRICE_ID, quantity: 1 }],
    success_url: `${APP_URL}/dashboard/billing?success=1`,
    cancel_url: `${APP_URL}/dashboard/billing?canceled=1`,
    client_reference_id: ctx.tenant.id,
    subscription_data: { metadata: { tenantId: ctx.tenant.id } },
    allow_promotion_codes: true,
  })

  if (!session.url) return { error: "Could not start checkout." }
  redirect(session.url)
}

export async function openBillingPortal(): Promise<ActionError | void> {
  const ctx = await getOwnerContext()
  if (!ctx) return { error: "You are not authorized." }
  if (!stripe) return { error: "Billing isn't configured yet." }
  if (!ctx.tenant.stripeCustomerId) {
    return { error: "No subscription to manage yet." }
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: ctx.tenant.stripeCustomerId,
    return_url: `${APP_URL}/dashboard/billing`,
  })
  redirect(session.url)
}
