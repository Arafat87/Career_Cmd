"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";

interface SkillData {
  skill: string;
  category: string;
  demand: number;
}

export default function SkillsHeatmap() {
  const [skills, setSkills] = useState<SkillData[]>([]);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data) => {
        if (data.skillsCoverage) {
          setSkills(data.skillsCoverage.sort((a: SkillData, b: SkillData) => b.demand - a.demand));
        }
      });
  }, []);

  if (skills.length === 0) return null;

  const maxDemand = Math.max(...skills.map((s) => s.demand), 1);

  return (
    <Card hover={false} className="mt-6">
      <GlowText as="h3" color="cyan" className="text-sm font-mono tracking-wider mb-4">
        SKILLS DEMAND HEATMAP
      </GlowText>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
        {skills.slice(0, 18).map((skill) => {
          const intensity = skill.demand === 0 ? 0.03 : skill.demand <= 1 ? 0.08 : skill.demand <= 3 ? 0.15 : skill.demand <= 5 ? 0.25 : 0.4;
          return (
            <div
              key={skill.skill}
              className="p-2 rounded text-center transition-all hover:scale-105"
              style={{ backgroundColor: `rgba(0, 245, 255, ${intensity})` }}
              title={`${skill.skill}: ${skill.demand} job(s) require this`}
            >
              <p className="text-[10px] font-mono text-foreground truncate">{skill.skill}</p>
              <p className="text-[8px] font-mono text-muted">{skill.demand}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
