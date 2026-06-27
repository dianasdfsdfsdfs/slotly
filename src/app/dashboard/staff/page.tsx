import { type Metadata } from "next"
import Link from "next/link"
import { Plus, Users } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { db } from "@/server/db"
import { getOwnerDashboardContext } from "@/server/tenant"

export const metadata: Metadata = { title: "Staff" }

function initialsOf(name: string) {
  return name.trim().slice(0, 2).toUpperCase()
}

export default async function StaffPage() {
  const { tenant } = await getOwnerDashboardContext()
  const staff = await db.staff.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { services: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Staff</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The people who take bookings.
          </p>
        </div>
        <Link
          href="/dashboard/staff/new"
          className={cn(buttonVariants(), "h-9 gap-1.5")}
        >
          <Plus className="size-4" /> New staff
        </Link>
      </div>

      {staff.length === 0 ? (
        <div className="card flex min-h-60 flex-col items-center justify-center p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
            <Users className="size-5" />
          </span>
          <p className="mt-4 text-sm text-muted-foreground">No staff yet.</p>
          <Link
            href="/dashboard/staff/new"
            className={cn(buttonVariants({ variant: "outline" }), "mt-4 h-9")}
          >
            Add your first staff member
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <Link
              key={member.id}
              href={`/dashboard/staff/${member.id}`}
              className="group card card-interactive flex items-center gap-3 p-4"
            >
              <Avatar className="size-10">
                <AvatarFallback className="bg-emerald-500/15 text-sm text-emerald-300">
                  {initialsOf(member.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">
                    {member.displayName}
                  </span>
                  {!member.active && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {member._count.services}{" "}
                  {member._count.services === 1 ? "service" : "services"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
