"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Notification {
  type: string; title: string; detail: string; link: string; color: string;
}

export default function NotificationCenter() {
  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/notifications").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setAlerts(data);
    });
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg border border-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.2)] transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-red text-[8px] font-mono text-white flex items-center justify-center">{alerts.length}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="fixed right-4 top-16 w-80 max-h-96 overflow-y-auto rounded-lg bg-[#0a0a12] border border-[rgba(0,245,255,0.1)] shadow-lg z-[9000]">
            <div className="p-3 border-b border-[rgba(0,245,255,0.08)]">
              <h3 className="text-xs font-mono text-neon-cyan/70 uppercase tracking-wider">NOTIFICATIONS</h3>
            </div>
            {alerts.length === 0 ? (
              <p className="p-4 text-xs font-mono text-muted text-center">No alerts</p>
            ) : (
              <div className="divide-y divide-[rgba(0,245,255,0.05)]">
                {alerts.map((a, i) => (
                  <Link key={i} href={a.link} onClick={() => setOpen(false)}
                    className="block p-3 hover:bg-[rgba(0,245,255,0.03)] transition-colors">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: a.color }} />
                      <div>
                        <p className="text-xs font-mono text-foreground">{a.title}</p>
                        <p className="text-[10px] font-mono text-muted">{a.detail}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
