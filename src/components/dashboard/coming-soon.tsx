export function ComingSoon({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="glass flex min-h-60 flex-col items-center justify-center rounded-xl p-10 text-center">
        <p className="text-sm text-muted-foreground">
          {description ?? "This section is coming in a later phase."}
        </p>
      </div>
    </div>
  )
}
