"use client";

import { useState, useEffect } from "react";

interface ModelConfig {
  id: number;
  provider: string;
  model_name: string;
  is_default: number;
}

interface Props {
  selectedModelId: number | null;
  onSelect: (modelId: number | null) => void;
  compact?: boolean;
}

export default function ModelSelector({ selectedModelId, onSelect, compact }: Props) {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (Array.isArray(d)) setModels(d);
    }).catch(() => {});
  }, []);

  const selected = models.find(m => m.id === selectedModelId) || models.find(m => m.is_default);
  const display = selected ? `${selected.provider}/${selected.model_name}` : "Default Model";

  if (models.length === 0) return null;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${compact ? "text-[9px]" : "text-[10px]"} font-mono ${
          selectedModelId ? "text-neon-purple border-neon-purple/30 bg-neon-purple/10" : "text-muted border-[rgba(0,245,255,0.15)] hover:bg-[rgba(0,245,255,0.05)]"
        }`}>
        <span>✦</span>
        <span className="truncate max-w-[140px]">{display}</span>
        <span className="text-[8px] ml-0.5">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-[#0d0d18] border border-[rgba(0,245,255,0.2)] rounded-lg shadow-xl overflow-hidden">
            <button onClick={() => { onSelect(null); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[10px] font-mono hover:bg-[rgba(0,245,255,0.05)] ${!selectedModelId ? "text-neon-cyan bg-neon-cyan/5" : "text-muted"}`}>
              Default Model
            </button>
            <div className="border-t border-[rgba(0,245,255,0.08)]" />
            {models.map(m => (
              <button key={m.id} onClick={() => { onSelect(m.id); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-[10px] font-mono hover:bg-[rgba(0,245,255,0.05)] ${selectedModelId === m.id ? "text-neon-cyan bg-neon-cyan/5" : "text-foreground/70"}`}>
                <span className="text-neon-purple/70">{m.provider}</span>
                <span className="text-muted mx-1">/</span>
                <span>{m.model_name}</span>
                {m.is_default ? <span className="text-neon-green ml-1 text-[8px]">DEFAULT</span> : null}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
