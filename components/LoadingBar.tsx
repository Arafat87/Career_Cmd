"use client";

import { useEffect, useState } from "react";

export default function LoadingBar({
  progress,
  color = "#00F5FF",
  height = 4,
  segments = 20,
  animated = true,
  className = "",
}: {
  progress: number;
  color?: string;
  height?: number;
  segments?: number;
  animated?: boolean;
  className?: string;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!animated) { setCurrent(progress); return; }
    const step = progress / segments;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCurrent(Math.min(step * i, progress));
      if (i >= segments) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [progress, segments, animated]);

  const filled = Math.round((current / 100) * segments);

  return (
    <div className={`flex gap-0.5 ${className}`} style={{ height }}>
      {Array.from({ length: segments }, (_, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-150"
          style={{
            backgroundColor: i < filled ? color : `${color}10`,
            boxShadow: i < filled ? `0 0 4px ${color}40` : "none",
          }}
        />
      ))}
    </div>
  );
}
