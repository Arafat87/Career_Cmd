"use client";

import { useEffect } from "react";
import ElectricBorder from "@/components/ElectricBorder";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Error Icon */}
        <div className="relative">
          <div className="text-8xl font-mono font-bold text-neon-red/20 select-none">ERR</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl animate-pulse">⚠</span>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h1 className="text-xl font-mono font-bold text-neon-red tracking-wider">
            SYSTEM MALFUNCTION
          </h1>
          <p className="text-sm font-mono text-muted/70 leading-relaxed">
            An unexpected error has occurred. The incident has been logged.
          </p>
          <div className="bg-[#0a0a12] border border-neon-red/20 rounded-lg p-4 text-left">
            <p className="text-xs font-mono text-neon-red/70 break-all">
              {error.message || "Unknown error"}
            </p>
            {error.digest && (
              <p className="text-[10px] font-mono text-muted/40 mt-2">
                ID: {error.digest}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <ElectricBorder color="#FF2D55" speed={1} chaos={0.15} borderRadius={10}>
            <button
              onClick={reset}
              className="px-6 py-2.5 bg-neon-red/10 border border-neon-red/30 rounded-lg font-mono text-sm text-neon-red hover:bg-neon-red/20 transition-colors"
            >
              ↻ RETRY
            </button>
          </ElectricBorder>
          <a
            href="/"
            className="px-6 py-2.5 border border-[rgba(0,245,255,0.15)] rounded-lg font-mono text-sm text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.3)] transition-colors"
          >
            ◈ DASHBOARD
          </a>
        </div>

        {/* Decorative scanline */}
        <div className="h-px bg-gradient-to-r from-transparent via-neon-red/30 to-transparent" />
        <p className="text-[10px] font-mono text-muted/30 uppercase tracking-widest">
          CAREER CMD // ERROR HANDLER
        </p>
      </div>
    </div>
  );
}
