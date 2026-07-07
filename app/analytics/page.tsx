"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import { fetchJson } from "@/lib/fetch-helpers";
import CareerScore from "@/components/CareerScore";

interface AnalyticsData {
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  totalCertifications: number;
  certsByStatus: Record<string, number>;
  totalProjects: number;
  projectsByStatus: Record<string, number>;
  totalSkills: number;
  totalJobTargets: number;
  salaryRanges: Array<{ title: string; min: number; max: number }>;
  skillsCoverage: Array<{ skill: string; category: string; demand: number }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchJson("/api/analytics").then((d) => { if (d) setData(d); });
  }, []);

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} hover={false}><div className="h-32 animate-pulse bg-[rgba(0,245,255,0.03)] rounded" /></Card>
        ))}
      </div>
    );
  }

  const appStages = ["APPLIED", "PHONE SCREEN", "INTERVIEW", "OFFER"];
  const appColors = ["#00F5FF", "#BF00FF", "#FFD700", "#00FF88"];
  const maxAppCount = Math.max(...appStages.map((s) => data.applicationsByStatus[s] || 0), 1);

  const projectStatuses = ["TODO", "IN PROGRESS", "DONE"];
  const projectColors = ["#00F5FF", "#BF00FF", "#00FF88"];

  const topSkills = [...data.skillsCoverage].sort((a, b) => b.demand - a.demand).slice(0, 12);
  const maxDemand = Math.max(...topSkills.map((s) => s.demand), 1);

  return (
    <AnimatedContainer>
      {/* Career Score */}
      <CareerScore />

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "APPLICATIONS", value: data.totalApplications, color: "cyan" },
          { label: "CERTIFICATIONS", value: data.totalCertifications, color: "purple" },
          { label: "PROJECTS", value: data.totalProjects, color: "green" },
          { label: "SKILLS", value: data.totalSkills, color: "yellow" },
        ].map((stat) => (
          <AnimatedItem key={stat.label}>
            <Card hover={false}>
              <p className="text-xs font-mono text-muted uppercase">{stat.label}</p>
              <p className={`text-2xl font-mono font-bold mt-1 text-neon-${stat.color}`}>{stat.value}</p>
            </Card>
          </AnimatedItem>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Funnel */}
        <Card hover={false}>
          <h3 className="text-sm font-mono text-neon-cyan/70 tracking-wider mb-4">APPLICATION FUNNEL</h3>
          <div className="space-y-3">
            {appStages.map((stage, i) => {
              const count = data.applicationsByStatus[stage] || 0;
              const width = maxAppCount > 0 ? (count / maxAppCount) * 100 : 0;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="w-24 text-xs font-mono text-muted text-right">{stage}</span>
                  <div className="flex-1 h-6 bg-[rgba(0,245,255,0.03)] rounded overflow-hidden">
                    <div className="h-full rounded transition-all duration-500" style={{ width: `${width}%`, backgroundColor: appColors[i] + "60" }} />
                  </div>
                  <span className="w-8 text-xs font-mono text-foreground text-right">{count}</span>
                </div>
              );
            })}
          </div>
          {data.totalApplications === 0 && <p className="text-xs font-mono text-muted text-center mt-4">No applications tracked yet</p>}
        </Card>

        {/* Project Status */}
        <Card hover={false}>
          <h3 className="text-sm font-mono text-neon-cyan/70 tracking-wider mb-4">PROJECT STATUS</h3>
          <div className="flex items-center justify-center gap-8 py-4">
            {projectStatuses.map((status, i) => {
              const count = data.projectsByStatus[status] || 0;
              const total = data.totalProjects || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status} className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(0,245,255,0.05)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15" fill="none" stroke={projectColors[i]} strokeWidth="3"
                        strokeDasharray={`${pct * 0.94} 100`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-mono font-bold" style={{ color: projectColors[i] }}>{count}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted uppercase">{status}</span>
                </div>
              );
            })}
          </div>
          {data.totalProjects === 0 && <p className="text-xs font-mono text-muted text-center">No projects yet</p>}
        </Card>

        {/* Skills Demand */}
        <Card hover={false}>
          <h3 className="text-sm font-mono text-neon-cyan/70 tracking-wider mb-4">SKILLS DEMAND</h3>
          <div className="space-y-2">
            {topSkills.map((skill) => (
              <div key={skill.skill} className="flex items-center gap-3">
                <span className="w-28 text-xs font-mono text-foreground truncate text-right">{skill.skill}</span>
                <div className="flex-1 h-4 bg-[rgba(0,245,255,0.03)] rounded overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${(skill.demand / maxDemand) * 100}%`, backgroundColor: "rgba(0,245,255,0.3)" }} />
                </div>
                <span className="w-6 text-[10px] font-mono text-muted text-right">{skill.demand}</span>
              </div>
            ))}
          </div>
          {topSkills.length === 0 && <p className="text-xs font-mono text-muted text-center">Add skills and job targets to see demand</p>}
        </Card>

        {/* Skills Heatmap */}
        <Card hover={false}>
          <h3 className="text-sm font-mono text-neon-cyan/70 tracking-wider mb-4">SKILLS HEATMAP</h3>
          {data.skillsCoverage.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5">
              {data.skillsCoverage.map((skill) => {
                const intensity = skill.demand === 0 ? 0.03 : skill.demand <= 2 ? 0.1 : skill.demand <= 5 ? 0.2 : 0.35;
                return (
                  <div key={skill.skill} className="p-2 rounded text-center" style={{ backgroundColor: `rgba(0,245,255,${intensity})` }}>
                    <p className="text-[10px] font-mono text-foreground truncate">{skill.skill}</p>
                    <p className="text-[8px] font-mono text-muted">{skill.demand} demand</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs font-mono text-muted text-center">Add skills to see the heatmap</p>
          )}
        </Card>

        {/* Cert Progress */}
        <Card hover={false}>
          <h3 className="text-sm font-mono text-neon-cyan/70 tracking-wider mb-4">CERTIFICATION PROGRESS</h3>
          {data.totalCertifications > 0 ? (
            <div className="space-y-3">
              {Object.entries(data.certsByStatus).map(([status, count]) => {
                const pct = Math.round((count / data.totalCertifications) * 100);
                const color = status === "PASSED" ? "#00FF88" : status === "STUDYING" ? "#BF00FF" : status === "SCHEDULED" ? "#FFD700" : status === "EXPIRED" ? "#FF2D55" : "#00F5FF";
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-muted">{status}</span>
                      <span className="text-xs font-mono" style={{ color }}>{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-[rgba(0,245,255,0.03)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color + "60" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs font-mono text-muted text-center">No certifications yet</p>
          )}
        </Card>

        {/* Salary Distribution */}
        <Card hover={false}>
          <h3 className="text-sm font-mono text-neon-cyan/70 tracking-wider mb-4">SALARY RANGES</h3>
          {data.salaryRanges.length > 0 ? (
            <div className="space-y-2">
              {data.salaryRanges.sort((a, b) => b.max - a.max).slice(0, 8).map((r) => {
                const maxS = Math.max(...data.salaryRanges.map((s) => s.max), 1);
                return (
                  <div key={r.title} className="flex items-center gap-3">
                    <span className="w-32 text-xs font-mono text-foreground truncate text-right">{r.title}</span>
                    <div className="flex-1 h-4 bg-[rgba(0,245,255,0.03)] rounded overflow-hidden">
                      <div className="h-full rounded" style={{ width: `${(r.max / maxS) * 100}%`, background: "linear-gradient(90deg, rgba(0,245,255,0.2), rgba(0,255,136,0.3))" }} />
                    </div>
                    <span className="w-24 text-[10px] font-mono text-muted text-right">${r.min.toLocaleString()} - ${r.max.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs font-mono text-muted text-center">Add job targets with salary data</p>
          )}
        </Card>
      </div>
    </AnimatedContainer>
  );
}
