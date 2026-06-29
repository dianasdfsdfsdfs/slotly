"use client"

import { Check, Copy, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function BookingLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable; ignore
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
        {url}
      </code>
      <Button
        type="button"
        variant="outline"
        onClick={copy}
        className="h-9 shrink-0"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: "outline" }), "h-9 shrink-0")}
      >
        <ExternalLink className="size-4" />
        Open
      </Link>
    </div>
  )
}
