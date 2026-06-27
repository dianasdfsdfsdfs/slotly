export const siteConfig = {
  name: "Slotly",
  tagline: "Booking, simplified",
  description:
    "Online booking your clients actually finish. Scheduling for salons, studios, clinics and independent pros.",
  url: "https://slotly.app",
} as const

export type SiteConfig = typeof siteConfig

export const ACTIVE_TENANT_COOKIE = "slotly_active_tenant"

// Free plan caps; Pro is unlimited.
export const PLAN_LIMITS: Record<
  "FREE" | "PRO",
  { services: number; staff: number }
> = {
  FREE: { services: 5, staff: 3 },
  PRO: { services: Infinity, staff: Infinity },
}
