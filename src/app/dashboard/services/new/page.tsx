import { type Metadata } from "next"

import { ServiceForm } from "@/components/dashboard/services/service-form"
import { getOwnerDashboardContext } from "@/server/tenant"

export const metadata: Metadata = { title: "New service" }

export default async function NewServicePage() {
  await getOwnerDashboardContext()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New service</h1>
      <ServiceForm mode="create" />
    </div>
  )
}
