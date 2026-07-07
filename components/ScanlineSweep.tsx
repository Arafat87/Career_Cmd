"use client";

import { ReactNode, useEffect, useState } from "react";

export default function ScanlineSweep({
  children,
  className = "",
  color = "#00F5FF",
  trigger = true,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  trigger?: boolean;
}) {
  const [sweeping, setSweeping] = useState(false);

  useEffect(() => {
    if (trigger) {
      setSweeping(true);
      const t = setTimeout(() => setSweeping(false), 800);
      return () => clearTimeout(t);
    }
  }, [trigger]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      {sweeping && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${color}10 48%, ${color}25 50%, ${color}10 52%, transparent 100%)`,
            animation: "scanline-sweep 0.8s ease-in-out",
          }}
        />
      )}
    </div>
  );
}
