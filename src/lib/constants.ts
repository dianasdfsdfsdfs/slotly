export const siteConfig = {
  name: "Slotly",
  tagline: "Booking, simplified",
  description:
    "Online booking your clients actually finish. Scheduling for salons, studios, clinics and independent pros.",
  url: "https://slotly.app",
} as const

export type SiteConfig = typeof siteConfig
