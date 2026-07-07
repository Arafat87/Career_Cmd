"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import ElectricBorder from "@/components/ElectricBorder";
import { fetchArray } from "@/lib/fetch-helpers";

interface CalEvent {
  date: string;
  title: string;
  source: string;
  color: string;
  sourceId: number;
}

const SOURCE_COLORS: Record<string, string> = {
  certification: "#00F5FF",
  project: "#BF00FF",
  reminder: "#FF8C00",
  application: "#00FF88",
  google: "#4285F4",
  manual: "#FFD700",
  github: "#6e40c9",
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [googleStatus, setGoogleStatus] = useState<{ connected: boolean }>({ connected: false });
  const [syncing, setSyncing] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", color: "#00F5FF" });

  useEffect(() => {
    fetchArray("/api/calendar").then(setEvents);
    // Check Google Calendar connection
    fetch("/api/integrations/google-calendar?action=status").then(r => r.json()).then(setGoogleStatus).catch(() => {});
    // Check URL params for OAuth result
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") {
      handleSyncGoogle();
      window.history.replaceState({}, "", "/calendar");
    }
  }, []);

  async function handleConnectGoogle() {
    try {
      const res = await fetch("/api/integrations/google-calendar");
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else if (data.error) {
        alert(data.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleSyncGoogle() {
    setSyncing(true);
    try {
      const res = await fetch("/api/integrations/google-calendar", { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // Refresh events
      const updated = await fetchArray("/api/calendar");
      setEvents(updated);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnectGoogle() {
    await fetch("/api/integrations/google-calendar?action=disconnect");
    setGoogleStatus({ connected: false });
  }

  async function handleAddEvent() {
    if (!newEvent.title || !newEvent.date) return;
    await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });
    setShowAddEvent(false);
    setNewEvent({ title: "", date: "", color: "#00F5FF" });
    fetchArray("/api/calendar").then(setEvents);
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  const eventsByDate: Record<string, CalEvent[]> = {};
  events.forEach((e) => {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date].push(e);
  });

  const cells: Array<{ day: number; dateStr: string; events: CalEvent[] }> = [];
  for (let i = 0; i < 42; i++) {
    const dayNum = i - firstDay + 1;
    if (dayNum > 0 && dayNum <= daysInMonth) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${dayNum.toString().padStart(2, "0")}`;
      cells.push({ day: dayNum, dateStr, events: eventsByDate[dateStr] || [] });
    } else {
      cells.push({ day: 0, dateStr: "", events: [] });
    }
  }

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const selectedEvents = selectedDay ? eventsByDate[selectedDay] || [] : [];

  return (
    <AnimatedContainer>
      {/* Header with Google Calendar controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="px-3 py-1.5 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground transition-colors">&#9664;</button>
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider min-w-[200px] text-center">{monthName.toUpperCase()}</GlowText>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="px-3 py-1.5 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground transition-colors">&#9654;</button>
          <button onClick={() => { setCurrentDate(new Date()); setSelectedDay(null); }} className="px-3 py-1.5 bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg font-mono text-xs text-neon-cyan hover:bg-neon-cyan/20 transition-colors">TODAY</button>
        </div>
        <div className="flex items-center gap-2">
          <ElectricBorder color="#FFD700">
            <button onClick={() => { setShowAddEvent(true); setNewEvent({ ...newEvent, date: selectedDay || todayStr }); }} className="px-3 py-1.5 font-mono text-xs text-[#FFD700] hover:bg-[#FFD700]/10 transition-colors">+ ADD EVENT</button>
          </ElectricBorder>
          {googleStatus.connected ? (
            <div className="flex items-center gap-2">
              <button onClick={handleSyncGoogle} disabled={syncing} className="px-3 py-1.5 bg-[#4285F4]/10 border border-[#4285F4]/20 rounded-lg font-mono text-xs text-[#4285F4] hover:bg-[#4285F4]/20 transition-colors disabled:opacity-50">
                {syncing ? "SYNCING..." : "SYNC GOOGLE"}
              </button>
              <button onClick={handleDisconnectGoogle} className="px-2 py-1.5 text-[10px] font-mono text-muted/40 hover:text-neon-red transition-colors">DISCONNECT</button>
            </div>
          ) : (
            <ElectricBorder color="#4285F4">
              <button onClick={handleConnectGoogle} className="px-3 py-1.5 font-mono text-xs text-[#4285F4] hover:bg-[#4285F4]/10 transition-colors">CONNECT GOOGLE</button>
            </ElectricBorder>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <Card hover={false} className="mb-4">
          <h3 className="text-xs font-mono text-neon-cyan/70 uppercase tracking-widest mb-3">NEW EVENT</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Event title..." className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
            <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground" />
            <select value={newEvent.color} onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })} className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground">
              <option value="#00F5FF">Cyan</option>
              <option value="#00FF88">Green</option>
              <option value="#FFD700">Gold</option>
              <option value="#FF8C00">Orange</option>
              <option value="#BF00FF">Purple</option>
              <option value="#FF2D55">Red</option>
              <option value="#4285F4">Blue</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleAddEvent} className="flex-1 px-3 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">SAVE</button>
              <button onClick={() => setShowAddEvent(false)} className="px-3 py-2 font-mono text-sm text-muted hover:text-foreground transition-colors">CANCEL</button>
            </div>
          </div>
        </Card>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        {Object.entries(SOURCE_COLORS).map(([source, color]) => (
          <div key={source} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-mono text-muted uppercase">{source}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Calendar grid */}
        <Card hover={false} className="flex-1">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
              <div key={d} className="text-center text-[10px] font-mono text-muted py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === selectedDay;
              const hasEvents = cell.events.length > 0;
              return (
                <div key={i} onClick={() => cell.day > 0 && setSelectedDay(cell.dateStr)}
                  className={`min-h-[60px] p-1.5 rounded-lg border transition-all cursor-pointer ${
                    cell.day === 0 ? "border-transparent" :
                    isSelected ? "border-neon-cyan/40 bg-neon-cyan/10" :
                    isToday ? "border-neon-cyan/20 bg-[rgba(0,245,255,0.03)]" :
                    "border-[rgba(0,245,255,0.05)] hover:border-[rgba(0,245,255,0.15)]"
                  }`}
                >
                  {cell.day > 0 && (
                    <>
                      <span className={`text-xs font-mono ${isToday ? "text-neon-cyan font-bold" : "text-foreground/70"}`}>{cell.day}</span>
                      {hasEvents && (
                        <div className="flex flex-wrap gap-0.5 mt-1">
                          {cell.events.slice(0, 3).map((e, j) => (
                            <span key={j} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color }} />
                          ))}
                          {cell.events.length > 3 && <span className="text-[8px] font-mono text-muted">+{cell.events.length - 3}</span>}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Day detail panel */}
        {selectedDay && (
          <AnimatedItem>
            <Card hover={false} className="w-72 flex-shrink-0">
              <h3 className="text-sm font-mono text-neon-cyan/70 tracking-wider mb-3">
                {new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </h3>
              {selectedEvents.length === 0 ? (
                <p className="text-xs font-mono text-muted">No events on this day</p>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((e, i) => (
                    <div key={i} className="p-2 rounded-lg bg-[rgba(0,245,255,0.02)] border border-[rgba(0,245,255,0.08)]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                        <p className="text-xs font-mono text-foreground">{e.title}</p>
                      </div>
                      <span className="text-[10px] font-mono text-muted uppercase ml-4">{e.source}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </AnimatedItem>
        )}
      </div>
    </AnimatedContainer>
  );
}
