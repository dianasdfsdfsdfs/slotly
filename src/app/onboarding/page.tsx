import { type Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { siteConfig } from "@/lib/constants"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

import { OnboardingForm } from "./onboarding-form"

export const metadata: Metadata = {
  title: "Create your business",
}

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const membershipCount = await db.membership.count({
    where: { userId: session.user.id },
  })
  if (membershipCount > 0) redirect("/dashboard")

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]"
      />
      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-mono text-sm tracking-widest text-emerald-300 uppercase"
        >
          <span className="size-2 rounded-full bg-emerald-400" />
          {siteConfig.name}
        </Link>
        <div className="glass rounded-xl p-6">
          <div className="mb-6 space-y-1.5">
            <h1 className="text-xl font-semibold">Create your business</h1>
            <p className="text-sm text-muted-foreground">
              Set up your workspace. You can change these later in settings.
            </p>
          </div>
          <OnboardingForm />
        </div>
      </div>
    </div>
  )
}
