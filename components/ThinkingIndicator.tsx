export default function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 py-4">
      <div className="flex gap-1">
        <span
          className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse-glow"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse-glow"
          style={{ animationDelay: "200ms" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse-glow"
          style={{ animationDelay: "400ms" }}
        />
      </div>
      <span className="text-sm font-mono text-muted">PROCESSING...</span>
    </div>
  );
}
