import { type Metadata } from "next"
import { notFound } from "next/navigation"

import { ServiceForm } from "@/components/dashboard/services/service-form"
import { db } from "@/server/db"
import { getOwnerDashboardContext } from "@/server/tenant"

export const metadata: Metadata = { title: "Edit service" }

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { tenant } = await getOwnerDashboardContext()
  const { id } = await params

  const service = await db.service.findFirst({
    where: { id, tenantId: tenant.id },
  })
  if (!service) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit service</h1>
      <ServiceForm
        mode="edit"
        serviceId={service.id}
        defaultValues={{
          name: service.name,
          description: service.description ?? "",
          durationMinutes: service.durationMinutes,
          price: service.priceCents / 100,
          color: service.color,
          active: service.active,
        }}
      />
    </div>
  )
}
