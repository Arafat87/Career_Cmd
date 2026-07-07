"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import ScoreRing from "@/components/ScoreRing";
import ElectricBorder from "@/components/ElectricBorder";

interface ScoreData {
  composite: number;
  breakdown: {
    skills: { score: number; weight: number; total: number };
    certs: { score: number; weight: number; passed: number; total: number };
    applications: { score: number; weight: number; active: number; total: number };
    portfolio: { score: number; weight: number; total: number };
    interviews: { score: number; weight: number; completed: number; total: number };
    learning: { score: number; weight: number; completed: number; total: number };
  };
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  skills: { label: "SKILLS", color: "#00F5FF" },
  certs: { label: "CERTIFICATIONS", color: "#BF00FF" },
  applications: { label: "APPLICATIONS", color: "#00FF88" },
  portfolio: { label: "PORTFOLIO", color: "#FFD700" },
  interviews: { label: "INTERVIEWS", color: "#FF8C00" },
  learning: { label: "LEARNING", color: "#FF2D55" },
};

export default function CareerScore() {
  const [data, setData] = useState<ScoreData | null>(null);

  useEffect(() => {
    fetch("/api/career-score").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return null;

  return (
    <Card hover={false}>
      <h3 className="text-sm font-mono text-neon-cyan/70 tracking-wider mb-4">CAREER SCORE</h3>
      <div className="flex items-center gap-6">
        <ElectricBorder
          color={data.composite >= 70 ? "#00FF88" : data.composite >= 40 ? "#00F5FF" : "#FF2D55"}
          speed={0.6}
          chaos={0.08}
          borderRadius={100}
        >
          <ScoreRing score={data.composite} />
        </ElectricBorder>
        <div className="flex-1 space-y-2">
          {Object.entries(data.breakdown).map(([key, val]) => {
            const meta = CATEGORY_LABELS[key];
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="w-28 text-[10px] font-mono text-right" style={{ color: meta.color }}>{meta.label}</span>
                <div className="flex-1 h-3 bg-[rgba(0,245,255,0.03)] rounded overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${val.score}%`, backgroundColor: meta.color + "40" }} />
                </div>
                <span className="w-8 text-[10px] font-mono text-muted text-right">{val.score}</span>
                <span className="w-6 text-[8px] font-mono text-muted/50 text-right">{val.weight}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
