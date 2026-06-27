import { type Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { notFound } from "next/navigation"

import { StaffForm } from "@/components/dashboard/staff/staff-form"
import { StaffServices } from "@/components/dashboard/staff/staff-services"
import { WorkingHoursEditor } from "@/components/dashboard/staff/working-hours-editor"
import { db } from "@/server/db"
import { getOwnerDashboardContext } from "@/server/tenant"

export const metadata: Metadata = { title: "Edit staff" }

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { tenant } = await getOwnerDashboardContext()
  const { id } = await params

  const staff = await db.staff.findFirst({
    where: { id, tenantId: tenant.id },
    include: {
      services: { select: { serviceId: true } },
      workingHours: true,
    },
  })
  if (!staff) notFound()

  const services = await db.service.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/dashboard/staff"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Back to staff
      </Link>

      <h1 className="text-2xl font-semibold">{staff.displayName}</h1>

      <section className="glass space-y-4 rounded-xl p-6">
        <h2 className="font-medium">Profile</h2>
        <StaffForm
          mode="edit"
          staffId={staff.id}
          defaultValues={{
            displayName: staff.displayName,
            bio: staff.bio ?? "",
            active: staff.active,
          }}
        />
      </section>

      <section className="glass space-y-4 rounded-xl p-6">
        <h2 className="font-medium">Services offered</h2>
        <StaffServices
          staffId={staff.id}
          services={services}
          initialSelected={staff.services.map((s) => s.serviceId)}
        />
      </section>

      <section className="glass space-y-4 rounded-xl p-6">
        <div>
          <h2 className="font-medium">Working hours</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Weekly availability in {tenant.timezone}.
          </p>
        </div>
        <WorkingHoursEditor
          staffId={staff.id}
          initial={staff.workingHours.map((wh) => ({
            weekday: wh.weekday,
            startMinutes: wh.startMinutes,
            endMinutes: wh.endMinutes,
          }))}
        />
      </section>
    </div>
  )
}
