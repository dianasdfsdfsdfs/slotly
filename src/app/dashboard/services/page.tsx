import { type Metadata } from "next"
import Link from "next/link"
import { Plus, Scissors } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { formatDuration, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { db } from "@/server/db"
import { getOwnerDashboardContext } from "@/server/tenant"

export const metadata: Metadata = { title: "Services" }

export default async function ServicesPage() {
  const { tenant } = await getOwnerDashboardContext()
  const services = await db.service.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The services clients can book.
          </p>
        </div>
        <Link
          href="/dashboard/services/new"
          className={cn(buttonVariants(), "h-9 gap-1.5")}
        >
          <Plus className="size-4" /> New service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="card flex min-h-60 flex-col items-center justify-center p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
            <Scissors className="size-5" />
          </span>
          <p className="mt-4 text-sm text-muted-foreground">No services yet.</p>
          <Link
            href="/dashboard/services/new"
            className={cn(buttonVariants({ variant: "outline" }), "mt-4 h-9")}
          >
            Add your first service
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/dashboard/services/${service.id}`}
              className="group card card-interactive block p-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: service.color }}
                />
                <span className="truncate font-medium">{service.name}</span>
                {!service.active && (
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    Inactive
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDuration(service.durationMinutes)}</span>
                <span>·</span>
                <span>{formatPrice(service.priceCents)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
