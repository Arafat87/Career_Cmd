"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import ElectricBorder from "@/components/ElectricBorder";

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  source: string;
  color: string;
  description: string;
}

export default function GoogleCalendarPage() {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualDate, setManualDate] = useState("");

  async function fetchStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/google-calendar");
      const data = await res.json();
      setConnected(data.connected || false);
      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { fetchStatus(); }, []);

  async function handleSync() {
    setSyncing(true); setError("");
    try {
      const res = await fetch("/api/integrations/google-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await fetchStatus();
    } catch (e: any) { setError(e.message); } finally { setSyncing(false); }
  }

  async function handleDisconnect() {
    await fetch("/api/integrations/google-calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disconnect" }),
    });
    setConnected(false);
    setEvents([]);
  }

  async function handleAddManual() {
    if (!manualTitle.trim() || !manualDate.trim()) return;
    await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: manualTitle, date: manualDate }),
    });
    setManualTitle("");
    setManualDate("");
    await fetchStatus();
  }

  if (loading) {
    return <AnimatedContainer><p className="text-sm font-mono text-muted">Loading...</p></AnimatedContainer>;
  }

  return (
    <AnimatedContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">GOOGLE CALENDAR</GlowText>
      </div>

      {/* Connection Status */}
      <Card hover={false}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${connected ? "bg-neon-green" : "bg-neon-red"}`} />
            <span className="text-sm font-mono text-foreground">
              {connected ? "CONNECTED" : "NOT CONNECTED"}
            </span>
          </div>
          <div className="flex gap-2">
            {connected ? (
              <>
                <ElectricBorder color="#00FF88">
                  <button onClick={handleSync} disabled={syncing} className="px-4 py-1.5 font-mono text-xs text-neon-green hover:bg-neon-green/10 transition-colors disabled:opacity-50">
                    {syncing ? "SYNCING..." : "SYNC NOW"}
                  </button>
                </ElectricBorder>
                <button onClick={handleDisconnect} className="px-4 py-1.5 font-mono text-xs text-neon-red border border-neon-red/20 rounded hover:bg-neon-red/10 transition-colors">
                  DISCONNECT
                </button>
              </>
            ) : (
              <p className="text-xs font-mono text-muted/60">
                Add Google Calendar API credentials to settings to connect.
              </p>
            )}
          </div>
        </div>
        {error && <p className="text-sm font-mono text-neon-red mt-2">{error}</p>}
      </Card>

      {/* Manual Add */}
      <Card hover={false}>
        <h3 className="text-xs font-mono text-muted/50 uppercase tracking-widest mb-3">ADD EVENT</h3>
        <div className="flex gap-3">
          <input
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            placeholder="Event title..."
            className="flex-1 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted"
          />
          <input
            type="date"
            value={manualDate}
            onChange={(e) => setManualDate(e.target.value)}
            className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground"
          />
          <ElectricBorder color="#00F5FF">
            <button onClick={handleAddManual} disabled={!manualTitle.trim() || !manualDate.trim()} className="px-4 py-2 font-mono text-xs text-neon-cyan hover:bg-neon-cyan/10 transition-colors disabled:opacity-50">
              ADD
            </button>
          </ElectricBorder>
        </div>
      </Card>

      {/* Events */}
      {events.length > 0 && (
        <div>
          <h3 className="text-xs font-mono text-muted/50 uppercase tracking-widest mb-3">EVENTS ({events.length})</h3>
          <div className="space-y-2">
            {events.map((event) => (
              <AnimatedItem key={event.id}>
                <Card hover={false}>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-foreground truncate">{event.title}</p>
                      <p className="text-[10px] font-mono text-muted/50">
                        {event.date} {event.source === "google" ? "(Google)" : "(Manual)"}
                      </p>
                    </div>
                  </div>
                </Card>
              </AnimatedItem>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && !loading && (
        <Card hover={false}>
          <p className="text-sm font-mono text-muted text-center py-8">
            No calendar events. Add manually or connect Google Calendar.
          </p>
        </Card>
      )}
    </AnimatedContainer>
  );
}
