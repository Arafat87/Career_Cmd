"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";
import PulsingDot from "@/components/PulsingDot";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import SkillsHeatmap from "@/components/SkillsHeatmap";
import NotificationCenter from "@/components/NotificationCenter";
import DataStreamHeader from "@/components/DataStreamHeader";
import HudCorners from "@/components/HudCorners";
import RadarChart from "@/components/RadarChart";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import AchievementBadges from "@/components/AchievementBadge";
import NeonFlicker from "@/components/NeonFlicker";
import LoadingBar from "@/components/LoadingBar";
import CountdownTimer from "@/components/CountdownTimer";
import ElectricBorder from "@/components/ElectricBorder";
import { fetchArray } from "@/lib/fetch-helpers";

interface Stats {
  certifications: number;
  passedCerts: number;
  projects: number;
  doneProjects: number;
  techStack: number;
  withProficiency: number;
  jobTitles: number;
  applications: number;
  interviews: number;
  offers: number;
  questions: number;
  streak: number;
  projectsByStatus: { TODO: number; "IN PROGRESS": number; DONE: number };
  upcomingDeadlines: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    certifications: 0, passedCerts: 0, projects: 0, doneProjects: 0,
    techStack: 0, withProficiency: 0, jobTitles: 0,
    applications: 0, interviews: 0, offers: 0, questions: 0, streak: 0,
    projectsByStatus: { TODO: 0, "IN PROGRESS": 0, DONE: 0 },
    upcomingDeadlines: 0,
  });
  const [activityData, setActivityData] = useState<{ date: string; count: number }[]>([]);
  const [nextInterview, setNextInterview] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [certs, projects, tech, jobs, apps, interviews, questions] = await Promise.all([
          fetchArray("/api/certifications"),
          fetchArray("/api/projects"),
          fetchArray("/api/techstack"),
          fetchArray("/api/jobtitles"),
          fetchArray("/api/applications"),
          fetchArray("/api/interviews"),
          fetchArray("/api/questions"),
        ]);

        const projectsByStatus = {
          TODO: (projects as any[]).filter((p) => p.status === "TODO").length,
          "IN PROGRESS": (projects as any[]).filter((p) => p.status === "IN PROGRESS").length,
          DONE: (projects as any[]).filter((p) => p.status === "DONE").length,
        };

        const now = new Date();
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const upcomingDeadlines = (projects as any[]).filter((p) => {
          if (!p.deadline || p.status === "DONE") return false;
          const d = new Date(p.deadline);
          return d >= now && d <= thirtyDays;
        }).length;

        const offers = (apps as any[]).filter((a) => a.status === "OFFER").length;
        const totalPractice = (questions as any[]).reduce((s: number, q: any) => s + (q.times_practiced || 0), 0);

        // Find next upcoming interview
        const futureInterviews = (interviews as any[])
          .filter((i) => new Date(i.date) > now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (futureInterviews.length > 0) setNextInterview(new Date(futureInterviews[0].date));

        // Generate activity data from all user actions
        const activityMap = new Map<string, number>();
        const addDate = (d: string) => { if (d) activityMap.set(d, (activityMap.get(d) || 0) + 1); };
        (apps as any[]).forEach((a) => addDate((a.date_applied || a.created_at || "").split("T")[0]));
        (projects as any[]).forEach((p) => addDate((p.created_at || "").split("T")[0]));
        (questions as any[]).forEach((q) => { if (q.last_practiced) addDate(q.last_practiced.split("T")[0]); });
        (interviews as any[]).forEach((i) => addDate((i.created_at || "").split("T")[0]));
        setActivityData(Array.from(activityMap.entries()).map(([date, count]) => ({ date, count })));

        // Compute real streak: consecutive days with activity ending today or yesterday
        const today = new Date().toISOString().split("T")[0];
        const sortedDates = Array.from(activityMap.keys()).sort().reverse();
        let streak = 0;
        const checkDate = new Date(today);
        // If no activity today, check from yesterday
        if (!activityMap.has(today)) checkDate.setDate(checkDate.getDate() - 1);
        for (let i = 0; i < 365; i++) {
          const ds = checkDate.toISOString().split("T")[0];
          if (activityMap.has(ds)) { streak++; checkDate.setDate(checkDate.getDate() - 1); } else break;
        }

        const passedCerts = (certs as any[]).filter((c) => c.status === "PASSED").length;
        const doneProjects = (projects as any[]).filter((p) => p.status === "DONE").length;
        const withProficiency = (tech as any[]).filter((t) => t.proficiency_goal && t.proficiency_goal !== "TBD").length;

        setStats({
          certifications: (certs as any[]).length,
          passedCerts,
          projects: (projects as any[]).length,
          doneProjects,
          techStack: (tech as any[]).length,
          withProficiency,
          jobTitles: (jobs as any[]).length,
          applications: (apps as any[]).length,
          interviews: (interviews as any[]).length,
          offers,
          questions: totalPractice,
          streak,
          projectsByStatus,
          upcomingDeadlines,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: "APPLICATIONS", value: stats.applications, color: "#00F5FF", icon: "📤" },
    { label: "INTERVIEWS", value: stats.interviews, color: "#BF00FF", icon: "🎤" },
    { label: "OFFERS", value: stats.offers, color: "#00FF88", icon: "💎" },
    { label: "QUESTIONS PRACTICED", value: stats.questions, color: "#FFD700", icon: "🧠" },
    { label: "CERTIFICATIONS", value: stats.certifications, sub: stats.passedCerts ? `${stats.passedCerts} passed` : undefined, color: "#00F5FF", icon: "◈" },
    { label: "PROJECTS", value: stats.projects, sub: stats.doneProjects ? `${stats.doneProjects} done` : undefined, color: "#BF00FF", icon: "◇" },
    { label: "TECH STACK", value: stats.techStack, sub: stats.withProficiency ? `${stats.withProficiency} proficient` : undefined, color: "#00FF88", icon: "▣" },
    { label: "JOB TARGETS", value: stats.jobTitles, color: "#FF2D55", icon: "◎" },
  ];

  return (
    <AnimatedContainer className="space-y-6">
      {/* Data Stream Header */}
      <DataStreamHeader />

      {/* Notifications + Countdown */}
      <div className="flex items-center justify-between">
        {nextInterview && (
          <div className="flex items-center gap-2">
            <NeonFlicker intensity="subtle">
              <span className="text-[10px] font-mono text-neon-red">NEXT INTERVIEW</span>
            </NeonFlicker>
            <CountdownTimer target={nextInterview} color="#FF2D55" />
          </div>
        )}
        <NotificationCenter />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat) => (
          <AnimatedItem key={stat.label}>
            <ElectricBorder color={stat.color} speed={0.5} chaos={0.06} borderRadius={12}>
              <HudCorners color={stat.color} size={8}>
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-mono text-muted uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-mono font-bold mt-1" style={{ color: stat.color }}>
                        {stat.value}
                      </p>
                      {stat.sub && (
                        <p className="text-[9px] font-mono mt-0.5" style={{ color: `${stat.color}80` }}>
                          {stat.sub}
                        </p>
                      )}
                    </div>
                    <span className="text-xl opacity-40">{stat.icon}</span>
                  </div>
                </Card>
              </HudCorners>
            </ElectricBorder>
          </AnimatedItem>
        ))}
      </div>

      {/* Radar + Project Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatedItem>
          <ElectricBorder color="#00F5FF" speed={0.6} chaos={0.08} borderRadius={12}>
          <Card hover={false}>
            <GlowText as="h3" color="cyan" className="text-xs font-mono uppercase tracking-wider mb-4">SKILL RADAR</GlowText>
            <div className="flex justify-center">
              <RadarChart
                data={[
                  { label: "Cloud", value: Math.min(100, stats.certifications * 20) },
                  { label: "DevOps", value: Math.min(100, stats.projects * 15) },
                  { label: "Security", value: Math.min(100, stats.certifications * 10) },
                  { label: "Networking", value: Math.min(100, stats.techStack * 8) },
                  { label: "AI/ML", value: Math.min(100, stats.applications * 3) },
                  { label: "Coding", value: Math.min(100, stats.questions * 2) },
                ]}
                size={220}
              />
            </div>
          </Card>
          </ElectricBorder>
        </AnimatedItem>

        <AnimatedItem>
          <ElectricBorder color="#00F5FF" speed={0.6} chaos={0.08} borderRadius={12}>
          <Card hover={false}>
            <GlowText as="h3" color="cyan" className="text-xs font-mono uppercase tracking-wider mb-4">PROJECT STATUS</GlowText>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <PulsingDot color="cyan" size="lg" />
                <p className="text-2xl font-mono font-bold text-neon-cyan/70 mt-2">{stats.projectsByStatus.TODO}</p>
                <p className="text-xs font-mono text-muted">TODO</p>
              </div>
              <div className="text-center">
                <PulsingDot color="purple" size="lg" />
                <p className="text-2xl font-mono font-bold text-neon-purple/70 mt-2">{stats.projectsByStatus["IN PROGRESS"]}</p>
                <p className="text-xs font-mono text-muted">IN PROGRESS</p>
              </div>
              <div className="text-center">
                <PulsingDot color="green" size="lg" />
                <p className="text-2xl font-mono font-bold text-neon-green/70 mt-2">{stats.projectsByStatus.DONE}</p>
                <p className="text-xs font-mono text-muted">DONE</p>
              </div>
            </div>
            {/* Funnel visualization */}
            <div className="mt-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-muted w-16">APPLIED</span>
                <LoadingBar progress={100} color="#00F5FF" segments={15} height={3} animated={false} />
                <span className="text-[9px] font-mono text-muted w-8">{stats.applications}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-muted w-16">INTERVIEW</span>
                <LoadingBar progress={stats.applications ? (stats.interviews / stats.applications) * 100 : 0} color="#BF00FF" segments={15} height={3} animated={false} />
                <span className="text-[9px] font-mono text-muted w-8">{stats.interviews}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-muted w-16">OFFERS</span>
                <LoadingBar progress={stats.applications ? (stats.offers / stats.applications) * 100 : 0} color="#00FF88" segments={15} height={3} animated={false} />
                <span className="text-[9px] font-mono text-muted w-8">{stats.offers}</span>
              </div>
            </div>
          </Card>
          </ElectricBorder>
        </AnimatedItem>
      </div>

      {/* Upcoming Deadlines Alert */}
      {stats.upcomingDeadlines > 0 && (
        <AnimatedItem>
          <ElectricBorder color="#FF2D55" speed={0.8} chaos={0.12} borderRadius={12}>
          <Card hover={false} className="border-neon-red/20">
            <div className="flex items-center gap-3">
              <PulsingDot color="red" size="lg" />
              <div>
                <p className="text-sm font-mono text-neon-red/70">
                  {stats.upcomingDeadlines} PROJECT{stats.upcomingDeadlines > 1 ? "S" : ""} DUE WITHIN 30 DAYS
                </p>
                <p className="text-xs font-mono text-muted mt-1">Check the Reminders page for details</p>
              </div>
            </div>
          </Card>
          </ElectricBorder>
        </AnimatedItem>
      )}

      {/* Activity Heatmap */}
      <AnimatedItem>
        <ElectricBorder color="#00F5FF" speed={0.5} chaos={0.06} borderRadius={12}>
        <Card hover={false}>
          <GlowText as="h3" color="cyan" className="text-xs font-mono uppercase tracking-wider mb-4">ACTIVITY HEATMAP</GlowText>
          <ActivityHeatmap data={activityData} />
        </Card>
        </ElectricBorder>
      </AnimatedItem>

      {/* Quick Actions */}
      <AnimatedItem>
        <ElectricBorder color="#00F5FF" speed={0.7} chaos={0.1} borderRadius={12}>
          <Card hover={false}>
            <GlowText as="h3" color="cyan" className="text-xs font-mono uppercase tracking-wider mb-4">QUICK ACTIONS</GlowText>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                { href: "/applications", label: "NEW APP", icon: "📤", color: "#00F5FF" },
                { href: "/interview-prep", label: "PREP MODE", icon: "🎯", color: "#BF00FF" },
                { href: "/questions", label: "QUIZ", icon: "❓", color: "#FFD700" },
                { href: "/salary-calculator", label: "SALARY CALC", icon: "🧮", color: "#00FF88" },
                { href: "/assistant", label: "AI ASSIST", icon: "✦", color: "#FF2D55" },
                { href: "/certifications", label: "ADD CERT", icon: "◈", color: "#00F5FF" },
                { href: "/projects", label: "ADD PROJECT", icon: "◇", color: "#BF00FF" },
                { href: "/templates", label: "TEMPLATES", icon: "📋", color: "#FFD700" },
                { href: "/analytics", label: "ANALYTICS", icon: "⊞", color: "#00FF88" },
                { href: "/export", label: "EXPORT", icon: "📄", color: "#FF2D55" },
              ].map((a) => (
                <a key={a.href} href={a.href}
                  className="p-2.5 rounded-lg border text-center hover:scale-105 transition-all"
                  style={{ borderColor: `${a.color}20`, backgroundColor: `${a.color}05` }}>
                  <span className="text-base block mb-0.5">{a.icon}</span>
                  <span className="text-[9px] font-mono text-muted">{a.label}</span>
                </a>
              ))}
            </div>
          </Card>
        </ElectricBorder>
      </AnimatedItem>

      {/* Achievement Badges */}
      <AnimatedItem>
        <ElectricBorder color="#FFD700" speed={0.6} chaos={0.08} borderRadius={12}>
        <Card hover={false}>
          <GlowText as="h3" color="yellow" className="text-xs font-mono uppercase tracking-wider mb-4">ACHIEVEMENTS</GlowText>
          <AchievementBadges stats={stats} />
        </Card>
        </ElectricBorder>
      </AnimatedItem>

      {/* Skills Heatmap */}
      <AnimatedItem>
        <ElectricBorder color="#BF00FF" speed={0.6} chaos={0.08} borderRadius={12}>
        <SkillsHeatmap />
        </ElectricBorder>
      </AnimatedItem>
    </AnimatedContainer>
  );
}
