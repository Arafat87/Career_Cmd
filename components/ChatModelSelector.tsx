"use client";

import { useEffect, useState } from "react";

interface ModelConfig {
  id: number;
  provider: string;
  model_name: string;
  is_default: number;
}

export default function ChatModelSelector({
  conversationId,
  currentModel,
  onModelChange,
}: {
  conversationId: number;
  currentModel: string;
  onModelChange: (model: string) => void;
}) {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [selected, setSelected] = useState(currentModel);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setModels(data);
      });
  }, []);

  async function handleChange(value: string) {
    setSelected(value);
    onModelChange(value);
    await fetch("/api/chat", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: conversationId, model_used: value }),
    });
  }

  const displayValue = selected || "Default";

  return (
    <div className="flex items-center gap-2">
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1 text-[11px] font-mono text-foreground focus:border-neon-cyan/50 transition-colors cursor-pointer"
      >
        <option value="">Default Model</option>
        {models.map((m) => (
          <option key={m.id} value={`${m.provider}/${m.model_name}`}>
            {m.provider}/{m.model_name}
          </option>
        ))}
      </select>
      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-[rgba(0,245,255,0.1)] border border-[rgba(0,245,255,0.2)] text-neon-cyan/70">
        {displayValue.split("/")[0] || "default"}
      </span>
    </div>
  );
}
