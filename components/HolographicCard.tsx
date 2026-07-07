"use client";

import { useState, useRef, ReactNode } from "react";

export default function HolographicCard({
  children,
  className = "",
  glowColor = "#00F5FF",
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  function handleMouseMove(e: React.MouseEvent) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    setStyle({
      transform: `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      background: `radial-gradient(circle at ${percentX}% ${percentY}%, ${glowColor}15 0%, rgba(10,10,18,0.95) 50%)`,
      boxShadow: `0 0 30px ${glowColor}15, inset 0 0 30px ${glowColor}05`,
    });
  }

  function handleMouseLeave() {
    setStyle({
      transform: "perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "all 0.5s ease",
    });
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`rounded-lg border border-[rgba(0,245,255,0.1)] p-4 transition-[transform,box-shadow] duration-200 ${className}`}
      style={{ ...style, transformStyle: "preserve-3d" }}
    >
      {/* Holographic shimmer */}
      <div
        className="pointer-events-none absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(105deg, transparent 40%, ${glowColor}08 45%, ${glowColor}15 50%, ${glowColor}08 55%, transparent 60%)`,
          backgroundSize: "200% 100%",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
