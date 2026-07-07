"use client";

import { useMemo } from "react";

interface RadarDataPoint {
  label: string;
  value: number;
  max?: number;
}

export default function RadarChart({
  data,
  size = 200,
  color = "#00F5FF",
  fillColor,
}: {
  data: RadarDataPoint[];
  size?: number;
  color?: string;
  fillColor?: string;
}) {
  const center = size / 2;
  const radius = size / 2 - 30;
  const levels = 5;

  const points = useMemo(() => {
    const angleStep = (2 * Math.PI) / data.length;
    return data.map((d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (d.value / (d.max || 100)) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        labelX: center + (radius + 18) * Math.cos(angle),
        labelY: center + (radius + 18) * Math.sin(angle),
        label: d.label,
        value: d.value,
      };
    });
  }, [data, center, radius]);

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  const gridPolygons = useMemo(() => {
    return Array.from({ length: levels }, (_, level) => {
      const r = ((level + 1) / levels) * radius;
      const angleStep = (2 * Math.PI) / data.length;
      return Array.from({ length: data.length }, (_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
      }).join(" ");
    });
  }, [data.length, center, radius]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid */}
      {gridPolygons.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgba(0,245,255,0.08)" strokeWidth="1" />
      ))}
      {/* Axes */}
      {points.map((p, i) => (
        <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(0,245,255,0.1)" strokeWidth="1" />
      ))}
      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill={fillColor || `${color}15`}
        stroke={color}
        strokeWidth="2"
        style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
      />
      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
      ))}
      {/* Labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.labelX}
          y={p.labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted text-[8px] font-mono"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}
