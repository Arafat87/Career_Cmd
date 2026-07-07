export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-[rgba(0,245,255,0.05)] rounded-lg" />
        <div className="h-8 w-32 bg-[rgba(0,245,255,0.05)] rounded-lg" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-[rgba(0,245,255,0.03)] border border-[rgba(0,245,255,0.06)] rounded-lg" />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-80 bg-[rgba(0,245,255,0.03)] border border-[rgba(0,245,255,0.06)] rounded-lg flex items-center justify-center">
        <p className="text-xs font-mono text-muted/30">LOADING ANALYTICS...</p>
      </div>

      {/* Table skeleton */}
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-[rgba(0,245,255,0.03)] border border-[rgba(0,245,255,0.06)] rounded-lg" />
        ))}
      </div>
    </div>
  );
}
