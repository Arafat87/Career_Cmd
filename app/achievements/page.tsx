"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import { fetchJson } from "@/lib/fetch-helpers";

interface AchievementData {
  totalApplications: number; totalCertifications: number; passedCertifications: number;
  totalProjects: number; totalSkills: number; totalSavedJobs: number;
  totalInterviews: number; totalQuestions: number; totalLearningPaths: number;
  completedLearning: number; totalDocuments: number; totalPortfolio: number;
  totalNetworking: number; totalReferrals: number;
}

interface Achievement {
  name: string; description: string; icon: string; category: string; threshold: number; unlocked: boolean;
}

export default function AchievementsPage() {
  const [data, setData] = useState<AchievementData | null>(null);

  useEffect(() => {
    fetchJson("/api/achievements").then((d) => { if (d && !d.error) setData(d); });
  }, []);

  if (!data) {
    return <div className="flex items-center justify-center h-64"><p className="text-sm font-mono text-muted">Loading achievements...</p></div>;
  }

  const achievements: Achievement[] = [
    // Applications
    { name: "First Blood", description: "Submit your first application", icon: "🎯", category: "Applications", threshold: 1, unlocked: data.totalApplications >= 1 },
    { name: "Applicant", description: "Submit 10 applications", icon: "📋", category: "Applications", threshold: 10, unlocked: data.totalApplications >= 10 },
    { name: "Machine", description: "Submit 50 applications", icon: "🤖", category: "Applications", threshold: 50, unlocked: data.totalApplications >= 50 },
    // Certifications
    { name: "First Cert", description: "Earn your first certification", icon: "📜", category: "Certifications", threshold: 1, unlocked: data.passedCertifications >= 1 },
    { name: "Cert Collector", description: "Earn 5 certifications", icon: "📚", category: "Certifications", threshold: 5, unlocked: data.passedCertifications >= 5 },
    { name: "Cert Master", description: "Earn 10 certifications", icon: "👑", category: "Certifications", threshold: 10, unlocked: data.passedCertifications >= 10 },
    // Projects
    { name: "Builder", description: "Create your first project", icon: "🔨", category: "Projects", threshold: 1, unlocked: data.totalProjects >= 1 },
    { name: "Prolific", description: "Create 10 projects", icon: "🏗", category: "Projects", threshold: 10, unlocked: data.totalProjects >= 10 },
    // Skills
    { name: "Toolbox", description: "Add 10 skills to your stack", icon: "🧰", category: "Skills", threshold: 10, unlocked: data.totalSkills >= 10 },
    { name: "Arsenal", description: "Add 50 skills to your stack", icon: "⚔", category: "Skills", threshold: 50, unlocked: data.totalSkills >= 50 },
    // Job Search
    { name: "Bookworm", description: "Save your first job posting", icon: "⭐", category: "Job Search", threshold: 1, unlocked: data.totalSavedJobs >= 1 },
    { name: "Networker", description: "Add 10 networking contacts", icon: "🤝", category: "Job Search", threshold: 10, unlocked: data.totalNetworking >= 10 },
    { name: "Referred", description: "Get your first referral", icon: "🔗", category: "Job Search", threshold: 1, unlocked: data.totalReferrals >= 1 },
    // Learning
    { name: "Student", description: "Start your first learning path", icon: "📖", category: "Learning", threshold: 1, unlocked: data.totalLearningPaths >= 1 },
    { name: "Scholar", description: "Complete 5 learning paths", icon: "🎓", category: "Learning", threshold: 5, unlocked: data.completedLearning >= 5 },
    // Portfolio
    { name: "Showcase", description: "Add your first portfolio item", icon: "🖼", category: "Portfolio", threshold: 1, unlocked: data.totalPortfolio >= 1 },
    // Questions
    { name: "Quizzer", description: "Add 10 questions to your bank", icon: "❓", category: "Prep", threshold: 10, unlocked: data.totalQuestions >= 10 },
    { name: "Interview Ready", description: "Practice 50 questions", icon: "🎤", category: "Prep", threshold: 50, unlocked: data.totalQuestions >= 50 },
    // Documents
    { name: "Documented", description: "Store your first document", icon: "📄", category: "Documents", threshold: 1, unlocked: data.totalDocuments >= 1 },
  ];

  const categories = [...new Set(achievements.map((a) => a.category))];
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <AnimatedContainer>
      <div className="flex items-center justify-between mb-6">
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">
          {unlockedCount}/{achievements.length} ACHIEVEMENTS UNLOCKED
        </GlowText>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-[rgba(0,245,255,0.05)] rounded-full overflow-hidden">
            <div className="h-full bg-neon-cyan/40 rounded-full transition-all" style={{ width: `${(unlockedCount / achievements.length) * 100}%` }} />
          </div>
          <span className="text-xs font-mono text-muted">{Math.round((unlockedCount / achievements.length) * 100)}%</span>
        </div>
      </div>

      {categories.map((cat) => {
        const catAchievements = achievements.filter((a) => a.category === cat);
        const catUnlocked = catAchievements.filter((a) => a.unlocked).length;
        return (
          <div key={cat} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-sm font-mono text-neon-cyan/70 tracking-wider uppercase">{cat}</h3>
              <span className="text-[10px] font-mono text-muted">{catUnlocked}/{catAchievements.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catAchievements.map((a) => (
                <AnimatedItem key={a.name}>
                  <Card hover={false} className={a.unlocked ? "border-neon-cyan/20" : "opacity-50"}>
                    <div className="flex items-start gap-3">
                      <span className={`text-2xl ${a.unlocked ? "" : "grayscale"}`}>{a.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-mono font-semibold ${a.unlocked ? "text-neon-cyan" : "text-muted"}`}>{a.name}</h4>
                          {a.unlocked && <span className="text-neon-green text-xs">✓</span>}
                        </div>
                        <p className="text-xs font-mono text-foreground/50 mt-1">{a.description}</p>
                        {!a.unlocked && (
                          <div className="mt-2">
                            <div className="w-full h-1 bg-[rgba(0,245,255,0.05)] rounded-full overflow-hidden">
                              <div className="h-full bg-neon-cyan/20 rounded-full" style={{ width: `${Math.min(100, (data as any)[`total${cat === "Applications" ? "Applications" : cat === "Certifications" ? "Certifications" : cat === "Projects" ? "Projects" : cat === "Skills" ? "Skills" : cat === "Job Search" ? "SavedJobs" : cat === "Learning" ? "LearningPaths" : cat === "Portfolio" ? "Portfolio" : "Questions"}`] / a.threshold) * 100}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </AnimatedItem>
              ))}
            </div>
          </div>
        );
      })}
    </AnimatedContainer>
  );
}
