"use client";

import { useState, useEffect, ReactNode } from "react";

const BOOT_LINES = [
  { text: "> CAREER CMD SYSTEM v3.0 INITIALIZING...", delay: 0 },
  { text: "> LOADING KERNEL MODULES.............. OK", delay: 200 },
  { text: "> NEURAL INTERFACE CONNECTED........... OK", delay: 400 },
  { text: "> CAREER DATABASE SYNC................ OK", delay: 600 },
  { text: "> AI SUBSYSTEMS ONLINE................ OK", delay: 800 },
  { text: "> THREAT DETECTION ACTIVE............. OK", delay: 950 },
  { text: "> DASHBOARD RENDERER INITIALIZED...... OK", delay: 1100 },
  { text: "> ALL SYSTEMS NOMINAL. WELCOME, OPERATOR.", delay: 1300 },
];

export default function BootSequence({ children, duration = 2000 }: { children: ReactNode; duration?: number }) {
  const [booting, setBooting] = useState(true);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const hasBooted = sessionStorage.getItem("hireops_booted");
    if (hasBooted) { setBooting(false); return; }

    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, line.text]);
        setProgress(((i + 1) / BOOT_LINES.length) * 100);
      }, line.delay);
    });

    setTimeout(() => {
      setBooting(false);
      sessionStorage.setItem("hireops_booted", "1");
    }, duration);
  }, [duration]);

  if (!booting) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[10000] bg-[#050508] flex flex-col items-center justify-center font-mono">
      <div className="w-full max-w-lg px-8">
        <div className="mb-6 text-center">
          <pre className="text-neon-cyan/80 text-[8px] leading-tight">
{`
 ██████╗ █████╗ ██████╗ ███████╗███████╗██████╗      ██████╗███╗   ███╗██████╗
██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗    ██╔════╝████╗ ████║██╔══██╗
██║     ███████║██████╔╝█████╗  █████╗  ██████╔╝    ██║     ██╔████╔██║██║  ██║
██║     ██╔══██║██╔══██╗██╔══╝  ██╔══╝  ██╔══██╗    ██║     ██║╚██╔╝██║██║  ██║
╚██████╗██║  ██║██║  ██║███████╗███████╗██║  ██║    ╚██████╗██║ ╚═╝ ██║██████╔╝
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝     ╚═════╝╚═╝     ╚═╝╚═════╝
`}
          </pre>
        </div>
        <div className="space-y-1 mb-4">
          {visibleLines.map((line, i) => (
            <div key={i} className="text-xs text-neon-green/70">{line}</div>
          ))}
        </div>
        <div className="flex gap-0.5 h-2">
          {Array.from({ length: 30 }, (_, i) => (
            <div key={i} className="flex-1 rounded-sm transition-all duration-100"
              style={{ backgroundColor: i < (progress / 100) * 30 ? "#00F5FF" : "rgba(0,245,255,0.08)", boxShadow: i < (progress / 100) * 30 ? "0 0 6px #00F5FF40" : "none" }} />
          ))}
        </div>
        <p className="text-[10px] text-muted mt-3 text-center">{Math.round(progress)}% LOADED</p>
      </div>
    </div>
  );
}
