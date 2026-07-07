"use client";

import { useState, useEffect } from "react";

export default function CountdownTimer({
  target,
  label = "",
  color = "#00F5FF",
}: {
  target: Date;
  label?: string;
  color?: string;
}) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    function calc() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
      };
    }
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [target]);

  const units = [
    { label: "D", value: timeLeft.days },
    { label: "H", value: timeLeft.hours },
    { label: "M", value: timeLeft.minutes },
    { label: "S", value: timeLeft.seconds },
  ];

  if (timeLeft.expired) {
    return (
      <div className="font-mono text-xs text-neon-red animate-pulse">
        {label ? `${label}: ` : ""}EXPIRED
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-[10px] font-mono text-muted">{label}</span>}
      <div className="flex gap-1">
        {units.map((u) => (
          <div key={u.label} className="flex items-center gap-0.5">
            <span className="text-sm font-mono font-bold tabular-nums" style={{ color }}>
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="text-[8px] font-mono text-muted">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
