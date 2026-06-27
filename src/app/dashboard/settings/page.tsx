import { type Metadata } from "next"

import { ComingSoon } from "@/components/dashboard/coming-soon"

export const metadata: Metadata = { title: "Settings" }

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Business profile, booking rules and public page settings."
    />
  )
}
