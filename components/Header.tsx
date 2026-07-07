"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import UserMenu from "./UserMenu";

const pageTitles: Record<string, string> = {
  "/": "OVERVIEW",
  "/daily-briefing": "DAILY BRIEFING",
  "/applications": "APPLICATIONS",
  "/saved-jobs": "SAVED JOBS",
  "/referrals": "REFERRALS",
  "/networking": "NETWORKING",
  "/interviews": "INTERVIEWS",
  "/questions": "QUESTION BANK",
  "/flashcards": "FLASHCARDS",
  "/interview-prep": "INTERVIEW PREP",
  "/whiteboard": "WHITEBOARD",
  "/focus": "FOCUS MODE",
  "/goals": "GOAL TRACKER",
  "/certifications": "CERTIFICATIONS",
  "/projects": "PROJECTS",
  "/portfolio": "PORTFOLIO",
  "/documents": "DOCUMENTS",
  "/learning": "LEARNING PATHS",
  "/achievements": "ACHIEVEMENTS",
  "/techstack": "TECH STACK",
  "/timeline": "CAREER TIMELINE",
  "/jobtitles": "JOB TARGETS",
  "/salary": "SALARY DATA",
  "/salary-calculator": "SALARY CALCULATOR",
  "/offer-comparison": "OFFER COMPARISON",
  "/companies": "COMPANY RESEARCH",
  "/reminders": "REMINDERS",
  "/calendar": "CALENDAR",
  "/notes": "QUICK NOTES",
  "/analytics": "ANALYTICS",
  "/analytics/interviews": "INTERVIEW ANALYTICS",
  "/gap-analysis": "GAP ANALYSIS",
  "/kanban": "KANBAN BOARD",
  "/templates": "TEMPLATES",
  "/cover-letter": "COVER LETTER",
  "/resume": "RESUME BUILDER",
  "/email-templates": "EMAIL TEMPLATES",
  "/share": "SHARE CARD",
  "/integrations/github": "GITHUB SYNC",
  "/integrations/linkedin": "LINKEDIN IMPORT",
  "/integrations/job-rss": "JOB BOARD RSS",
  "/assistant": "AI ASSISTANT",
  "/settings": "SETTINGS",
};

export default function Header() {
  const pathname = usePathname();
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
      setDate(now.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const title = pageTitles[pathname] || "DASHBOARD";

  return (
    <header className="sticky top-0 z-40 bg-[#050508]/90 backdrop-blur-sm border-b border-[rgba(0,245,255,0.08)]">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-mono font-semibold text-foreground tracking-wide">
            {title}
          </h2>
          <span className="text-muted text-xs font-mono">|</span>
          <span className="text-muted text-xs font-mono">MISSION CONTROL</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs font-mono text-muted uppercase">{date}</p>
            <p className="text-sm font-mono text-neon-cyan glow-cyan">{time}</p>
          </div>
          <UserMenu />
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
    </header>
  );
}
