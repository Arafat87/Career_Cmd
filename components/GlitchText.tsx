"use client";

import { useEffect, useState } from "react";

export default function GlitchText({
  children,
  as: Tag = "h2",
  className = "",
}: {
  children: string;
  as?: "h1" | "h2" | "h3" | "h4";
  className?: string;
}) {
  const [glitching, setGlitching] = useState(true);

  useEffect(() => {
    // Glitch for 1 second on mount, then stop
    const timer = setTimeout(() => setGlitching(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Re-trigger glitch on hover
  function handleMouseEnter() {
    setGlitching(true);
    setTimeout(() => setGlitching(false), 800);
  }

  return (
    <Tag
      className={`${className} ${glitching ? "glitch-text" : ""}`}
      data-text={children}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Tag>
  );
}
