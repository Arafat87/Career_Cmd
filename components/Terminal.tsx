"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

interface TerminalLine {
  id: number;
  text: string;
  type: "input" | "output" | "error" | "system";
  timestamp?: string;
}

export default function Terminal({
  lines: initialLines = [],
  onCommand,
  prompt = "careercmd@system:~$",
  height = 300,
  autoScroll = true,
}: {
  lines?: { text: string; type: TerminalLine["type"] }[];
  onCommand?: (cmd: string) => string | Promise<string>;
  prompt?: string;
  height?: number;
  autoScroll?: boolean;
}) {
  const [lines, setLines] = useState<TerminalLine[]>(
    initialLines.map((l, i) => ({ ...l, id: i, timestamp: new Date().toLocaleTimeString() }))
  );
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(initialLines.length);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [lines, autoScroll]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim();
    setHistory((h) => [cmd, ...h]);
    setHistoryIdx(-1);
    setInput("");

    const newLine: TerminalLine = {
      id: ++idCounter.current,
      text: `${prompt} ${cmd}`,
      type: "input",
      timestamp: new Date().toLocaleTimeString(),
    };
    setLines((l) => [...l, newLine]);

    if (onCommand) {
      const result = await onCommand(cmd);
      setLines((l) => [
        ...l,
        { id: ++idCounter.current, text: result, type: result.startsWith("ERROR") ? "error" : "output", timestamp: new Date().toLocaleTimeString() },
      ]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIdx < history.length - 1) {
        const idx = historyIdx + 1;
        setHistoryIdx(idx);
        setInput(history[idx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const idx = historyIdx - 1;
        setHistoryIdx(idx);
        setInput(history[idx]);
      } else {
        setHistoryIdx(-1);
        setInput("");
      }
    }
  }

  const typeColors: Record<string, string> = {
    input: "text-neon-cyan",
    output: "text-foreground/80",
    error: "text-neon-red",
    system: "text-neon-yellow",
  };

  return (
    <div
      className="rounded-lg border border-[rgba(0,245,255,0.15)] bg-[#050508] overflow-hidden font-mono text-xs scanline-overlay"
      style={{ height }}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a12] border-b border-[rgba(0,245,255,0.1)]">
        <span className="w-2.5 h-2.5 rounded-full bg-neon-red/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-neon-yellow/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-neon-green/80" />
        <span className="ml-2 text-muted text-[10px]">CAREER CMD TERMINAL v1.0</span>
      </div>
      <div className="p-3 overflow-y-auto" style={{ height: height - 70 }}>
        {lines.map((line) => (
          <div key={line.id} className="flex gap-2">
            <span className="text-muted/40 text-[9px] w-14 shrink-0">{line.timestamp}</span>
            <pre className={`${typeColors[line.type] || "text-foreground/80"} whitespace-pre-wrap break-all`}>{line.text}</pre>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center border-t border-[rgba(0,245,255,0.1)] px-3 py-1.5">
        <span className="text-neon-green mr-2 text-[10px]">{prompt}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-foreground text-xs outline-none placeholder:text-muted/30 caret-neon-cyan"
          placeholder="type a command..."
          autoFocus
        />
      </form>
    </div>
  );
}
