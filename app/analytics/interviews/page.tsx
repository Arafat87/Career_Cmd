"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import { fetchArray } from "@/lib/fetch-helpers";

interface Interview {
  id: number; company: string; position: string; round_type: string; date: string; status: string; feedback: string;
}

export default function InterviewAnalyticsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    fetchArray("/api/interviews").then((data) => setInterviews(data));
  }, []);

  const total = interviews.length;
  const scheduled = interviews.filter((i) => i.status === "SCHEDULED").length;
  const completed = interviews.filter((i) => i.status === "COMPLETED").length;
  const cancelled = interviews.filter((i) => i.status === "CANCELLED").length;

  // By round type
  const roundTypes = ["PHONE", "TECHNICAL", "BEHAVIORAL", "ONSITE", "FINAL"];
  const byRound = roundTypes.map((r) => ({
    type: r,
    total: interviews.filter((i) => i.round_type === r).length,
    completed: interviews.filter((i) => i.round_type === r && i.status === "COMPLETED").length,
  }));

  // By company
  const companies = [...new Set(interviews.map((i) => i.company))].slice(0, 10);
  const byCompany = companies.map((c) => ({
    company: c,
    total: interviews.filter((i) => i.company === c).length,
    completed: interviews.filter((i) => i.company === c && i.status === "COMPLETED").length,
  }));

  const ROUND_COLORS: Record<string, string> = { PHONE: "#00F5FF", TECHNICAL: "#BF00FF", BEHAVIORAL: "#FFD700", ONSITE: "#00FF88", FINAL: "#FF2D55" };

  return (
    <AnimatedContainer className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "TOTAL", value: total, color: "cyan" },
          { label: "SCHEDULED", value: scheduled, color: "yellow" },
          { label: "COMPLETED", value: completed, color: "green" },
          { label: "CANCELLED", value: cancelled, color: "red" },
        ].map((s) => (
          <Card key={s.label} hover={false}>
            <p className="text-xs font-mono text-muted">{s.label}</p>
            <p className={`text-2xl font-mono font-bold mt-1 text-neon-${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Round Type */}
        <Card hover={false}>
          <h3 className="text-sm font-mono text-neon-cyan/70 tracking-wider mb-4">BY ROUND TYPE</h3>
          <div className="space-y-3">
            {byRound.filter((r) => r.total > 0).map((r) => (
              <div key={r.type} className="flex items-center gap-3">
                <span className="w-20 text-xs font-mono text-right" style={{ color: ROUND_COLORS[r.type] }}>{r.type}</span>
                <div className="flex-1 h-5 bg-[rgba(0,245,255,0.03)] rounded overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${(r.total / Math.max(total, 1)) * 100}%`, backgroundColor: ROUND_COLORS[r.type] + "40" }} />
                </div>
                <span className="w-12 text-[10px] font-mono text-muted text-right">{r.completed}/{r.total}</span>
              </div>
            ))}
            {byRound.every((r) => r.total === 0) && <p className="text-xs font-mono text-muted">No interviews yet</p>}
          </div>
        </Card>

        {/* By Company */}
        <Card hover={false}>
          <h3 className="text-sm font-mono text-neon-cyan/70 tracking-wider mb-4">BY COMPANY</h3>
          <div className="space-y-3">
            {byCompany.map((c) => (
              <div key={c.company} className="flex items-center gap-3">
                <span className="w-28 text-xs font-mono text-foreground truncate">{c.company}</span>
                <div className="flex-1 h-5 bg-[rgba(0,245,255,0.03)] rounded overflow-hidden">
                  <div className="h-full rounded bg-neon-cyan/30" style={{ width: `${(c.total / Math.max(total, 1)) * 100}%` }} />
                </div>
                <span className="w-12 text-[10px] font-mono text-muted text-right">{c.completed}/{c.total}</span>
              </div>
            ))}
            {companies.length === 0 && <p className="text-xs font-mono text-muted">No interviews yet</p>}
          </div>
        </Card>
      </div>
    </AnimatedContainer>
  );
}
