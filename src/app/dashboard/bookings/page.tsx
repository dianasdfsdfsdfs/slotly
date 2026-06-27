import { type Metadata } from "next"

import { ComingSoon } from "@/components/dashboard/coming-soon"

export const metadata: Metadata = { title: "Bookings" }

export default function BookingsPage() {
  return (
    <ComingSoon
      title="Bookings"
      description="A filterable list of all bookings will live here."
    />
  )
}
