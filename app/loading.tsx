export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Loading Animation */}
        <div className="flex items-center justify-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1.5 h-8 bg-neon-cyan/40 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 150}ms`, animationDuration: "1s" }}
            />
          ))}
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-sm font-mono text-neon-cyan/70 tracking-wider animate-pulse">
            INITIALIZING...
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-neon-cyan/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan/50 animate-ping" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-neon-cyan/30" />
          </div>
        </div>

        <p className="text-[10px] font-mono text-muted/30 uppercase tracking-widest">
          LOADING DATA STREAM
        </p>
      </div>
    </div>
  );
}
