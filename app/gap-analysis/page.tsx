"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import { fetchJson, fetchArray } from "@/lib/fetch-helpers";

interface GapData {
  covered: Array<{ skill: string; demand: number }>;
  missing: Array<{ skill: string; demand: number }>;
  totalDemand: number;
  coveragePct: number;
}

export default function GapAnalysisPage() {
  const [data, setData] = useState<GapData | null>(null);

  useEffect(() => {
    fetchJson("/api/analytics").then((analytics) => {
      if (!analytics) return;
      // Compute gap from analytics data
      const skills = analytics.skillsCoverage || [];
      const demand: Record<string, number> = {};
      skills.forEach((s: any) => { if (s.demand > 0) demand[s.skill.toLowerCase()] = s.demand; });

      const covered = skills.filter((s: any) => s.demand > 0).map((s: any) => ({ skill: s.skill, demand: s.demand }));
      const missing = skills.filter((s: any) => s.demand === 0).map((s: any) => ({ skill: s.skill, demand: 0 }));

      // Also fetch job targets to compute true gaps
      fetchArray("/api/jobtitles").then((jobs) => {
        const allDemand: Record<string, number> = {};
        jobs.forEach((j: any) => {
          if (j.tech_stack) {
            j.tech_stack.split(",").forEach((s: string) => {
              const trimmed = s.trim().toLowerCase();
              if (trimmed) allDemand[trimmed] = (allDemand[trimmed] || 0) + 1;
            });
          }
        });

        const skillSet = new Set(skills.map((s: any) => s.skill.toLowerCase()));
        const trueCovered = Object.entries(allDemand).filter(([s]) => skillSet.has(s)).map(([s, d]) => ({ skill: s, demand: d as number })).sort((a, b) => b.demand - a.demand);
        const trueMissing = Object.entries(allDemand).filter(([s]) => !skillSet.has(s)).map(([s, d]) => ({ skill: s, demand: d as number })).sort((a, b) => b.demand - a.demand);

        setData({
          covered: trueCovered,
          missing: trueMissing,
          totalDemand: Object.keys(allDemand).length,
          coveragePct: Object.keys(allDemand).length > 0 ? Math.round((trueCovered.length / Object.keys(allDemand).length) * 100) : 0,
        });
      });
    });
  }, []);

  if (!data) return <div className="flex items-center justify-center h-64"><p className="text-sm font-mono text-muted">Loading gap analysis...</p></div>;

  const maxDemand = Math.max(...data.covered.map((s) => s.demand), ...data.missing.map((s) => s.demand), 1);

  return (
    <AnimatedContainer className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hover={false}>
          <p className="text-xs font-mono text-muted">COVERAGE</p>
          <p className="text-3xl font-mono font-bold text-neon-cyan mt-1">{data.coveragePct}%</p>
          <div className="w-full h-2 bg-[rgba(0,245,255,0.05)] rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-neon-cyan/40 rounded-full" style={{ width: `${data.coveragePct}%` }} />
          </div>
        </Card>
        <Card hover={false}>
          <p className="text-xs font-mono text-muted">COVERED SKILLS</p>
          <p className="text-3xl font-mono font-bold text-neon-green mt-1">{data.covered.length}</p>
          <p className="text-[10px] font-mono text-muted mt-1">matching job targets</p>
        </Card>
        <Card hover={false}>
          <p className="text-xs font-mono text-muted">MISSING SKILLS</p>
          <p className="text-3xl font-mono font-bold text-neon-red mt-1">{data.missing.length}</p>
          <p className="text-[10px] font-mono text-muted mt-1">in demand but not in your stack</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Covered */}
        <Card hover={false}>
          <h3 className="text-sm font-mono text-neon-green/70 tracking-wider mb-4">COVERED SKILLS</h3>
          <div className="space-y-2">
            {data.covered.map((s) => (
              <div key={s.skill} className="flex items-center gap-3">
                <span className="w-28 text-xs font-mono text-foreground capitalize truncate">{s.skill}</span>
                <div className="flex-1 h-4 bg-[rgba(0,255,136,0.03)] rounded overflow-hidden">
                  <div className="h-full rounded bg-neon-green/30" style={{ width: `${(s.demand / maxDemand) * 100}%` }} />
                </div>
                <span className="w-6 text-[10px] font-mono text-muted text-right">{s.demand}</span>
              </div>
            ))}
            {data.covered.length === 0 && <p className="text-xs font-mono text-muted">No covered skills found</p>}
          </div>
        </Card>

        {/* Missing */}
        <Card hover={false}>
          <h3 className="text-sm font-mono text-neon-red/70 tracking-wider mb-4">MISSING SKILLS</h3>
          <div className="space-y-2">
            {data.missing.map((s) => (
              <div key={s.skill} className="flex items-center gap-3">
                <span className="w-28 text-xs font-mono text-foreground capitalize truncate">{s.skill}</span>
                <div className="flex-1 h-4 bg-[rgba(255,45,85,0.03)] rounded overflow-hidden">
                  <div className="h-full rounded bg-neon-red/30" style={{ width: `${(s.demand / maxDemand) * 100}%` }} />
                </div>
                <span className="w-6 text-[10px] font-mono text-muted text-right">{s.demand}</span>
              </div>
            ))}
            {data.missing.length === 0 && <p className="text-xs font-mono text-muted">No missing skills — great coverage!</p>}
          </div>
        </Card>
      </div>
    </AnimatedContainer>
  );
}
