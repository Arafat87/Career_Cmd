"use client";

import { useMemo } from "react";

interface ActivityData {
  date: string;
  count: number;
}

function getColor(count: number, maxCount: number, color: string): string {
  if (count === 0) return "rgba(0,245,255,0.03)";
  const ratio = count / maxCount;
  if (ratio < 0.25) return `${color}20`;
  if (ratio < 0.5) return `${color}40`;
  if (ratio < 0.75) return `${color}70`;
  return color;
}

export default function ActivityHeatmap({
  data,
  color = "#00F5FF",
  weeks = 20,
}: {
  data: ActivityData[];
  color?: string;
  weeks?: number;
}) {
  const grid = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => map.set(d.date, d.count));
    const maxCount = Math.max(1, ...data.map((d) => d.count));

    const today = new Date();
    const days: { date: string; count: number; color: string; day: string }[] = [];

    for (let w = weeks - 1; w >= 0; w--) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        const key = date.toISOString().split("T")[0];
        const count = map.get(key) || 0;
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        days.push({ date: key, count, color: getColor(count, maxCount, color), day: dayNames[d] });
      }
    }
    return days;
  }, [data, weeks, color]);

  const total = data.reduce((s, d) => s + d.count, 0);
  const maxCount = Math.max(1, ...data.map((d) => d.count));

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono text-muted">{total} activities in {weeks} weeks</span>
      </div>
      <div className="flex gap-0.5 overflow-x-auto">
        {Array.from({ length: weeks }, (_, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {grid.slice(wi * 7, wi * 7 + 7).map((day, di) => (
              <div
                key={di}
                className="w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-150"
                style={{ backgroundColor: day.color }}
                title={`${day.date}: ${day.count} activities`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2">
        <span className="text-[8px] font-mono text-muted">Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <div key={ratio} className="w-3 h-3 rounded-sm" style={{ backgroundColor: ratio === 0 ? "rgba(0,245,255,0.03)" : getColor(ratio, 1, color) }} />
        ))}
        <span className="text-[8px] font-mono text-muted">More</span>
      </div>
    </div>
  );
}
