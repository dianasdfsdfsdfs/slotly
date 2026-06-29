import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function SiteHeader({ isAuthed }: { isAuthed: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm font-semibold tracking-widest text-emerald-300 uppercase"
        >
          <span className="size-2 rounded-full bg-emerald-400" />
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a
            href="#features"
            className="transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a href="#how" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a
            href="#pricing"
            className="transition-colors hover:text-foreground"
          >
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthed ? (
            <Link
              href="/account"
              className={cn(buttonVariants({ variant: "outline" }), "h-8 px-3")}
            >
              Open app
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost" }), "h-8 px-3")}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants(), "h-8 px-3")}
              >
                Start free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
