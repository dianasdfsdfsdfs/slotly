import Link from "next/link"

import { siteConfig } from "@/lib/constants"
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
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/account"
              className="text-muted-foreground hover:text-foreground"
            >
              My bookings
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-muted-foreground hover:text-foreground"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  )
}
