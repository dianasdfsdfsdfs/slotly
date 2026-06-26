import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/lib/constants"
import { cn } from "@/lib/utils"

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24">
      {/* emerald glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/4 bottom-0 h-[300px] w-[300px] rounded-full bg-teal-400/10 blur-[100px]"
      />

      <div className="relative z-10 flex max-w-3xl flex-col items-center text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-xs tracking-widest text-emerald-300 uppercase backdrop-blur">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          {siteConfig.tagline}
        </span>

        <h1 className="text-5xl font-semibold tracking-tight text-balance sm:text-6xl md:text-7xl">
          <span className="text-gradient">Online booking</span>
          <br />
          your clients actually finish
        </h1>

        <p className="mt-6 max-w-xl text-lg text-balance text-muted-foreground">
          {siteConfig.description}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "lg" }), "h-11 px-6 text-sm")}
          >
            Start free →
          </Link>
          <Link
            href="#demo"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 px-6 text-sm"
            )}
          >
            See how it works
          </Link>
        </div>

        <p className="mt-6 font-mono text-xs text-muted-foreground/70">
          No credit card · Free plan forever
        </p>
      </div>
    </main>
  )
}
