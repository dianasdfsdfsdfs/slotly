import { type Metadata } from "next"

import { ComingSoon } from "@/components/dashboard/coming-soon"

export const metadata: Metadata = { title: "Staff" }

export default function StaffPage() {
  return (
    <ComingSoon
      title="Staff"
      description="Add staff members, working hours and assigned services."
    />
  )
}
