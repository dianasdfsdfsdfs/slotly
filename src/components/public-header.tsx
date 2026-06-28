import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { signOutAction } from "@/server/actions/auth"

export function PublicHeader({ isAuthed }: { isAuthed: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/60 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm font-semibold tracking-widest text-emerald-300 uppercase"
        >
          <span className="size-2 rounded-full bg-emerald-400" />
          {siteConfig.name}
        </Link>
        {isAuthed ? (
          <div className="flex items-center gap-2">
            <Link href="/account" className={cn(buttonVariants(), "h-8 px-3")}>
              My bookings
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-8 px-3"
                )}
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <Link href="/login" className={cn(buttonVariants(), "h-8 px-3")}>
            Sign in
          </Link>
        )}
      </div>
    </header>
  )
}
