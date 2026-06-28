import "dotenv/config"

import Stripe from "stripe"

const key = process.env.STRIPE_SECRET_KEY
if (!key) {
  console.error("Set STRIPE_SECRET_KEY in .env first, then re-run.")
  process.exit(1)
}

const stripe = new Stripe(key)

async function main() {
  const product = await stripe.products.create({
    name: "Slotly Pro",
    description: "Unlimited services and staff.",
  })
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 1900,
    currency: "usd",
    recurring: { interval: "month" },
  })

  console.log("\n✓ Created Slotly Pro product + price.\n")
  console.log("Add this line to your .env:\n")
  console.log(`STRIPE_PRO_PRICE_ID=${price.id}\n`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
