"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";

interface ContextCounts {
  jobs: number;
  projects: number;
  skills: number;
  certs: number;
}

export default function ChatGreeting() {
  const [counts, setCounts] = useState<ContextCounts>({ jobs: 0, projects: 0, skills: 0, certs: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/jobtitles").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/techstack").then((r) => r.json()),
      fetch("/api/certifications").then((r) => r.json()),
    ]).then(([jobs, projects, skills, certs]) => {
      setCounts({
        jobs: Array.isArray(jobs) ? jobs.length : 0,
        projects: Array.isArray(projects) ? projects.length : 0,
        skills: Array.isArray(skills) ? skills.length : 0,
        certs: Array.isArray(certs) ? certs.length : 0,
      });
    });
  }, []);

  return (
    <Card hover={false} className="border-neon-cyan/10">
      <GlowText as="h3" color="cyan" className="text-sm font-mono tracking-wider">
        CAREER CMD AI // CHAT INTERFACE
      </GlowText>
      <div className="mt-2 h-px bg-gradient-to-r from-neon-cyan/30 via-neon-cyan/10 to-transparent" />
      <p className="mt-3 text-xs font-mono text-muted">
        Welcome, Operator. I am your AI assistant.
      </p>
      <div className="mt-3 space-y-1">
        <p className="text-[11px] font-mono text-muted">I can help you with:</p>
        {[
          "Career strategy and job search advice",
          "Resume and cover letter optimization",
          "Technical skill gap analysis",
          "Project planning and ideation",
          "Interview preparation",
        ].map((item) => (
          <p key={item} className="text-[11px] font-mono text-foreground/60 pl-3">
            ◇ {item}
          </p>
        ))}
      </div>
      <p className="mt-3 text-[11px] font-mono text-neon-green/70">
        Context loaded: {counts.jobs} job target{counts.jobs !== 1 ? "s" : ""},{" "}
        {counts.projects} project{counts.projects !== 1 ? "s" : ""},{" "}
        {counts.skills} skill{counts.skills !== 1 ? "s" : ""},{" "}
        {counts.certs} certification{counts.certs !== 1 ? "s" : ""}
      </p>
    </Card>
  );
}
