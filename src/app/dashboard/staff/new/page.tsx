import { type Metadata } from "next"

import { StaffForm } from "@/components/dashboard/staff/staff-form"
import { getOwnerDashboardContext } from "@/server/tenant"

export const metadata: Metadata = { title: "New staff" }

export default async function NewStaffPage() {
  await getOwnerDashboardContext()

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">New staff member</h1>
      <div className="glass rounded-xl p-6">
        <StaffForm mode="create" />
      </div>
    </div>
  )
}
