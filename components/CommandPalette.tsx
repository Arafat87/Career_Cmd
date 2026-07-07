"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Command {
  label: string;
  shortcut?: string;
  action: () => void;
  category: string;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands: Command[] = [
    { label: "Dashboard", shortcut: "G D", action: () => router.push("/"), category: "NAVIGATE" },
    { label: "Analytics", shortcut: "G A", action: () => router.push("/analytics"), category: "NAVIGATE" },
    { label: "Applications", shortcut: "G P", action: () => router.push("/applications"), category: "NAVIGATE" },
    { label: "Questions", shortcut: "G Q", action: () => router.push("/questions"), category: "NAVIGATE" },
    { label: "Interviews", shortcut: "G I", action: () => router.push("/interviews"), category: "NAVIGATE" },
    { label: "Templates", shortcut: "G T", action: () => router.push("/templates"), category: "NAVIGATE" },
    { label: "Kanban Board", shortcut: "G K", action: () => router.push("/kanban"), category: "NAVIGATE" },
    { label: "AI Assistant", shortcut: "G C", action: () => router.push("/assistant"), category: "NAVIGATE" },
    { label: "Settings", shortcut: "G S", action: () => router.push("/settings"), category: "NAVIGATE" },
    { label: "Job Titles", action: () => router.push("/jobtitles"), category: "NAVIGATE" },
    { label: "Certifications", action: () => router.push("/certifications"), category: "NAVIGATE" },
    { label: "Salary Tracker", action: () => router.push("/salary"), category: "NAVIGATE" },
    { label: "Documents", action: () => router.push("/documents"), category: "NAVIGATE" },
    { label: "Networking", action: () => router.push("/networking"), category: "NAVIGATE" },
    { label: "Calendar", action: () => router.push("/calendar"), category: "NAVIGATE" },
    { label: "Export / Print", action: () => router.push("/export"), category: "NAVIGATE" },
  ];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh]" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-[#0a0a12] border border-neon-cyan/20 rounded-xl shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 0 40px rgba(0,245,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(0,245,255,0.1)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00F5FF" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-sm font-mono text-foreground outline-none placeholder:text-muted/50"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-[rgba(0,245,255,0.08)] text-[9px] font-mono text-muted">ESC</kbd>
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {filtered.map((cmd, i) => (
            <button
              key={i}
              onClick={() => { cmd.action(); setOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-neon-cyan/5 transition-colors text-left"
            >
              <span className="text-sm font-mono text-foreground">{cmd.label}</span>
              {cmd.shortcut && (
                <kbd className="px-1.5 py-0.5 rounded bg-[rgba(0,245,255,0.08)] text-[9px] font-mono text-muted">{cmd.shortcut}</kbd>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-xs font-mono text-muted text-center">No commands found</p>
          )}
        </div>
        <div className="flex items-center gap-4 px-4 py-2 border-t border-[rgba(0,245,255,0.05)] text-[9px] font-mono text-muted/50">
          <span><kbd className="px-1 py-0.5 rounded bg-[rgba(0,245,255,0.05)]">↑↓</kbd> navigate</span>
          <span><kbd className="px-1 py-0.5 rounded bg-[rgba(0,245,255,0.05)]">↵</kbd> select</span>
          <span><kbd className="px-1 py-0.5 rounded bg-[rgba(0,245,255,0.05)]">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
