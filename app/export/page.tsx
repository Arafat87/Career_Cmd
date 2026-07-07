"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";
import ElectricBorder from "@/components/ElectricBorder";
import { fetchArray } from "@/lib/fetch-helpers";

export default function ExportPage() {
  const [data, setData] = useState<any>(null);
  const [printing, setPrinting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadPdf() {
    setDownloading(true);
    try {
      const res = await fetch("/api/export/pdf");
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `careercmd-resume-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDownloading(false);
    }
  }

  useEffect(() => {
    Promise.all([
      fetchArray("/api/jobtitles"),
      fetchArray("/api/certifications"),
      fetchArray("/api/projects"),
      fetchArray("/api/techstack"),
      fetchArray("/api/applications"),
    ]).then(([jobs, certs, projects, skills, apps]) => {
      setData({ jobs, certs, projects, skills, apps });
    });
  }, []);

  function handlePrint() {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 500);
  }

  if (!data) {
    return <div className="flex items-center justify-center h-64"><p className="text-sm font-mono text-muted">Loading profile data...</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between no-print">
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">
          EXPORT RESUME
        </GlowText>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="px-6 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">
            {printing ? "PRINTING..." : "PRINT / SAVE PDF"}
          </button>
          <ElectricBorder color="#00FF88">
            <button onClick={handleDownloadPdf} disabled={downloading} className="px-6 py-2 font-mono text-sm text-neon-green hover:bg-neon-green/10 transition-colors disabled:opacity-50">
              {downloading ? "GENERATING..." : "DOWNLOAD PDF"}
            </button>
          </ElectricBorder>
        </div>
      </div>

      {/* Resume Content */}
      <Card hover={false}>
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b border-[rgba(0,245,255,0.1)]">
          <h1 className="text-2xl font-mono font-bold text-neon-cyan">CAREER CMD OPERATOR</h1>
          <p className="text-sm font-mono text-muted mt-1">Infrastructure &bull; DevOps &bull; Cloud &bull; Cybersecurity</p>
        </div>

        {/* Skills */}
        {data.skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-mono font-bold text-neon-cyan/70 uppercase tracking-wider mb-3 border-b border-[rgba(0,245,255,0.08)] pb-1">Technical Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s: any) => (
                <span key={s.id} className="px-2 py-1 rounded text-xs font-mono border border-[rgba(0,245,255,0.15)] text-foreground/80">
                  {s.name} {s.proficiency_goal && `(${s.proficiency_goal})`}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {data.certs.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-mono font-bold text-neon-cyan/70 uppercase tracking-wider mb-3 border-b border-[rgba(0,245,255,0.08)] pb-1">Certifications</h2>
            <div className="space-y-2">
              {data.certs.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-mono text-foreground">{c.name}</span>
                    {c.category && <span className="text-xs font-mono text-muted ml-2">({c.category})</span>}
                  </div>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${c.status === "PASSED" ? "text-neon-green bg-neon-green/10" : "text-muted"}`}>
                    {c.status || "PLANNING"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-mono font-bold text-neon-cyan/70 uppercase tracking-wider mb-3 border-b border-[rgba(0,245,255,0.08)] pb-1">Projects</h2>
            <div className="space-y-3">
              {data.projects.map((p: any) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-semibold text-foreground">{p.name}</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${p.status === "DONE" ? "text-neon-green bg-neon-green/10" : p.status === "IN PROGRESS" ? "text-neon-purple bg-neon-purple/10" : "text-neon-cyan bg-neon-cyan/10"}`}>
                      {p.status}
                    </span>
                  </div>
                  {p.description && <p className="text-xs font-mono text-foreground/60 mt-1">{p.description}</p>}
                  {p.technologies && <p className="text-xs font-mono text-muted mt-1">Tech: {p.technologies}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Target Roles */}
        {data.jobs.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-mono font-bold text-neon-cyan/70 uppercase tracking-wider mb-3 border-b border-[rgba(0,245,255,0.08)] pb-1">Target Roles</h2>
            <div className="space-y-2">
              {data.jobs.map((j: any) => (
                <div key={j.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-mono text-foreground">{j.title}</span>
                    {j.company && <span className="text-xs font-mono text-muted ml-2">at {j.company}</span>}
                    {j.location && <span className="text-xs font-mono text-muted ml-2">({j.location})</span>}
                  </div>
                  {(j.salary_min > 0 || j.salary_max > 0) && (
                    <span className="text-xs font-mono text-neon-green">
                      ${j.salary_min.toLocaleString()} - ${j.salary_max.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Application History */}
        {data.apps.length > 0 && (
          <section>
            <h2 className="text-sm font-mono font-bold text-neon-cyan/70 uppercase tracking-wider mb-3 border-b border-[rgba(0,245,255,0.08)] pb-1">Application History</h2>
            <div className="space-y-2">
              {data.apps.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-mono text-foreground">{a.position}</span>
                    <span className="text-xs font-mono text-muted ml-2">at {a.company}</span>
                  </div>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${a.status === "OFFER" ? "text-neon-green bg-neon-green/10" : a.status === "REJECTED" ? "text-neon-red bg-neon-red/10" : "text-muted bg-muted/10"}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </Card>

      <p className="text-[10px] font-mono text-muted text-center no-print">
        Generated by CAREER CMD • Use browser print (Ctrl+P) to save as PDF
      </p>
    </div>
  );
}
