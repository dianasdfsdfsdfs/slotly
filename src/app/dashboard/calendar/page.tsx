import { type Metadata } from "next"

import { ComingSoon } from "@/components/dashboard/coming-soon"

export const metadata: Metadata = { title: "Calendar" }

export default function CalendarPage() {
  return (
    <ComingSoon
      title="Calendar"
      description="Your weekly booking calendar will live here."
    />
  )
}
