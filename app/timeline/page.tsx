"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import { fetchArray } from "@/lib/fetch-helpers";

interface TimelineEvent {
  date: string;
  title: string;
  type: string;
  color: string;
  icon: string;
}

const TYPE_COLORS: Record<string, string> = {
  cert: "#00FF88", interview: "#BF00FF", application: "#00F5FF", offer: "#FFD700",
  project: "#FF6B00", milestone: "#FF2D55", learning: "#0088FF",
};

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    async function load() {
      const [certs, apps, interviews, projects] = await Promise.all([
        fetchArray("/api/certifications"),
        fetchArray("/api/applications"),
        fetchArray("/api/interviews"),
        fetchArray("/api/projects"),
      ]);

      const allEvents: TimelineEvent[] = [];

      (certs as any[]).forEach(c => {
        if (c.earned_date) allEvents.push({ date: c.earned_date, title: `Earned: ${c.name}`, type: "cert", color: TYPE_COLORS.cert, icon: "📜" });
      });
      (apps as any[]).forEach(a => {
        if (a.applied_date || a.created_at) allEvents.push({ date: a.applied_date || a.created_at, title: `Applied: ${a.position} @ ${a.company}`, type: "application", color: TYPE_COLORS.application, icon: "📤" });
        if (a.status === "OFFER") allEvents.push({ date: a.applied_date || a.created_at, title: `Offer: ${a.position} @ ${a.company}`, type: "offer", color: TYPE_COLORS.offer, icon: "💎" });
      });
      (interviews as any[]).forEach(i => {
        allEvents.push({ date: i.date, title: `Interview: ${i.type || "Interview"} @ ${i.company}`, type: "interview", color: TYPE_COLORS.interview, icon: "🎤" });
      });
      (projects as any[]).forEach(p => {
        if (p.status === "DONE") allEvents.push({ date: p.deadline || p.created_at, title: `Completed: ${p.name}`, type: "project", color: TYPE_COLORS.project, icon: "✅" });
      });

      allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEvents(allEvents);
    }
    load();
  }, []);

  const types = [...new Set(events.map(e => e.type))];
  const filtered = filterType ? events.filter(e => e.type === filterType) : events;

  // Group by month
  const grouped = filtered.reduce((acc, e) => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  return (
    <AnimatedContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">CAREER TIMELINE ({events.length} events)</GlowText>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterType("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono ${!filterType ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>ALL</button>
        {types.map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono ${filterType === t ? "border border-opacity-30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}
            style={filterType === t ? { color: TYPE_COLORS[t], backgroundColor: `${TYPE_COLORS[t]}15`, borderColor: `${TYPE_COLORS[t]}30` } : {}}>{t.toUpperCase()}</button>
        ))}
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-[rgba(0,245,255,0.1)]" />

        {Object.entries(grouped).map(([month, monthEvents]) => (
          <div key={month} className="mb-6">
            <div className="flex items-center gap-3 mb-3 relative">
              <div className="w-12 h-6 rounded bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                <span className="text-[9px] font-mono text-neon-cyan">{new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" })}</span>
              </div>
              <div className="h-px flex-1 bg-[rgba(0,245,255,0.05)]" />
            </div>

            <div className="space-y-2 ml-14">
              {monthEvents.map((e, i) => (
                <AnimatedItem key={`${month}-${i}`}>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-[rgba(0,245,255,0.05)] hover:bg-[rgba(0,245,255,0.02)] transition-colors">
                    {/* Dot */}
                    <div className="relative -ml-[2.35rem] mt-1">
                      <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: e.color, backgroundColor: `${e.color}30` }} />
                    </div>
                    <span className="text-lg">{e.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs font-mono text-foreground">{e.title}</p>
                      <p className="text-[9px] font-mono text-muted mt-0.5">{new Date(e.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <Card hover={false} className="text-center py-12 ml-14">
            <p className="text-sm font-mono text-muted">No events yet. Start applying and tracking!</p>
          </Card>
        )}
      </div>
    </AnimatedContainer>
  );
}
