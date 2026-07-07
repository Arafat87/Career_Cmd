"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import ElectricBorder from "@/components/ElectricBorder";
import { fetchArray } from "@/lib/fetch-helpers";

interface JobTitle {
  id: number;
  title: string;
  company: string;
  category: string;
  location: string;
  salary_min: number;
  salary_max: number;
}

export default function SalaryPage() {
  const [jobs, setJobs] = useState<JobTitle[]>([]);
  const [marketQuery, setMarketQuery] = useState("");
  const [marketLocation, setMarketLocation] = useState("Remote");
  const [marketResults, setMarketResults] = useState<any>(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState("");

  useEffect(() => {
    fetchArray("/api/jobtitles").then((data) => {
      setJobs((data as JobTitle[]).filter((j: JobTitle) => j.salary_max > 0));
    });
  }, []);

  async function handleMarketLookup() {
    if (!marketQuery.trim()) return;
    setMarketLoading(true); setMarketError(""); setMarketResults(null);
    try {
      const res = await fetch(`/api/salary/market?role=${encodeURIComponent(marketQuery)}&location=${encodeURIComponent(marketLocation)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMarketResults(data);
    } catch (e: any) { setMarketError(e.message); } finally { setMarketLoading(false); }
  }

  const totalMin = jobs.reduce((sum, j) => sum + j.salary_min, 0);
  const totalMax = jobs.reduce((sum, j) => sum + j.salary_max, 0);
  const avgMin = jobs.length ? Math.round(totalMin / jobs.length) : 0;
  const avgMax = jobs.length ? Math.round(totalMax / jobs.length) : 0;
  const maxSalary = Math.max(...jobs.map((j) => j.salary_max), 1);

  // Group by category
  const byCategory: Record<string, JobTitle[]> = {};
  jobs.forEach((j) => {
    const cat = j.category || "Uncategorized";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(j);
  });

  const categoryStats = Object.entries(byCategory).map(([cat, items]) => ({
    category: cat,
    count: items.length,
    avgMin: Math.round(items.reduce((s, j) => s + j.salary_min, 0) / items.length),
    avgMax: Math.round(items.reduce((s, j) => s + j.salary_max, 0) / items.length),
  }));

  return (
    <AnimatedContainer>
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "ROLES", value: jobs.length, color: "cyan" },
          { label: "AVG MIN", value: `$${avgMin.toLocaleString()}`, color: "purple" },
          { label: "AVG MAX", value: `$${avgMax.toLocaleString()}`, color: "green" },
          { label: "HIGHEST", value: `$${Math.max(...jobs.map((j) => j.salary_max), 0).toLocaleString()}`, color: "yellow" },
        ].map((stat) => (
          <AnimatedItem key={stat.label}>
            <Card hover={false}>
              <p className="text-xs font-mono text-muted uppercase">{stat.label}</p>
              <p className={`text-lg font-mono font-bold mt-1 text-neon-${stat.color}`}>
                {stat.value}
              </p>
            </Card>
          </AnimatedItem>
        ))}
      </div>

      {/* Bar chart */}
      <Card hover={false} className="mb-8">
        <h3 className="text-sm font-mono text-neon-cyan/70 tracking-wider mb-4">SALARY RANGES</h3>
        <div className="space-y-3">
          {jobs.sort((a, b) => b.salary_max - a.salary_max).map((job) => (
            <div key={job.id} className="flex items-center gap-4">
              <div className="w-48 flex-shrink-0">
                <p className="text-xs font-mono text-foreground truncate">{job.title}</p>
                <p className="text-[10px] font-mono text-muted truncate">{job.company}</p>
              </div>
              <div className="flex-1 relative h-6 bg-[rgba(0,245,255,0.03)] rounded overflow-hidden">
                <div
                  className="absolute h-full rounded"
                  style={{
                    left: `${(job.salary_min / maxSalary) * 100}%`,
                    width: `${((job.salary_max - job.salary_min) / maxSalary) * 100}%`,
                    background: `linear-gradient(90deg, rgba(0,245,255,0.3), rgba(0,255,136,0.4))`,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-mono text-foreground/70">
                    ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {jobs.length === 0 && (
          <p className="text-sm font-mono text-muted text-center py-8">No salary data. Add job targets with salary ranges!</p>
        )}
      </Card>

      {/* Category breakdown */}
      {categoryStats.length > 0 && (
        <Card hover={false}>
          <h3 className="text-sm font-mono text-neon-cyan/70 tracking-wider mb-4">BY CATEGORY</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map((cat) => (
              <div key={cat.category} className="p-3 rounded-lg bg-[rgba(0,245,255,0.02)] border border-[rgba(0,245,255,0.08)]">
                <p className="text-xs font-mono font-semibold text-foreground">{cat.category}</p>
                <p className="text-[10px] font-mono text-muted mt-1">{cat.count} role{cat.count !== 1 ? "s" : ""}</p>
                <p className="text-sm font-mono text-neon-green mt-2">
                  ${cat.avgMin.toLocaleString()} - ${cat.avgMax.toLocaleString()}
                </p>
                <p className="text-[10px] font-mono text-muted">average range</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Market Salary Lookup */}
      <div className="mt-8">
        <h3 className="text-xs font-mono text-muted/50 uppercase tracking-widest mb-4">MARKET DATA (Levels.fyi / Glassdoor)</h3>
        <Card hover={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={marketQuery}
              onChange={(e) => setMarketQuery(e.target.value)}
              placeholder="Job title (e.g., DevOps Engineer)..."
              className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted"
            />
            <input
              value={marketLocation}
              onChange={(e) => setMarketLocation(e.target.value)}
              placeholder="Location..."
              className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted"
            />
            <ElectricBorder color="#FF8C00">
              <button
                onClick={handleMarketLookup}
                disabled={marketLoading || !marketQuery.trim()}
                className="w-full px-4 py-2 font-mono text-sm text-[#FF8C00] hover:bg-[#FF8C00]/10 transition-colors disabled:opacity-50"
              >
                {marketLoading ? "SEARCHING..." : "LOOKUP MARKET DATA"}
              </button>
            </ElectricBorder>
          </div>
          {marketError && <p className="text-sm font-mono text-neon-red mt-2">{marketError}</p>}
        </Card>

        {marketResults && (
          <AnimatedItem>
            <Card hover={false} className="mt-4">
              <h3 className="text-xs font-mono text-[#FF8C00] uppercase tracking-widest mb-3">
                MARKET RESULTS: {marketResults.role} — {marketResults.location}
              </h3>
              {marketResults.extracted_salaries?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-mono text-muted/60 mb-2">SALARY RANGES FOUND:</p>
                  <div className="flex flex-wrap gap-2">
                    {marketResults.extracted_salaries.map((s: string, i: number) => (
                      <span key={i} className="px-2 py-1 text-xs font-mono bg-[#FF8C00]/10 border border-[#FF8C00]/20 rounded text-[#FF8C00]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {marketResults.results?.length > 0 && (
                <div className="space-y-3">
                  {marketResults.results.map((r: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 text-xs font-mono">
                      <span className="w-2 h-2 rounded-full bg-[#FF8C00] shrink-0 mt-1.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate">{r.title}</p>
                        {r.snippet && <p className="text-muted/50 mt-0.5 line-clamp-2">{r.snippet}</p>}
                      </div>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[#FF8C00]/60 hover:text-[#FF8C00] shrink-0">
                        OPEN
                      </a>
                    </div>
                  ))}
                </div>
              )}
              {marketResults.results?.length === 0 && (
                <p className="text-sm font-mono text-muted text-center py-4">No market data found. Try a different role or location.</p>
              )}
            </Card>
          </AnimatedItem>
        )}
      </div>
    </AnimatedContainer>
  );
}
