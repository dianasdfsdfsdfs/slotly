import { siteConfig } from "@/lib/constants"

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-muted-foreground sm:flex-row">
        <span className="font-mono text-xs tracking-widest text-emerald-300/80 uppercase">
          {siteConfig.name}
        </span>
        <span>
          © {new Date().getFullYear()} {siteConfig.name}. Booking, simplified.
        </span>
      </div>
    </footer>
  )
}
