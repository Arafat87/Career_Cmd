"use client";

import { useSound } from "./SoundManager";

export default function SoundToggle() {
  const { enabled, toggle } = useSound();

  return (
    <div>
      <label className="block text-xs font-mono text-muted mb-3">SOUND EFFECTS</label>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-mono text-foreground">{enabled ? "ENABLED" : "DISABLED"}</p>
          <p className="text-[10px] font-mono text-muted">Subtle UI sounds on interactions</p>
        </div>
        <button
          onClick={toggle}
          className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? "bg-neon-cyan/30" : "bg-[rgba(0,245,255,0.08)]"}`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${enabled ? "left-6 bg-neon-cyan" : "left-0.5 bg-muted"}`}
            style={enabled ? { boxShadow: "0 0 8px #00F5FF60" } : {}}
          />
        </button>
      </div>
    </div>
  );
}
