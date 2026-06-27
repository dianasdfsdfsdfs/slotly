import { ChevronLeft } from "lucide-react"
import { type Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { ProfileForm } from "@/components/account/profile-form"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export const metadata: Metadata = { title: "Settings" }

export default async function AccountSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true },
  })
  if (!user) redirect("/login")

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link
        href="/account"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Back
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <div className="card p-6">
        <ProfileForm
          email={user.email}
          defaultValues={{ name: user.name ?? "", phone: user.phone ?? "" }}
        />
      </div>
    </div>
  )
}
