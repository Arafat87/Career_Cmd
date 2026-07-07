"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import CountdownTimer from "@/components/CountdownTimer";
import { fetchArray } from "@/lib/fetch-helpers";

export default function DailyBriefingPage() {
  const [briefing, setBriefing] = useState<{
    pendingApps: number;
    upcomingInterviews: any[];
    overdueTasks: number;
    certsExpiring: number;
    questionsDue: number;
    goalsInProgress: number;
    recentActivity: string[];
  } | null>(null);

  useEffect(() => {
    async function load() {
      const [apps, interviews, questions, goals] = await Promise.all([
        fetchArray("/api/applications"),
        fetchArray("/api/interviews"),
        fetchArray("/api/questions"),
        fetchArray("/api/goals"),
      ]);

      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 86400000);

      const upcoming = (interviews as any[])
        .filter((i: any) => new Date(i.date) >= now && new Date(i.date) <= weekFromNow)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const totalPractice = (questions as any[]).reduce((s: number, q: any) => s + (q.times_practiced || 0), 0);

      setBriefing({
        pendingApps: (apps as any[]).filter((a: any) => a.status === "APPLIED" || a.status === "PENDING").length,
        upcomingInterviews: upcoming,
        overdueTasks: 0,
        certsExpiring: 0,
        questionsDue: Math.max(0, 20 - totalPractice),
        goalsInProgress: (goals as any[]).filter((g: any) => g.status === "IN PROGRESS").length,
        recentActivity: [
          `${(apps as any[]).length} total applications tracked`,
          `${(interviews as any[]).length} interviews logged`,
          `${totalPractice} questions practiced`,
        ],
      });
    }
    load();
  }, []);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <AnimatedContainer className="space-y-6">
      <div>
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">DAILY BRIEFING</GlowText>
        <p className="text-xs font-mono text-muted mt-1">{greeting}, Operator. {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
      </div>

      {briefing && (
        <>
          {/* Priority Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {briefing.pendingApps > 0 && (
              <AnimatedItem>
                <Card hover={false} className="border-neon-cyan/20">
                  <p className="text-lg font-mono font-bold text-neon-cyan">{briefing.pendingApps}</p>
                  <p className="text-[10px] font-mono text-muted">APPLICATIONS PENDING RESPONSE</p>
                </Card>
              </AnimatedItem>
            )}
            {briefing.upcomingInterviews.length > 0 && (
              <AnimatedItem>
                <Card hover={false} className="border-neon-purple/20">
                  <p className="text-lg font-mono font-bold text-neon-purple">{briefing.upcomingInterviews.length}</p>
                  <p className="text-[10px] font-mono text-muted">INTERVIEWS THIS WEEK</p>
                </Card>
              </AnimatedItem>
            )}
            {briefing.goalsInProgress > 0 && (
              <AnimatedItem>
                <Card hover={false} className="border-neon-green/20">
                  <p className="text-lg font-mono font-bold text-neon-green">{briefing.goalsInProgress}</p>
                  <p className="text-[10px] font-mono text-muted">GOALS IN PROGRESS</p>
                </Card>
              </AnimatedItem>
            )}
          </div>

          {/* Upcoming Interviews */}
          {briefing.upcomingInterviews.length > 0 && (
            <Card hover={false}>
              <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-3">UPCOMING INTERVIEWS</h3>
              <div className="space-y-2">
                {briefing.upcomingInterviews.map((i: any) => (
                  <div key={i.id} className="flex items-center justify-between p-3 rounded-lg border border-neon-purple/10">
                    <div>
                      <p className="text-sm font-mono text-foreground">{i.type || "Interview"} @ {i.company}</p>
                      <p className="text-[10px] font-mono text-muted">{i.position || ""}</p>
                    </div>
                    <CountdownTimer target={new Date(i.date)} color="#BF00FF" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Quick Actions */}
          <Card hover={false}>
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-3">RECOMMENDED ACTIONS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {briefing.pendingApps > 0 && (
                <a href="/applications" className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(0,245,255,0.08)] hover:bg-[rgba(0,245,255,0.03)] transition-colors">
                  <span className="text-lg">📤</span>
                  <div>
                    <p className="text-xs font-mono text-foreground">Follow up on {briefing.pendingApps} pending application{briefing.pendingApps > 1 ? "s" : ""}</p>
                    <p className="text-[9px] font-mono text-muted">Check for responses or send follow-ups</p>
                  </div>
                </a>
              )}
              {briefing.questionsDue > 0 && (
                <a href="/questions" className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(0,245,255,0.08)] hover:bg-[rgba(0,245,255,0.03)] transition-colors">
                  <span className="text-lg">🧠</span>
                  <div>
                    <p className="text-xs font-mono text-foreground">Practice {briefing.questionsDue} interview questions</p>
                    <p className="text-[9px] font-mono text-muted">Keep your skills sharp</p>
                  </div>
                </a>
              )}
              <a href="/flashcards" className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(0,245,255,0.08)] hover:bg-[rgba(0,245,255,0.03)] transition-colors">
                <span className="text-lg">📇</span>
                <div>
                  <p className="text-xs font-mono text-foreground">Review flashcards</p>
                  <p className="text-[9px] font-mono text-muted">Spaced repetition keeps knowledge fresh</p>
                </div>
              </a>
              <a href="/focus" className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(0,245,255,0.08)] hover:bg-[rgba(0,245,255,0.03)] transition-colors">
                <span className="text-lg">🎯</span>
                <div>
                  <p className="text-xs font-mono text-foreground">Start a focus session</p>
                  <p className="text-[9px] font-mono text-muted">Deep work on your most important task</p>
                </div>
              </a>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card hover={false}>
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-3">STATUS SUMMARY</h3>
            <div className="space-y-1">
              {briefing.recentActivity.map((a, i) => (
                <p key={i} className="text-xs font-mono text-foreground/60">• {a}</p>
              ))}
            </div>
          </Card>
        </>
      )}
    </AnimatedContainer>
  );
}
