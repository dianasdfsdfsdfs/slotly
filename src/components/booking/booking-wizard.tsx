"use client"

import { ArrowLeft, Check, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { formatDuration, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  createBooking,
  fetchAvailableSlots,
  type SlotOption,
} from "@/server/actions/booking"

type StaffLite = { id: string; displayName: string }
type ServiceLite = {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  priceCents: number
  color: string
  staff: StaffLite[]
}
type DateOption = {
  iso: string
  weekday: string
  day: string
  month: string
}

const STEPS = ["Service", "Staff", "Time", "Confirm"] as const

export function BookingWizard({
  tenant,
  services,
  dates,
  isAuthed,
}: {
  tenant: { id: string; slug: string; timezone: string }
  services: ServiceLite[]
  dates: DateOption[]
  isAuthed: boolean
}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [service, setService] = useState<ServiceLite | null>(null)
  const [staffId, setStaffId] = useState<string | null>(null)
  const [dateISO, setDateISO] = useState(dates[0]?.iso ?? "")
  const [slot, setSlot] = useState<SlotOption | null>(null)
  const [slots, setSlots] = useState<SlotOption[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isPending, startTransition] = useTransition()

  const reqId = useRef(0)
  const loadSlots = (serviceId: string, staff: string, date: string) => {
    const id = ++reqId.current
    setLoadingSlots(true)
    setSlots([])
    fetchAvailableSlots({
      tenantId: tenant.id,
      serviceId,
      staffId: staff,
      dateISO: date,
    })
      .then((res) => {
        if (reqId.current === id) setSlots(res)
      })
      .finally(() => {
        if (reqId.current === id) setLoadingSlots(false)
      })
  }

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: tenant.timezone,
    })

  const selectedDate = dates.find((d) => d.iso === dateISO)
  const staffName = (id: string) =>
    service?.staff.find((s) => s.id === id)?.displayName ?? "Any available"

  const confirm = () => {
    if (!service || !slot) return
    startTransition(async () => {
      const res = await createBooking({
        tenantId: tenant.id,
        serviceId: service.id,
        staffId: slot.staffId,
        startISO: slot.start,
      })
      if (!res.ok) {
        toast.error(res.error)
        if (res.code === "CONFLICT") setStep(3)
        return
      }
      router.push(`/book/${res.slug}/success?booking=${res.bookingId}`)
    })
  }

  return (
    <div className="relative">
      {/* Stepper */}
      <ol className="mb-6 flex items-center justify-center gap-2 text-xs">
        {STEPS.map((label, i) => {
          const n = i + 1
          const active = n === step
          const done = n < step
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border text-[11px] font-medium transition-colors",
                  active
                    ? "border-emerald-500 bg-emerald-500 text-black"
                    : done
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-white/15 text-muted-foreground"
                )}
              >
                {done ? <Check className="size-3.5" /> : n}
              </span>
              <span
                className={cn(
                  "hidden sm:inline",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
              {n < STEPS.length && <span className="text-white/15">—</span>}
            </li>
          )
        })}
      </ol>

      <div className="card p-5 sm:p-6">
        {/* Step 1: Service */}
        {step === 1 && (
          <div className="space-y-3">
            <h2 className="font-medium">Choose a service</h2>
            <div className="space-y-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setService(s)
                    setStaffId(null)
                    setSlot(null)
                    setStep(2)
                  }}
                  className="group flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3.5 text-left transition-all hover:-translate-y-px hover:border-emerald-500/40 hover:bg-emerald-500/[0.06]"
                >
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{s.name}</p>
                    {s.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {s.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{formatDuration(s.durationMinutes)}</p>
                    <p className="font-medium text-foreground">
                      {formatPrice(s.priceCents)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Staff */}
        {step === 2 && service && (
          <div className="space-y-3">
            <BackButton onClick={() => setStep(1)} />
            <h2 className="font-medium">Choose a team member</h2>
            <div className="space-y-2">
              <StaffRow
                label="Any available"
                hint="First free slot"
                icon
                onClick={() => {
                  const d = dates[0]?.iso ?? ""
                  setStaffId("any")
                  setSlot(null)
                  setDateISO(d)
                  setStep(3)
                  loadSlots(service.id, "any", d)
                }}
              />
              {service.staff.map((m) => (
                <StaffRow
                  key={m.id}
                  label={m.displayName}
                  onClick={() => {
                    const d = dates[0]?.iso ?? ""
                    setStaffId(m.id)
                    setSlot(null)
                    setDateISO(d)
                    setStep(3)
                    loadSlots(service.id, m.id, d)
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Time */}
        {step === 3 && service && (
          <div className="space-y-4">
            <BackButton onClick={() => setStep(2)} />
            <h2 className="font-medium">Pick a time</h2>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {dates.map((d) => {
                const active = d.iso === dateISO
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => {
                      setDateISO(d.iso)
                      setSlot(null)
                      if (staffId) loadSlots(service.id, staffId, d.iso)
                    }}
                    className={cn(
                      "flex w-14 shrink-0 flex-col items-center rounded-lg border py-2 text-center transition-colors",
                      active
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                        : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                    )}
                  >
                    <span className="text-[10px] uppercase">{d.weekday}</span>
                    <span className="text-lg font-semibold text-foreground">
                      {d.day}
                    </span>
                    <span className="text-[10px]">{d.month}</span>
                  </button>
                )
              })}
            </div>

            {loadingSlots ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading times…
              </div>
            ) : slots.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No available times on this day. Try another date.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((s) => (
                  <button
                    key={s.start}
                    type="button"
                    onClick={() => {
                      setSlot(s)
                      setStep(4)
                    }}
                    className="rounded-lg border border-white/10 bg-white/[0.03] py-2 font-mono text-sm transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300"
                  >
                    {fmtTime(s.start)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && service && slot && (
          <div className="space-y-4">
            <BackButton onClick={() => setStep(3)} />
            <h2 className="font-medium">Confirm your booking</h2>

            <dl className="divide-y divide-white/10 rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm">
              <Row label="Service" value={service.name} />
              <Row label="With" value={staffName(slot.staffId)} />
              <Row
                label="When"
                value={`${selectedDate?.weekday}, ${selectedDate?.month} ${selectedDate?.day} · ${fmtTime(slot.start)}`}
              />
              <Row
                label="Duration"
                value={formatDuration(service.durationMinutes)}
              />
              <Row label="Price" value={formatPrice(service.priceCents)} />
            </dl>

            {isAuthed ? (
              <Button
                onClick={confirm}
                disabled={isPending}
                className="h-11 w-full"
              >
                {isPending ? "Booking…" : "Confirm booking"}
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-center text-sm text-muted-foreground">
                  Sign in to confirm your appointment.
                </p>
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(`/book/${tenant.slug}`)}`}
                  className="block"
                >
                  <Button className="h-11 w-full">Sign in to book</Button>
                </Link>
                <Link
                  href={`/register?callbackUrl=${encodeURIComponent(`/book/${tenant.slug}`)}`}
                  className="block text-center text-xs text-muted-foreground hover:text-foreground"
                >
                  New here? Create an account
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-ml-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" /> Back
    </button>
  )
}

function StaffRow({
  label,
  hint,
  icon,
  onClick,
}: {
  label: string
  hint?: string
  icon?: boolean
  onClick: () => void
}) {
  const initials = label.trim().slice(0, 2).toUpperCase()
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-left transition-all hover:-translate-y-px hover:border-emerald-500/40 hover:bg-emerald-500/[0.06]"
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-emerald-500/15 text-xs text-emerald-300">
        {icon ? <Sparkles className="size-4" /> : initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </button>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
