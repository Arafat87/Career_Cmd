"use client";

import { useState, useEffect, useRef } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";

export default function FocusPage() {
  const [mode, setMode] = useState<"setup" | "active" | "break">("setup");
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [sessions, setSessions] = useState(4);
  const [currentSession, setCurrentSession] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [task, setTask] = useState("");
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (mode === "active" || mode === "break") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            if (mode === "active") {
              setCompletedSessions((s) => s + 1);
              if (currentSession + 1 >= sessions) {
                setMode("setup");
                return 0;
              }
              setCurrentSession((s) => s + 1);
              setMode("break");
              setTotalTime(breakMinutes * 60);
              return breakMinutes * 60;
            } else {
              setMode("active");
              setTotalTime(workMinutes * 60);
              return workMinutes * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [mode, currentSession, sessions, workMinutes, breakMinutes]);

  function start() {
    setCurrentSession(0);
    setCompletedSessions(0);
    setMode("active");
    const t = workMinutes * 60;
    setTimeLeft(t);
    setTotalTime(t);
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode("setup");
  }

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWork = mode === "active";

  if (mode !== "setup") {
    return (
      <div className="fixed inset-0 z-[100] bg-[#050508] flex flex-col items-center justify-center">
        {/* Background effect */}
        <div className="absolute inset-0 animated-gradient opacity-30" />

        <div className="relative z-10 text-center space-y-8">
          {/* Session info */}
          <div>
            <p className="text-xs font-mono text-muted tracking-wider">
              {isWork ? "DEEP WORK SESSION" : "BREAK TIME"} — {currentSession + 1} / {sessions}
            </p>
            {task && <p className="text-sm font-mono text-neon-cyan mt-1">FOCUSING ON: {task}</p>}
          </div>

          {/* Timer ring */}
          <div className="relative w-64 h-64 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,245,255,0.05)" strokeWidth="2" />
              <circle cx="50" cy="50" r="45" fill="none" stroke={isWork ? "#00F5FF" : "#00FF88"} strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${isWork ? "#00F5FF40" : "#00FF8840"})`, transition: "stroke-dashoffset 1s linear" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-mono font-bold" style={{ color: isWork ? "#00F5FF" : "#00FF88" }}>
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
              <span className="text-xs font-mono text-muted mt-2">{isWork ? "WORK" : "BREAK"}</span>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: sessions }, (_, i) => (
              <div key={i} className="w-3 h-3 rounded-full transition-all"
                style={{ backgroundColor: i < completedSessions ? "#00FF88" : i === currentSession ? "#00F5FF" : "rgba(0,245,255,0.1)",
                  boxShadow: i === currentSession ? "0 0 8px #00F5FF60" : "none" }} />
            ))}
          </div>

          <button onClick={stop}
            className="px-6 py-2 border border-neon-red/30 rounded-lg font-mono text-xs text-neon-red hover:bg-neon-red/10 transition-colors">
            END SESSION
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">FOCUS MODE — POMODORO</GlowText>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hover={false}>
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-4">CONFIGURATION</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-muted mb-2">WORK DURATION</label>
              <div className="flex gap-2">
                {[15, 25, 30, 45, 60].map((m) => (
                  <button key={m} onClick={() => setWorkMinutes(m)}
                    className={`px-3 py-2 rounded-lg text-xs font-mono ${workMinutes === m ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>{m}m</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-muted mb-2">BREAK DURATION</label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map((m) => (
                  <button key={m} onClick={() => setBreakMinutes(m)}
                    className={`px-3 py-2 rounded-lg text-xs font-mono ${breakMinutes === m ? "bg-neon-green/10 text-neon-green border border-neon-green/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>{m}m</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-muted mb-2">SESSIONS</label>
              <div className="flex gap-2">
                {[2, 4, 6, 8].map((s) => (
                  <button key={s} onClick={() => setSessions(s)}
                    className={`px-3 py-2 rounded-lg text-xs font-mono ${sessions === s ? "bg-neon-purple/10 text-neon-purple border border-neon-purple/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-muted mb-2">WHAT ARE YOU FOCUSING ON?</label>
              <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="e.g. Kubernetes study, resume update..."
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted/30" />
            </div>
            <button onClick={start}
              className="w-full px-4 py-3 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">
              START FOCUS SESSION ({sessions} × {workMinutes}min)
            </button>
          </div>
        </Card>

        <Card hover={false}>
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-4">TIPS</h3>
          <div className="space-y-3 text-xs font-mono text-foreground/60">
            <p>🔇 Close Slack, email, and notifications</p>
            <p>📱 Put your phone in another room</p>
            <p>🎵 Use lo-fi or white noise if it helps</p>
            <p>💧 Keep water nearby</p>
            <p>📝 Write down distractions to handle later</p>
            <p>🧘 Take breaks seriously — stand up, stretch</p>
            <p>🎯 One task per session — no multitasking</p>
            <p>📊 Track your sessions to build momentum</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
