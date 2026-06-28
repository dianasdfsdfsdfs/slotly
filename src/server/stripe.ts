import "server-only"

import Stripe from "stripe"

const key = process.env.STRIPE_SECRET_KEY

export const stripe = key ? new Stripe(key) : null
export const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID
export const APP_URL = process.env.AUTH_URL ?? "http://localhost:3000"
