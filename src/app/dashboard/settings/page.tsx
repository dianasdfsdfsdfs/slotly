import { type Metadata } from "next"

import { BookingLink } from "@/components/dashboard/booking-link"
import { SettingsForm } from "@/components/dashboard/settings-form"
import { getOwnerDashboardContext } from "@/server/tenant"

export const metadata: Metadata = { title: "Settings" }

export default async function SettingsPage() {
  const { tenant } = await getOwnerDashboardContext()
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000"

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your business profile and booking rules.
        </p>
      </div>

      <section className="card space-y-4 p-6">
        <div>
          <h2 className="font-medium">Your booking page</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Share this link with clients.
          </p>
        </div>
        <BookingLink url={`${baseUrl}/book/${tenant.slug}`} />
      </section>

      <section className="card p-6">
        <SettingsForm
          defaultValues={{
            name: tenant.name,
            slug: tenant.slug,
            timezone: tenant.timezone,
            slotStepMinutes: tenant.slotStepMinutes,
            bufferMinutes: tenant.bufferMinutes,
          }}
        />
      </section>
    </div>
  )
}
