import { type Metadata } from "next"

import { ComingSoon } from "@/components/dashboard/coming-soon"

export const metadata: Metadata = { title: "Services" }

export default function ServicesPage() {
  return (
    <ComingSoon
      title="Services"
      description="Create and manage the services you offer."
    />
  )
}
