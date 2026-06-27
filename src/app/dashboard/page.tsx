import { type Metadata } from "next"

import { db } from "@/server/db"
import { getDashboardContext } from "@/server/tenant"

export const metadata: Metadata = {
  title: "Overview",
}

export default async function DashboardOverviewPage() {
  const { tenant, user } = await getDashboardContext()

  const [services, staff, bookings] = await Promise.all([
    db.service.count({ where: { tenantId: tenant.id } }),
    db.staff.count({ where: { tenantId: tenant.id } }),
    db.booking.count({ where: { tenantId: tenant.id } }),
  ])

  const stats = [
    { label: "Services", value: services },
    { label: "Staff", value: staff },
    { label: "Bookings", value: bookings },
  ]

  const firstName = user.name?.split(" ")[0]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening at {tenant.name}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="font-medium">Next steps</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• Add your services with duration and price</li>
          <li>• Add staff members and their working hours</li>
          <li>• Share your public booking page</li>
        </ul>
      </div>
    </div>
  )
}
