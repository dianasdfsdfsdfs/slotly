import { LayoutDashboard, LogOut } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { siteConfig } from "@/lib/constants"
import { signOutAction } from "@/server/actions/auth"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const memberships = await db.membership.count({
    where: { userId: session.user.id },
  })

  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/60 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
          <Link
            href="/account"
            className="flex items-center gap-2 font-mono text-sm font-semibold tracking-widest text-emerald-300 uppercase"
          >
            <span className="size-2 rounded-full bg-emerald-400" />
            {siteConfig.name}
          </Link>
          <div className="flex items-center gap-4">
            {memberships > 0 && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <LayoutDashboard className="size-4" /> Dashboard
              </Link>
            )}
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  )
}
