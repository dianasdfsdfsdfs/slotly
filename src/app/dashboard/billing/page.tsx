import { type Metadata } from "next"

import { ComingSoon } from "@/components/dashboard/coming-soon"

export const metadata: Metadata = { title: "Billing" }

export default function BillingPage() {
  return (
    <ComingSoon
      title="Billing"
      description="Manage your Slotly subscription and plan."
    />
  )
}
