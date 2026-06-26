import Link from "next/link"

import { siteConfig } from "@/lib/constants"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]"
      />
      <div className="relative z-10 w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-mono text-sm tracking-widest text-emerald-300 uppercase"
        >
          <span className="size-2 rounded-full bg-emerald-400" />
          {siteConfig.name}
        </Link>
        {children}
      </div>
    </div>
  )
}
