"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";
import ElectricBorder from "@/components/ElectricBorder";
import GlowText from "@/components/GlowText";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";

const EMPLOYMENT_STATUSES = ["Employed", "Unemployed", "Student", "Freelance", "Career Transition"];
const EDUCATION_LEVELS = ["High School", "Associate", "Bachelor's", "Master's", "PhD", "Bootcamp", "Self-taught", "Certifications Only"];
const INDUSTRY_FOCUSES = ["Cloud / DevOps", "Cybersecurity", "AI / ML", "Data Engineering", "Networking", "Software Engineering", "Site Reliability", "Platform Engineering"];

export default function BackgroundPage() {
  const [form, setForm] = useState({
    current_role: "", employment_status: "unemployed", years_experience: 0,
    education_level: "", industry_focus: "", bio: "", location: "",
    desired_salary_min: 0, desired_salary_max: 0,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/background").then((r) => r.json()).then((data) => {
      if (data && data.current_role !== undefined) setForm(data);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/background", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateField(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <AnimatedContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <GlowText as="h2" color="cyan" className="text-xl font-mono tracking-wider">BACKGROUND</GlowText>
          <p className="text-xs font-mono text-muted mt-1">Your career profile — used across the app for personalized AI recommendations</p>
        </div>
      </div>

      {/* Current Role & Employment */}
      <AnimatedItem>
        <ElectricBorder color="#00F5FF" speed={0.6} chaos={0.08} borderRadius={12}>
          <Card hover={false}>
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-4">CURRENT STATUS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-1.5">CURRENT ROLE / JOB TITLE</label>
                <input
                  type="text"
                  value={form.current_role}
                  onChange={(e) => updateField("current_role", e.target.value)}
                  placeholder="e.g. Junior DevOps Engineer, Help Desk Analyst..."
                  className="w-full px-3 py-2 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.15)] rounded-lg text-sm font-mono text-foreground placeholder:text-muted/50 focus:outline-none focus:border-neon-cyan/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-1.5">EMPLOYMENT STATUS</label>
                <select
                  value={form.employment_status}
                  onChange={(e) => updateField("employment_status", e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg text-sm font-mono text-foreground focus:outline-none focus:border-neon-cyan/50 appearance-none cursor-pointer"
                >
                  {EMPLOYMENT_STATUSES.map((s) => (
                    <option key={s} value={s.toLowerCase().replace(/ /g, "_")}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        </ElectricBorder>
      </AnimatedItem>

      {/* Experience & Education */}
      <AnimatedItem>
        <ElectricBorder color="#BF00FF" speed={0.6} chaos={0.08} borderRadius={12}>
          <Card hover={false}>
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-4">EXPERIENCE & EDUCATION</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-1.5">YEARS OF EXPERIENCE</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={form.years_experience}
                  onChange={(e) => updateField("years_experience", parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg text-sm font-mono text-foreground focus:outline-none focus:border-neon-cyan/50 appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-1.5">EDUCATION LEVEL</label>
                <select
                  value={form.education_level}
                  onChange={(e) => updateField("education_level", e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg text-sm font-mono text-foreground focus:outline-none focus:border-neon-cyan/50 appearance-none cursor-pointer"
                >
                  <option value="">Select...</option>
                  {EDUCATION_LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-1.5">INDUSTRY FOCUS</label>
                <select
                  value={form.industry_focus}
                  onChange={(e) => updateField("industry_focus", e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg text-sm font-mono text-foreground focus:outline-none focus:border-neon-cyan/50 appearance-none cursor-pointer"
                >
                  <option value="">Select...</option>
                  {INDUSTRY_FOCUSES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        </ElectricBorder>
      </AnimatedItem>

      {/* Location & Salary */}
      <AnimatedItem>
        <ElectricBorder color="#00FF88" speed={0.6} chaos={0.08} borderRadius={12}>
          <Card hover={false}>
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-4">LOCATION & COMPENSATION</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-1.5">LOCATION</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="e.g. New York, NY / Remote"
                  className="w-full px-3 py-2 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.15)] rounded-lg text-sm font-mono text-foreground placeholder:text-muted/50 focus:outline-none focus:border-neon-cyan/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-1.5">DESIRED SALARY MIN ($)</label>
                <input
                  type="number"
                  min="0"
                  value={form.desired_salary_min}
                  onChange={(e) => updateField("desired_salary_min", parseInt(e.target.value) || 0)}
                  placeholder="60000"
                  className="w-full px-3 py-2 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.15)] rounded-lg text-sm font-mono text-foreground placeholder:text-muted/50 focus:outline-none focus:border-neon-cyan/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-1.5">DESIRED SALARY MAX ($)</label>
                <input
                  type="number"
                  min="0"
                  value={form.desired_salary_max}
                  onChange={(e) => updateField("desired_salary_max", parseInt(e.target.value) || 0)}
                  placeholder="120000"
                  className="w-full px-3 py-2 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.15)] rounded-lg text-sm font-mono text-foreground placeholder:text-muted/50 focus:outline-none focus:border-neon-cyan/50"
                />
              </div>
            </div>
          </Card>
        </ElectricBorder>
      </AnimatedItem>

      {/* Bio */}
      <AnimatedItem>
        <ElectricBorder color="#FFD700" speed={0.6} chaos={0.08} borderRadius={12}>
          <Card hover={false}>
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-4">BIO / SUMMARY</h3>
            <textarea
              value={form.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              placeholder="Brief summary of your career background, goals, and what you're looking for..."
              rows={4}
              className="w-full px-3 py-2 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.15)] rounded-lg text-sm font-mono text-foreground placeholder:text-muted/50 focus:outline-none focus:border-neon-cyan/50 resize-none"
            />
          </Card>
        </ElectricBorder>
      </AnimatedItem>

      {/* Save */}
      <AnimatedItem>
        <div className="flex items-center gap-3">
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-neon-cyan/15 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan tracking-wider hover:bg-neon-cyan/25 transition-colors disabled:opacity-40"
            >
              {saving ? "SAVING..." : "SAVE BACKGROUND"}
            </button>
          </ElectricBorder>
          {saved && <span className="text-xs font-mono text-neon-green">Saved successfully</span>}
        </div>
      </AnimatedItem>
    </AnimatedContainer>
  );
}
