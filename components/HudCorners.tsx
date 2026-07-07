"use client";

import { ReactNode } from "react";

export default function HudCorners({
  children,
  color = "#00F5FF",
  size = 12,
  thickness = 2,
  className = "",
}: {
  children: ReactNode;
  color?: string;
  size?: number;
  thickness?: number;
  className?: string;
}) {
  const cornerStyle = (pos: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      width: size,
      height: size,
      borderColor: color,
      opacity: 0.5,
    };
    if (pos.includes("top")) base.top = -1;
    if (pos.includes("bottom")) base.bottom = -1;
    if (pos.includes("left")) { base.left = -1; }
    if (pos.includes("right")) { base.right = -1; }
    return base;
  };

  return (
    <div className={`relative ${className}`}>
      <div style={{ ...cornerStyle("top-left"), borderTopWidth: thickness, borderLeftWidth: thickness, borderStyle: "solid" }} />
      <div style={{ ...cornerStyle("top-right"), borderTopWidth: thickness, borderRightWidth: thickness, borderStyle: "solid" }} />
      <div style={{ ...cornerStyle("bottom-left"), borderBottomWidth: thickness, borderLeftWidth: thickness, borderStyle: "solid" }} />
      <div style={{ ...cornerStyle("bottom-right"), borderBottomWidth: thickness, borderRightWidth: thickness, borderStyle: "solid" }} />
      {children}
    </div>
  );
}
