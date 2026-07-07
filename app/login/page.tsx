"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import ElectricBorder from "@/components/ElectricBorder";

const PROVIDERS = [
  { id: "google", name: "Google", icon: "🔍", color: "#4285F4", desc: "Sign in with your Google account" },
  { id: "github", name: "GitHub", icon: "🐙", color: "#8B5CF6", desc: "Perfect for engineers and DevOps" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", color: "#0A66C2", desc: "Connect your professional profile" },
];

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSignIn(provider: string) {
    setLoading(provider);
    await signIn(provider, { callbackUrl: "/" });
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050508] overflow-hidden z-50">
      {/* Background grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Glow orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,245,255,0.08) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-md px-6 text-center">
        {/* ASCII Logo */}
        <div className="text-center mb-8">
          <pre className="text-neon-cyan/60 text-[7px] leading-tight font-mono inline-block">
{` ██████╗ █████╗ ██████╗ ███████╗███████╗██████╗      ██████╗███╗   ███╗██████╗
██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗    ██╔════╝████╗ ████║██╔══██╗
██║     ███████║██████╔╝█████╗  █████╗  ██████╔╝    ██║     ██╔████╔██║██║  ██║
██║     ██╔══██║██╔══██╗██╔══╝  ██╔══╝  ██╔══██╗    ██║     ██║╚██╔╝██║██║  ██║
╚██████╗██║  ██║██║  ██║███████╗███████╗██║  ██║    ╚██████╗██║ ╚═╝ ██║██████╔╝
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝     ╚═════╝╚═╝     ╚═╝╚═════╝`}
          </pre>
          <p className="text-xs font-mono text-muted mt-3 tracking-wider">CAREER COMMAND CENTER</p>
        </div>

        {/* Login Card */}
        <ElectricBorder color="#00F5FF" speed={0.8} chaos={0.15} borderRadius={16}>
          <div className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-xl p-8 relative"
            style={{ boxShadow: "0 0 40px rgba(0,245,255,0.05)" }}>

            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neon-cyan/30 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neon-cyan/30 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neon-cyan/30 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neon-cyan/30 rounded-br-xl" />

            <div className="text-center mb-6">
              <h1 className="text-sm font-mono text-foreground tracking-wider">OPERATOR LOGIN</h1>
              <p className="text-[10px] font-mono text-muted mt-1">Authenticate to access your command center</p>
            </div>

            <div className="space-y-3">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSignIn(p.id)}
                  disabled={loading !== null}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-lg border transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    borderColor: `${p.color}30`,
                    backgroundColor: `${p.color}08`,
                  }}
                >
                  <span className="text-xl">{p.icon}</span>
                  <div className="text-left flex-1">
                    <p className="text-sm font-mono font-semibold" style={{ color: p.color }}>
                      {loading === p.id ? "AUTHENTICATING..." : `Continue with ${p.name}`}
                    </p>
                    <p className="text-[9px] font-mono text-muted">{p.desc}</p>
                  </div>
                  {loading === p.id ? (
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${p.color}40`, borderTopColor: "transparent" }} />
                  ) : (
                    <span className="text-muted text-xs">→</span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[rgba(0,245,255,0.08)]">
              <a href="/"
                className="block w-full text-center px-4 py-2 rounded-lg border border-[rgba(0,245,255,0.15)] text-xs font-mono text-muted hover:text-neon-cyan hover:border-neon-cyan/30 transition-colors mb-3">
                CONTINUE AS GUEST →
              </a>
              <p className="text-[9px] font-mono text-muted text-center">
                Your data is stored locally and scoped to your account.
                <br />No data is shared with third parties.
              </p>
            </div>
          </div>
        </ElectricBorder>

        {/* Status bar */}
        <div className="flex items-center justify-center gap-4 mt-6 text-[9px] font-mono text-muted/40">
          <span>SYSTEM v3.0</span>
          <span className="w-1 h-1 rounded-full bg-neon-green/40" />
          <span>SECURE CONNECTION</span>
          <span className="w-1 h-1 rounded-full bg-neon-green/40" />
          <span>READY</span>
        </div>
      </div>
    </div>
  );
}
