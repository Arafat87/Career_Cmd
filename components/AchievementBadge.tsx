"use client";

import { useState, useEffect } from "react";
import NeonFlicker from "./NeonFlicker";
import ElectricBorder from "./ElectricBorder";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  condition: (stats: any) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: "first_app", name: "First Blood", description: "Submit your first application", icon: "🎯", color: "#FF2D55", condition: (s) => s.applications >= 1 },
  { id: "apps_10", name: "On The Hunt", description: "Submit 10 applications", icon: "🔥", color: "#FF6B00", condition: (s) => s.applications >= 10 },
  { id: "apps_50", name: "Relentless", description: "Submit 50 applications", icon: "⚡", color: "#FFD700", condition: (s) => s.applications >= 50 },
  { id: "apps_100", name: "Centurion", description: "Submit 100 applications", icon: "🏆", color: "#BF00FF", condition: (s) => s.applications >= 100 },
  { id: "interview_1", name: "Breaking Through", description: "Land your first interview", icon: "📞", color: "#00F5FF", condition: (s) => s.interviews >= 1 },
  { id: "interview_5", name: "Interview Pro", description: "Complete 5 interviews", icon: "🎤", color: "#00FF88", condition: (s) => s.interviews >= 5 },
  { id: "offer_1", name: "The Chosen One", description: "Receive your first offer", icon: "💎", color: "#00F5FF", condition: (s) => s.offers >= 1 },
  { id: "questions_50", name: "Knowledge Seeker", description: "Practice 50 questions", icon: "🧠", color: "#BF00FF", condition: (s) => s.questions >= 50 },
  { id: "questions_200", name: "Quiz Master", description: "Practice 200 questions", icon: "📚", color: "#FFD700", condition: (s) => s.questions >= 200 },
  { id: "cert_1", name: "Certified", description: "Earn your first certification", icon: "📜", color: "#00FF88", condition: (s) => s.certifications >= 1 },
  { id: "cert_5", name: "Collector", description: "Earn 5 certifications", icon: "🎖", color: "#FF6B00", condition: (s) => s.certifications >= 5 },
  { id: "streak_7", name: "On Fire", description: "7-day activity streak", icon: "🔥", color: "#FF2D55", condition: (s) => s.streak >= 7 },
  { id: "streak_30", name: "Unstoppable", description: "30-day activity streak", icon: "💪", color: "#BF00FF", condition: (s) => s.streak >= 30 },
];

export { ACHIEVEMENTS };

export default function AchievementBadges({ stats }: { stats: any }) {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [newUnlock, setNewUnlock] = useState<Achievement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("hireops_achievements");
    const prev: Set<string> = saved ? new Set(JSON.parse(saved)) : new Set();
    const newlyUnlocked = new Set(prev);

    ACHIEVEMENTS.forEach((a) => {
      if (!prev.has(a.id) && a.condition(stats)) {
        newlyUnlocked.add(a.id);
        setNewUnlock(a);
        setTimeout(() => setNewUnlock(null), 3000);
      }
    });

    setUnlocked(newlyUnlocked);
    localStorage.setItem("hireops_achievements", JSON.stringify([...newlyUnlocked]));
  }, [stats]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlocked.has(a.id);
          return (
            <div
              key={a.id}
              className={`p-3 rounded-lg border transition-all ${isUnlocked ? "border-opacity-30" : "border-[rgba(0,245,255,0.05)] opacity-30 grayscale"}`}
              style={isUnlocked ? { borderColor: `${a.color}30`, backgroundColor: `${a.color}08` } : {}}
            >
              <div className="text-2xl mb-1">{a.icon}</div>
              <p className="text-[10px] font-mono font-semibold" style={{ color: isUnlocked ? a.color : "#4A6274" }}>{a.name}</p>
              <p className="text-[9px] font-mono text-muted">{a.description}</p>
            </div>
          );
        })}
      </div>

      {/* Toast notification for new unlock */}
      {newUnlock && (
        <div className="fixed top-20 right-6 z-[9000] animate-[slideInRight_0.3s_ease-out]">
          <ElectricBorder
            color={newUnlock.color}
            speed={1.5}
            chaos={0.2}
            borderRadius={12}
          >
            <div className="px-4 py-3 rounded-lg border bg-[#0a0a12] shadow-2xl" style={{ borderColor: `${newUnlock.color}40`, boxShadow: `0 0 20px ${newUnlock.color}20` }}>
              <NeonFlicker intensity="strong">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{newUnlock.icon}</span>
                  <div>
                    <p className="text-[10px] font-mono text-muted">ACHIEVEMENT UNLOCKED</p>
                    <p className="text-sm font-mono font-bold" style={{ color: newUnlock.color }}>{newUnlock.name}</p>
                  </div>
                </div>
              </NeonFlicker>
            </div>
          </ElectricBorder>
        </div>
      )}
    </>
  );
}
