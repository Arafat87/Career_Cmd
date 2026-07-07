import Link from "next/link";
import ElectricBorder from "@/components/ElectricBorder";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* 404 Display */}
        <div className="relative">
          <div className="text-[120px] font-mono font-bold text-neon-purple/10 select-none leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-1 text-center">
              <div className="text-2xl font-mono font-bold text-neon-purple tracking-[0.3em] animate-pulse">
                SIGNAL LOST
              </div>
              <div className="text-xs font-mono text-muted/50">
                ░░░░░░░░░░░░░░░░░░░░
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <p className="text-sm font-mono text-muted/70 leading-relaxed">
            The requested sector could not be located in the command grid.
          </p>
          <div className="bg-[#0a0a12] border border-[rgba(191,0,255,0.15)] rounded-lg p-4">
            <p className="text-xs font-mono text-muted/50">
              <span className="text-neon-purple/50">ERR_CODE:</span> RESOURCE_NOT_FOUND
            </p>
            <p className="text-xs font-mono text-muted/50 mt-1">
              <span className="text-neon-purple/50">SECTOR:</span> UNKNOWN
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <ElectricBorder color="#BF00FF" speed={1} chaos={0.15} borderRadius={10}>
            <Link
              href="/"
              className="px-6 py-2.5 bg-neon-purple/10 border border-neon-purple/30 rounded-lg font-mono text-sm text-neon-purple hover:bg-neon-purple/20 transition-colors inline-block"
            >
              ◈ RETURN TO BASE
            </Link>
          </ElectricBorder>
        </div>

        {/* Decorative */}
        <div className="h-px bg-gradient-to-r from-transparent via-neon-purple/30 to-transparent" />
        <p className="text-[10px] font-mono text-muted/30 uppercase tracking-widest">
          CAREER CMD // NAVIGATION
        </p>
      </div>
    </div>
  );
}
