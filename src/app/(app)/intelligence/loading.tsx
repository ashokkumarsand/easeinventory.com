export default function IntelligenceLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-foreground/[0.06] skeleton-shimmer" />
        <div className="space-y-2">
          <div className="w-48 h-6 rounded-md bg-foreground/[0.06] skeleton-shimmer" />
          <div className="w-64 h-4 rounded-md bg-foreground/[0.06] skeleton-shimmer" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-24 h-9 rounded-md bg-foreground/[0.06] skeleton-shimmer" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="border rounded-xl overflow-hidden">
        <div className="h-14 bg-foreground/[0.02] border-b" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 border-b flex items-center px-4 gap-4">
            <div className="w-40 h-4 rounded bg-foreground/[0.06] skeleton-shimmer" />
            <div className="w-20 h-4 rounded bg-foreground/[0.06] skeleton-shimmer" />
            <div className="w-16 h-4 rounded bg-foreground/[0.06] skeleton-shimmer" />
            <div className="w-24 h-4 rounded bg-foreground/[0.06] skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
