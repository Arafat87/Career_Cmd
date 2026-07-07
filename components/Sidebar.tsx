"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: "pipeline",
    label: "PIPELINE",
    items: [
      { href: "/", label: "OVERVIEW", icon: "◆" },
      { href: "/daily-briefing", label: "DAILY BRIEFING", icon: "☀" },
      { href: "/applications", label: "APPLICATIONS", icon: "◉" },
      { href: "/saved-jobs", label: "SAVED JOBS", icon: "★" },
      { href: "/referrals", label: "REFERRALS", icon: "🔗" },
      { href: "/networking", label: "NETWORKING", icon: "👥" },
      { href: "/kanban", label: "KANBAN BOARD", icon: "▦" },
      { href: "/companies", label: "COMPANIES", icon: "🏢" },
    ],
  },
  {
    id: "prep",
    label: "PREP",
    items: [
      { href: "/interviews", label: "INTERVIEWS", icon: "🎤" },
      { href: "/questions", label: "QUESTION BANK", icon: "❓" },
      { href: "/flashcards", label: "FLASHCARDS", icon: "📇" },
      { href: "/interview-prep", label: "PREP MODE", icon: "🎯" },
      { href: "/whiteboard", label: "WHITEBOARD", icon: "🖊" },
      { href: "/focus", label: "FOCUS MODE", icon: "🎯" },
    ],
  },
  {
    id: "growth",
    label: "GROWTH",
    items: [
      { href: "/goals", label: "GOALS", icon: "🏁" },
      { href: "/roadmap", label: "ROADMAP", icon: "🗺" },
      { href: "/background", label: "BACKGROUND", icon: "👤" },
      { href: "/certifications", label: "CERTIFICATIONS", icon: "◈" },
      { href: "/projects", label: "PROJECTS", icon: "◇" },
      { href: "/portfolio", label: "PORTFOLIO", icon: "🖼" },
      { href: "/techstack", label: "TECH STACK", icon: "▣" },
      { href: "/learning", label: "LEARNING", icon: "📚" },
      { href: "/timeline", label: "TIMELINE", icon: "📅" },
    ],
  },
  {
    id: "data",
    label: "DATA",
    items: [
      { href: "/jobtitles", label: "JOB TARGETS", icon: "◎" },
      { href: "/salary", label: "SALARY DATA", icon: "$" },
      { href: "/salary-calculator", label: "SALARY CALC", icon: "🧮" },
      { href: "/offer-comparison", label: "OFFER COMPARE", icon: "⚖" },
      { href: "/documents", label: "DOCUMENTS", icon: "📄" },
      { href: "/reminders", label: "REMINDERS", icon: "⚡" },
      { href: "/calendar", label: "CALENDAR", icon: "▦" },
      { href: "/notes", label: "QUICK NOTES", icon: "✎" },
    ],
  },
  {
    id: "tools",
    label: "TOOLS",
    items: [
      { href: "/analytics", label: "ANALYTICS", icon: "⊞" },
      { href: "/gap-analysis", label: "GAP ANALYSIS", icon: "📊" },
      { href: "/templates", label: "TEMPLATES", icon: "📋" },
      { href: "/cover-letter", label: "COVER LETTER", icon: "✉" },
      { href: "/resume", label: "RESUME BUILDER", icon: "📝" },
      { href: "/email-templates", label: "EMAIL TEMPLATES", icon: "📧" },
      { href: "/share", label: "SHARE CARD", icon: "🎴" },
      { href: "/assistant", label: "AI ASSISTANT", icon: "✦" },
    ],
  },
  {
    id: "integrations",
    label: "INTEGRATIONS",
    items: [
      { href: "/integrations/github", label: "GITHUB", icon: "🐙" },
      { href: "/integrations/linkedin", label: "LINKEDIN", icon: "💼" },
      { href: "/integrations/job-rss", label: "JOB RSS", icon: "📡" },
      { href: "/integrations/google-calendar", label: "GOOGLE CAL", icon: "📅" },
      { href: "/mcp", label: "MCP HUB", icon: "⚡" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  // Find which group contains the active route, default it open
  const activeGroupId = navGroups.find((g) => g.items.some((i) => i.href === pathname))?.id || "pipeline";

  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set([activeGroupId]));

  // Auto-expand the group containing the active route on navigation
  useEffect(() => {
    const groupId = navGroups.find((g) => g.items.some((i) => i.href === pathname))?.id;
    if (groupId) {
      setOpenGroups((prev) => new Set([...prev, groupId]));
    }
  }, [pathname]);

  function toggleGroup(id: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="h-full bg-[#050508] border-r border-[rgba(0,245,255,0.08)] flex flex-col z-50">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-[rgba(0,245,255,0.08)]">
        <h1 className="text-xl font-mono font-bold text-neon-cyan/70 tracking-wider">
          CAREER CMD
        </h1>
        <p className="text-xs text-muted mt-1 font-mono">CAREER COMMAND CENTER</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="px-3 space-y-1">
          {navGroups.map((group) => {
            const isOpen = openGroups.has(group.id);
            const hasActive = group.items.some((i) => i.href === pathname);

            return (
              <div key={group.id}>
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${
                    hasActive
                      ? "text-neon-cyan/70"
                      : "text-muted/50 hover:text-muted"
                  }`}
                >
                  <span>{group.label}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-[8px]"
                  >
                    ▶
                  </motion.span>
                </button>

                {/* Group Items */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {group.items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-mono text-xs transition-all duration-200 ${
                                isActive
                                  ? "bg-[rgba(0,245,255,0.1)] text-neon-cyan border border-[rgba(0,245,255,0.2)]"
                                  : "text-muted hover:text-foreground hover:bg-[rgba(0,245,255,0.05)] border border-transparent"
                              }`}
                            >
                              <span className={`text-sm ${isActive ? "glow-cyan" : ""}`}>
                                {item.icon}
                              </span>
                              <span className={isActive ? "glow-cyan" : ""}>
                                {item.label}
                              </span>
                              {isActive && (
                                <motion.div
                                  layoutId="activeNav"
                                  className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse-glow"
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-[rgba(0,245,255,0.08)]">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg font-mono text-xs transition-all duration-200 ${
            pathname === "/settings"
              ? "bg-[rgba(0,245,255,0.1)] text-neon-cyan border border-[rgba(0,245,255,0.2)]"
              : "text-muted hover:text-foreground hover:bg-[rgba(0,245,255,0.05)] border border-transparent"
          }`}
        >
          <span className="text-sm">⚙</span>
          <span>SETTINGS</span>
          {pathname === "/settings" && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse-glow" />
          )}
        </Link>
      </div>

      {/* Status indicator */}
      <div className="p-4 border-t border-[rgba(0,245,255,0.08)]">
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse-glow" />
          <span>SYSTEMS ONLINE</span>
        </div>
      </div>
    </div>
  );
}
