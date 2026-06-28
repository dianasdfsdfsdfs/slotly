import "server-only"

import { Resend } from "resend"

import { BookingCancellationEmail } from "@/emails/booking-cancellation"
import { BookingConfirmationEmail } from "@/emails/booking-confirmation"

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM = process.env.EMAIL_FROM ?? "Slotly <onboarding@resend.dev>"

// Emails are best-effort: never let a failure break the booking flow.

export async function sendBookingConfirmation(params: {
  to: string
  customerName: string
  businessName: string
  serviceName: string
  staffName: string
  whenText: string
  priceText: string
}) {
  if (!resend || !params.to) return
  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `Booking confirmed — ${params.businessName}`,
      react: <BookingConfirmationEmail {...params} />,
    })
  } catch (error) {
    console.error("Failed to send confirmation email:", error)
  }
}

export async function sendBookingCancellation(params: {
  to: string
  customerName: string
  businessName: string
  serviceName: string
  whenText: string
}) {
  if (!resend || !params.to) return
  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `Booking cancelled — ${params.businessName}`,
      react: <BookingCancellationEmail {...params} />,
    })
  } catch (error) {
    console.error("Failed to send cancellation email:", error)
  }
}
