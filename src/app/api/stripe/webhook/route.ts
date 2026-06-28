import { syncTenantFromStripe } from "@/server/billing"
import { db } from "@/server/db"
import { stripe } from "@/server/stripe"

const RELEVANT = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
])

export async function POST(req: Request) {
  if (!stripe) return new Response("Billing not configured", { status: 500 })

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = req.headers.get("stripe-signature")
  if (!secret || !signature) {
    return new Response("Missing signature", { status: 400 })
  }

  const body = await req.text()
  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch {
    return new Response("Invalid signature", { status: 400 })
  }

  if (RELEVANT.has(event.type)) {
    const obj = event.data.object as { customer?: string | { id: string } }
    const customerId =
      typeof obj.customer === "string" ? obj.customer : obj.customer?.id
    if (customerId) {
      const tenant = await db.tenant.findUnique({
        where: { stripeCustomerId: customerId },
        select: { id: true },
      })
      if (tenant) await syncTenantFromStripe(tenant.id, customerId)
    }
  }

  return new Response("ok")
}
