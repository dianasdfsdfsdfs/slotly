import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { getDashboardContext } from "@/server/tenant"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, role, tenant, memberships } = await getDashboardContext()

  return (
    <div className="flex flex-1">
      <DashboardSidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          user={{ name: user.name, email: user.email }}
          role={role}
          tenantId={tenant.id}
          tenantName={tenant.name}
          tenants={memberships.map((m) => ({
            id: m.tenant.id,
            name: m.tenant.name,
          }))}
        />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
