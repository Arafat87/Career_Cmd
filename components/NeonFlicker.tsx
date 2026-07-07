"use client";

import { ReactNode, useEffect, useState } from "react";

export default function NeonFlicker({
  children,
  intensity = "subtle",
  className = "",
}: {
  children: ReactNode;
  intensity?: "subtle" | "medium" | "strong";
  className?: string;
}) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const durations: Record<string, number> = { subtle: 4000, medium: 2500, strong: 1500 };
    const interval = setInterval(() => {
      const rand = Math.random();
      if (intensity === "subtle") {
        setOpacity(rand > 0.85 ? 0.7 : 1);
      } else if (intensity === "medium") {
        setOpacity(rand > 0.7 ? 0.5 : rand > 0.4 ? 0.8 : 1);
      } else {
        setOpacity(rand > 0.8 ? 0.2 : rand > 0.5 ? 0.6 : 1);
      }
      setTimeout(() => setOpacity(1), 80);
    }, durations[intensity]);
    return () => clearInterval(interval);
  }, [intensity]);

  return (
    <span className={className} style={{ opacity, transition: "opacity 0.05s" }}>
      {children}
    </span>
  );
}
