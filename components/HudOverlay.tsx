"use client";

import { ReactNode } from "react";

export default function HudOverlay({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neon-cyan/40" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neon-cyan/40" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neon-cyan/40" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neon-cyan/40" />
      {children}
    </div>
  );
}

export function HudBar({ label, value, color = "#00F5FF" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px]">
      <span className="text-muted">{label}</span>
      <span style={{ color }}>{value}</span>
    </div>
  );
}

export function HudStatus({ items }: { items: { label: string; value: string; color?: string }[] }) {
  return (
    <div className="flex items-center gap-4 px-3 py-1.5 bg-[#050508] border border-[rgba(0,245,255,0.1)] rounded font-mono">
      {items.map((item, i) => (
        <HudBar key={i} {...item} />
      ))}
    </div>
  );
}
