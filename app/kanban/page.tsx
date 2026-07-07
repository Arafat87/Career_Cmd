"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";
import { fetchArray } from "@/lib/fetch-helpers";

interface Application {
  id: number; company: string; position: string; status: string; date_applied: string; location: string; salary_min: number; salary_max: number; category: string;
}

const COLUMNS = ["BOOKMARKED", "APPLIED", "PHONE SCREEN", "INTERVIEW", "OFFER", "REJECTED"];
const COL_COLORS: Record<string, string> = {
  BOOKMARKED: "#4A6274", APPLIED: "#00F5FF", "PHONE SCREEN": "#BF00FF", INTERVIEW: "#FFD700", OFFER: "#00FF88", REJECTED: "#FF2D55",
};

export default function KanbanPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  useEffect(() => { fetchApps(); }, []);

  async function fetchApps() {
    const data = await fetchArray("/api/applications"); setApplications(data);
  }

  function handleDragStart(id: number) { setDragId(id); }
  function handleDragOver(e: React.DragEvent, col: string) { e.preventDefault(); setDragOverCol(col); }
  function handleDragLeave() { setDragOverCol(null); }

  async function handleDrop(status: string) {
    setDragOverCol(null);
    if (dragId === null) return;
    const app = applications.find((a) => a.id === dragId);
    if (!app || app.status === status) { setDragId(null); return; }

    // Optimistic update
    setApplications((prev) => prev.map((a) => a.id === dragId ? { ...a, status } : a));
    setDragId(null);

    await fetch("/api/applications", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...app, status }),
    });
  }

  return (
    <div className="space-y-4">
      <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider mb-4">
        APPLICATION PIPELINE — {applications.length} TOTAL
      </GlowText>

      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 220px)" }}>
        {COLUMNS.map((col) => {
          const colApps = applications.filter((a) => a.status === col);
          const isOver = dragOverCol === col;
          return (
            <div key={col} className="w-64 flex-shrink-0 flex flex-col"
              onDragOver={(e) => handleDragOver(e, col)} onDragLeave={handleDragLeave} onDrop={() => handleDrop(col)}>
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COL_COLORS[col] }} />
                <span className="text-xs font-mono uppercase tracking-wider" style={{ color: COL_COLORS[col] }}>{col}</span>
                <span className="text-[10px] font-mono text-muted ml-auto">{colApps.length}</span>
              </div>

              {/* Column Body */}
              <div className={`flex-1 rounded-lg p-2 space-y-2 transition-colors ${isOver ? "bg-[rgba(0,245,255,0.05)] border border-dashed border-neon-cyan/30" : "bg-[rgba(0,245,255,0.01)] border border-transparent"}`}>
                {colApps.map((app) => (
                  <div key={app.id} draggable onDragStart={() => handleDragStart(app.id)}
                    className="p-3 rounded-lg bg-card-bg border border-card-border cursor-grab active:cursor-grabbing hover:border-[rgba(0,245,255,0.2)] transition-all">
                    <p className="text-sm font-mono font-semibold text-foreground truncate">{app.position}</p>
                    <p className="text-xs font-mono text-muted truncate">{app.company}</p>
                    {app.location && <p className="text-[10px] font-mono text-muted/60 mt-1">{app.location}</p>}
                    {(app.salary_min > 0 || app.salary_max > 0) && (
                      <p className="text-[10px] font-mono text-neon-green/60 mt-1">${app.salary_min.toLocaleString()} - ${app.salary_max.toLocaleString()}</p>
                    )}
                    {app.date_applied && <p className="text-[10px] font-mono text-muted/40 mt-1">{app.date_applied}</p>}
                  </div>
                ))}
                {colApps.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-[10px] font-mono text-muted/30">Drop here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
