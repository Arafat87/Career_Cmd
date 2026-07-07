"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";
import ElectricBorder from "@/components/ElectricBorder";
import SkillTag from "@/components/SkillTag";
import GlowText from "@/components/GlowText";
import Modal from "@/components/Modal";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import { fetchArray, fetchJson } from "@/lib/fetch-helpers";

interface RoadmapPhase {
  name: string;
  timeline: string;
  description: string;
  salary_range?: string;
  salary_note?: string;
  skills: string[];
  certifications: string[];
  projects: string[];
  milestones: string[];
}

interface Roadmap {
  id?: number;
  title: string;
  target_role: string;
  total_timeline: string;
  current_level?: string;
  suggested_paths?: string[] | null;
  phases: RoadmapPhase[];
  color: string;
  model_used?: string;
  mode?: string;
  created_at?: string;
}

interface JobTitle {
  id: number;
  title: string;
  company: string;
}

const COLOR_PRESETS = [
  { name: "Cyan", value: "#00F5FF" },
  { name: "Purple", value: "#BF00FF" },
  { name: "Green", value: "#00FF88" },
  { name: "Red", value: "#FF2D55" },
  { name: "Yellow", value: "#FFD700" },
  { name: "Orange", value: "#FF8C00" },
];

export default function RoadmapPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [mode, setMode] = useState<"job_title" | "target_role" | "progression">("job_title");
  const [progressionSource, setProgressionSource] = useState<"job_title" | "target_roles" | "current_role" | "background">("job_title");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [color, setColor] = useState("#00F5FF");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [savedRoadmaps, setSavedRoadmaps] = useState<Roadmap[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [addingTarget, setAddingTarget] = useState("");
  const [background, setBackground] = useState<any>(null);

  useEffect(() => {
    fetchArray("/api/roadmaps").then((data) => {
      setSavedRoadmaps(data);
    });
    fetchArray("/api/jobtitles").then((data) => {
      setJobTitles(data);
    });
    fetchJson("/api/background").then((data) => {
      if (data && data.current_role !== undefined) setBackground(data);
    });
  }, []);

  function getActiveInput(): string {
    if (mode === "target_role") return selectedTarget;
    if (mode === "progression" && progressionSource === "background") return background?.current_role || "";
    if (mode === "progression" && progressionSource === "current_role") return background?.current_role || "";
    if (mode === "progression" && progressionSource === "target_roles") return selectedTarget;
    return jobTitle.trim();
  }

  async function handleGenerate() {
    const input = getActiveInput();
    if (mode === "target_role" && !input) {
      setError("Select a target role to generate a roadmap");
      return;
    }
    if (mode === "progression" && progressionSource === "background" && !input) {
      setError("No background data found. Fill in your background first, or switch to another mode.");
      return;
    }
    if (mode === "progression" && progressionSource === "current_role" && !input) {
      setError("No current role found. Fill in your background first, or switch to another mode.");
      return;
    }
    if (mode === "progression" && progressionSource === "target_roles" && !input) {
      setError("Select a target role to generate a progression path.");
      return;
    }
    setGenerating(true);
    setError("");
    setRoadmap(null);

    const apiMode = mode === "progression" ? "progression" : "target";

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_roadmap", payload: { jobTitle: input, mode: apiMode, progressionSource: mode === "progression" ? progressionSource : undefined } }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const titlePrefix = mode === "progression" ? "Progression" : mode === "target_role" ? "Target" : "Roadmap";

      setRoadmap({
        title: `${titlePrefix}: ${data.target_role || input || "Career Path"}`,
        target_role: data.target_role || input || "Career Path",
        total_timeline: data.total_timeline || "12-18 months",
        current_level: data.current_level,
        suggested_paths: data.suggested_paths,
        phases: data.phases || [],
        color,
        mode,
      });
    } catch (err: any) {
      setError(err.message || "Failed to generate roadmap");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!roadmap) return;
    setSaving(true);
    try {
      const res = await fetch("/api/roadmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: roadmap.title,
          target_role: roadmap.target_role,
          phases: roadmap.phases,
          color: roadmap.color,
          mode: roadmap.mode,
        }),
      });
      const data = await res.json();
      const saved = { ...roadmap, id: data.id, created_at: new Date().toISOString() };
      setSavedRoadmaps((prev) => [saved, ...prev]);
      setRoadmap(null);
      setJobTitle("");
      setSelectedTarget("");
    } catch {
      setError("Failed to save roadmap");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/roadmaps?id=${id}`, { method: "DELETE" });
    setSavedRoadmaps((prev) => prev.filter((r) => r.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  async function handleAddToTargets(role: string) {
    if (!role.trim() || jobTitles.some((jt) => jt.title === role)) return;
    setAddingTarget(role);
    try {
      const res = await fetch("/api/jobtitles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: role, company: "", category: "SUGGESTED" }),
      });
      const data = await res.json();
      setJobTitles((prev) => [...prev, { id: data.id, title: role, company: "" }]);
    } catch {
      setError("Failed to add to targets");
    } finally {
      setAddingTarget("");
    }
  }

  return (
    <AnimatedContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <GlowText as="h2" color="cyan" className="text-xl font-mono tracking-wider">CAREER ROADMAP</GlowText>
          <p className="text-xs font-mono text-muted mt-1">AI-powered career path generator</p>
        </div>
      </div>

      {/* Generator */}
      <ElectricBorder color={color} speed={0.7} chaos={0.1} borderRadius={12}>
        <Card hover={false}>
          <div className="space-y-4">
            {/* Mode Selector */}
            <div>
              <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-2">MODE</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("job_title")}
                  className={`flex-1 px-3 py-2.5 rounded-lg font-mono text-[11px] tracking-wider border transition-all ${
                    mode === "job_title"
                      ? "bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan"
                      : "border-[rgba(0,245,255,0.1)] text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)]"
                  }`}
                >
                  JOB TITLE
                  <span className="block text-[9px] mt-0.5 opacity-60">Type any role</span>
                </button>
                <button
                  onClick={() => setMode("target_role")}
                  className={`flex-1 px-3 py-2.5 rounded-lg font-mono text-[11px] tracking-wider border transition-all ${
                    mode === "target_role"
                      ? "bg-neon-purple/15 border-neon-purple/40 text-neon-purple"
                      : "border-[rgba(0,245,255,0.1)] text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)]"
                  }`}
                >
                  TARGET ROLES
                  <span className="block text-[9px] mt-0.5 opacity-60">Select from your targets</span>
                </button>
                <button
                  onClick={() => setMode("progression")}
                  className={`flex-1 px-3 py-2.5 rounded-lg font-mono text-[11px] tracking-wider border transition-all ${
                    mode === "progression"
                      ? "bg-neon-green/15 border-neon-green/40 text-neon-green"
                      : "border-[rgba(0,245,255,0.1)] text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)]"
                  }`}
                >
                  PROGRESSION
                  <span className="block text-[9px] mt-0.5 opacity-60">Career path + salary</span>
                </button>
              </div>
            </div>

            {/* Job Title Mode — text input */}
            {mode === "job_title" && (
              <div>
                <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-2">JOB TITLE</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="e.g. Senior Cloud Architect, DevSecOps Engineer, Data Scientist..."
                  className="w-full px-3 py-2 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.15)] rounded-lg text-sm font-mono text-foreground placeholder:text-muted/50 focus:outline-none focus:border-neon-cyan/50"
                />
                <p className="text-[9px] font-mono text-muted/40 mt-1.5">Type any job title — doesn't need to be in your targets</p>
              </div>
            )}

            {/* Target Role Mode — select from targets */}
            {mode === "target_role" && (
              <div>
                <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-2">SELECT A TARGET ROLE</label>
                {jobTitles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {jobTitles.map((jt) => (
                      <button
                        key={jt.id}
                        onClick={() => setSelectedTarget(jt.title)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-all ${
                          selectedTarget === jt.title
                            ? "bg-neon-purple/20 border-neon-purple/40 text-neon-purple scale-105"
                            : "border-[rgba(0,245,255,0.1)] text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)]"
                        }`}
                      >
                        {jt.title}
                        {jt.company && <span className="text-muted/50 ml-1">@ {jt.company}</span>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-mono text-muted">No target roles yet. Add some from the Job Targets page.</p>
                )}
              </div>
            )}

            {/* Career Progression Mode */}
            {mode === "progression" && (
              <div className="space-y-3">
                {/* Sub-toggle — 4 options */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setProgressionSource("job_title")}
                    className={`px-3 py-2 rounded-lg font-mono text-[10px] tracking-wider border transition-all ${
                      progressionSource === "job_title"
                        ? "bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan"
                        : "border-[rgba(0,245,255,0.1)] text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)]"
                    }`}
                  >
                    FROM JOB TITLE
                    <span className="block text-[8px] mt-0.5 opacity-60">Type any role, from scratch</span>
                  </button>
                  <button
                    onClick={() => setProgressionSource("target_roles")}
                    className={`px-3 py-2 rounded-lg font-mono text-[10px] tracking-wider border transition-all ${
                      progressionSource === "target_roles"
                        ? "bg-neon-purple/15 border-neon-purple/40 text-neon-purple"
                        : "border-[rgba(0,245,255,0.1)] text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)]"
                    }`}
                  >
                    FROM TARGET ROLES
                    <span className="block text-[8px] mt-0.5 opacity-60">Select from your targets</span>
                  </button>
                  <button
                    onClick={() => setProgressionSource("current_role")}
                    className={`px-3 py-2 rounded-lg font-mono text-[10px] tracking-wider border transition-all ${
                      progressionSource === "current_role"
                        ? "bg-neon-orange/15 border-neon-orange/40 text-neon-orange"
                        : "border-[rgba(0,245,255,0.1)] text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)]"
                    }`}
                  >
                    CURRENT ROLE
                    <span className="block text-[8px] mt-0.5 opacity-60">From your current position</span>
                  </button>
                  <button
                    onClick={() => setProgressionSource("background")}
                    className={`px-3 py-2 rounded-lg font-mono text-[10px] tracking-wider border transition-all ${
                      progressionSource === "background"
                        ? "bg-neon-green/15 border-neon-green/40 text-neon-green"
                        : "border-[rgba(0,245,255,0.1)] text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)]"
                    }`}
                  >
                    FULL BACKGROUND
                    <span className="block text-[8px] mt-0.5 opacity-60">Uses all your profile data</span>
                  </button>
                </div>

                {/* From Job Title — text input, from scratch */}
                {progressionSource === "job_title" && (
                  <div>
                    <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-2">JOB TITLE</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                      placeholder="e.g. Junior DevOps Engineer, Cloud Architect, Security Analyst..."
                      className="w-full px-3 py-2 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.15)] rounded-lg text-sm font-mono text-foreground placeholder:text-muted/50 focus:outline-none focus:border-neon-cyan/50"
                    />
                    <p className="text-[9px] font-mono text-muted/40 mt-1.5">Generates a progression path from scratch — as if starting fresh in this career</p>
                  </div>
                )}

                {/* From Target Roles — select from targets */}
                {progressionSource === "target_roles" && (
                  <div>
                    <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-2">SELECT A TARGET ROLE</label>
                    {jobTitles.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {jobTitles.map((jt) => (
                          <button
                            key={jt.id}
                            onClick={() => setSelectedTarget(jt.title)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-all ${
                              selectedTarget === jt.title
                                ? "bg-neon-purple/20 border-neon-purple/40 text-neon-purple scale-105"
                                : "border-[rgba(0,245,255,0.1)] text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)]"
                            }`}
                          >
                            {jt.title}
                            {jt.company && <span className="text-muted/50 ml-1">@ {jt.company}</span>}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-mono text-muted">No target roles yet. Add some from the Job Targets page.</p>
                    )}
                  </div>
                )}

                {/* Current Role — from background */}
                {progressionSource === "current_role" && (
                  <div>
                    <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-2">YOUR CURRENT ROLE</label>
                    {background && background.current_role ? (
                      <div className="p-3 rounded-lg bg-[rgba(0,245,255,0.03)] border border-[rgba(0,245,255,0.1)]">
                        <p className="text-sm font-mono text-foreground">{background.current_role}</p>
                        <p className="text-[10px] font-mono text-muted mt-1">{background.years_experience} years experience • {background.employment_status?.replace(/_/g, " ")}</p>
                        <a href="/background" className="text-[9px] font-mono text-neon-cyan hover:underline mt-2 block">Edit background →</a>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-[rgba(0,245,255,0.03)] border border-[rgba(0,245,255,0.1)]">
                        <p className="text-xs font-mono text-muted">No current role set.</p>
                        <a href="/background" className="text-[9px] font-mono text-neon-cyan hover:underline mt-1 block">Fill in your background →</a>
                      </div>
                    )}
                  </div>
                )}

                {/* Full Background — uses all profile data */}
                {progressionSource === "background" && (
                  <div>
                    <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-2">YOUR FULL BACKGROUND</label>
                    {background && background.current_role ? (
                      <div className="p-3 rounded-lg bg-[rgba(0,245,255,0.03)] border border-[rgba(0,245,255,0.1)] space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-muted uppercase w-24">ROLE</span>
                          <span className="text-xs font-mono text-foreground">{background.current_role}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-muted uppercase w-24">STATUS</span>
                          <span className="text-xs font-mono text-foreground capitalize">{background.employment_status?.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-muted uppercase w-24">EXPERIENCE</span>
                          <span className="text-xs font-mono text-foreground">{background.years_experience} years</span>
                        </div>
                        {background.education_level && (
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-muted uppercase w-24">EDUCATION</span>
                            <span className="text-xs font-mono text-foreground">{background.education_level}</span>
                          </div>
                        )}
                        {background.industry_focus && (
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-muted uppercase w-24">FOCUS</span>
                            <span className="text-xs font-mono text-foreground">{background.industry_focus}</span>
                          </div>
                        )}
                        <a href="/background" className="text-[9px] font-mono text-neon-cyan hover:underline block mt-2">Edit background →</a>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-[rgba(0,245,255,0.03)] border border-[rgba(0,245,255,0.1)]">
                        <p className="text-xs font-mono text-muted">No background data yet.</p>
                        <a href="/background" className="text-[9px] font-mono text-neon-cyan hover:underline mt-1 block">Fill in your background →</a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Color Picker */}
            <div>
              <label className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-2">BORDER COLOR</label>
              <div className="flex items-center gap-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setColor(preset.value)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      color === preset.value ? "scale-110 border-white/50" : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: preset.value, boxShadow: color === preset.value ? `0 0 12px ${preset.value}60` : "none" }}
                    title={preset.name}
                  />
                ))}
                <div className="relative">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-[rgba(0,245,255,0.1)]"
                    title="Custom color"
                  />
                </div>
                <span className="text-[10px] font-mono text-muted">{color}</span>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex items-center gap-3">
              <ElectricBorder color={color} speed={1} chaos={0.15} borderRadius={10}>
                <button
                  onClick={handleGenerate}
                  disabled={generating || (mode === "target_role" && !selectedTarget)}
                  className="px-6 py-2.5 rounded-lg font-mono text-sm tracking-wider transition-colors disabled:opacity-40"
                  style={{ backgroundColor: `${color}15`, borderColor: `${color}40`, color }}
                >
                  {generating ? "GENERATING..." : mode === "progression" ? "GENERATE PROGRESSION" : mode === "target_role" ? "GENERATE ROADMAP" : jobTitle.trim() ? "GENERATE ROADMAP" : "SUGGEST ROADMAP"}
                </button>
              </ElectricBorder>
              {error && <span className="text-xs font-mono text-neon-red">{error}</span>}
            </div>
          </div>
        </Card>
      </ElectricBorder>

      {/* Generated Roadmap */}
      {roadmap && (
        <AnimatedItem>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-mono font-bold" style={{ color: roadmap.color }}>
                  {roadmap.target_role}
                </h3>
                <div className="flex items-center gap-3">
                  <p className="text-xs font-mono text-muted">Total timeline: {roadmap.total_timeline}</p>
                  {roadmap.current_level && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${roadmap.color}15`, color: roadmap.color }}>
                      Current: {roadmap.current_level}
                    </span>
                  )}
                  {roadmap.mode === "progression" && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neon-green/10 text-neon-green border border-neon-green/20">
                      SALARY INCLUDED
                    </span>
                  )}
                </div>
                {roadmap.suggested_paths && roadmap.suggested_paths.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[9px] font-mono text-muted uppercase">Also consider:</span>
                    {roadmap.suggested_paths.map((path) => {
                      const alreadyTarget = jobTitles.some((jt) => jt.title === path);
                      return (
                        <span key={path} className="inline-flex items-center gap-1">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-mono border"
                            style={{ borderColor: `${roadmap.color}30`, color: roadmap.color, backgroundColor: `${roadmap.color}08` }}
                          >
                            {path}
                          </span>
                          {!alreadyTarget && (
                            <button
                              onClick={() => handleAddToTargets(path)}
                              disabled={addingTarget === path}
                              className="text-[9px] font-mono text-neon-green hover:text-neon-green/80 transition-colors"
                              title="Add to target roles"
                            >
                              {addingTarget === path ? "..." : "+TARGET"}
                            </button>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <ElectricBorder color={roadmap.color} speed={1} chaos={0.12} borderRadius={10}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg font-mono text-xs tracking-wider"
                    style={{ backgroundColor: `${roadmap.color}15`, color: roadmap.color }}
                  >
                    {saving ? "SAVING..." : "SAVE ROADMAP"}
                  </button>
                </ElectricBorder>
                <button
                  onClick={() => setRoadmap(null)}
                  className="px-3 py-2 rounded-lg font-mono text-xs text-muted hover:text-foreground border border-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.2)] transition-colors"
                >
                  DISCARD
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div
                className="absolute left-6 top-0 bottom-0 w-px"
                style={{ backgroundColor: `${roadmap.color}30` }}
              />

              <div className="space-y-4">
                {roadmap.phases.map((phase, index) => (
                  <AnimatedItem key={index}>
                    <div className="relative pl-14">
                      {/* Timeline dot */}
                      <div
                        className="absolute left-4 top-6 w-4 h-4 rounded-full border-2"
                        style={{ borderColor: roadmap.color, backgroundColor: `${roadmap.color}20`, boxShadow: `0 0 8px ${roadmap.color}40` }}
                      />

                      <ElectricBorder color={roadmap.color} speed={0.6} chaos={0.08} borderRadius={12}>
                        <Card hover={false}>
                          <div className="space-y-3">
                            {/* Phase header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span
                                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                                  style={{ backgroundColor: `${roadmap.color}15`, color: roadmap.color }}
                                >
                                  PHASE {index + 1}
                                </span>
                                <h4 className="text-sm font-mono font-bold text-foreground">{phase.name}</h4>
                              </div>
                              <div className="flex items-center gap-2">
                                {phase.salary_range && (
                                  <span
                                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                                    style={{ backgroundColor: `#00FF8815`, color: "#00FF88", border: "1px solid #00FF8830" }}
                                  >
                                    {phase.salary_range}
                                  </span>
                                )}
                                <span
                                  className="px-2 py-0.5 rounded text-[10px] font-mono border"
                                  style={{ borderColor: `${roadmap.color}30`, color: roadmap.color }}
                                >
                                  {phase.timeline}
                                </span>
                              </div>
                            </div>

                            {/* Salary note for progression mode */}
                            {phase.salary_note && (
                              <div className="p-2 rounded bg-[rgba(0,255,136,0.05)] border border-[rgba(0,255,136,0.1)]">
                                <p className="text-[9px] font-mono text-neon-green/70 uppercase mb-0.5">SALARY INSIGHT</p>
                                <p className="text-[10px] text-muted leading-relaxed">{phase.salary_note}</p>
                              </div>
                            )}

                            <p className="text-xs text-muted leading-relaxed">{phase.description}</p>

                            {/* Skills */}
                            {phase.skills?.length > 0 && (
                              <div>
                                <p className="text-[9px] font-mono text-muted uppercase tracking-wider mb-1.5">SKILLS TO LEARN</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {phase.skills.map((skill) => (
                                    <SkillTag key={skill} name={skill} />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Certifications */}
                            {phase.certifications?.length > 0 && (
                              <div>
                                <p className="text-[9px] font-mono text-muted uppercase tracking-wider mb-1.5">CERTIFICATIONS</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {phase.certifications.map((cert) => (
                                    <span
                                      key={cert}
                                      className="px-2 py-0.5 rounded text-[10px] font-mono border"
                                      style={{ borderColor: `${roadmap.color}30`, color: roadmap.color, backgroundColor: `${roadmap.color}08` }}
                                    >
                                      {cert}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Projects */}
                            {phase.projects?.length > 0 && (
                              <div>
                                <p className="text-[9px] font-mono text-muted uppercase tracking-wider mb-1.5">PROJECTS</p>
                                <div className="space-y-1">
                                  {phase.projects.map((project) => (
                                    <div key={project} className="flex items-start gap-2 text-xs text-foreground">
                                      <span style={{ color: roadmap.color }}>◇</span>
                                      <span>{project}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Milestones */}
                            {phase.milestones?.length > 0 && (
                              <div>
                                <p className="text-[9px] font-mono text-muted uppercase tracking-wider mb-1.5">MILESTONES</p>
                                <div className="space-y-1">
                                  {phase.milestones.map((milestone) => (
                                    <div key={milestone} className="flex items-start gap-2 text-xs text-foreground">
                                      <span style={{ color: roadmap.color }}>◆</span>
                                      <span>{milestone}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      </ElectricBorder>
                    </div>
                  </AnimatedItem>
                ))}
              </div>
            </div>
          </div>
        </AnimatedItem>
      )}

      {/* Saved Roadmaps */}
      {savedRoadmaps.length > 0 && (
        <AnimatedItem>
          <div className="space-y-3">
            <h3 className="text-sm font-mono text-muted uppercase tracking-wider">SAVED ROADMAPS ({savedRoadmaps.length})</h3>
            <div className="space-y-2">
              {savedRoadmaps.map((rm) => (
                <div key={rm.id}>
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer hover:bg-[rgba(0,245,255,0.03)] transition-colors"
                    style={{ borderColor: `${rm.color || "#00F5FF"}20` }}
                    onClick={() => setExpandedId(expandedId === rm.id ? null : rm.id ?? null)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: rm.color || "#00F5FF", boxShadow: `0 0 8px ${rm.color || "#00F5FF"}40` }} />
                      <div>
                        <p className="text-sm font-mono font-semibold text-foreground">{rm.target_role}</p>
                        <p className="text-[10px] font-mono text-muted">
                          {rm.phases?.length || 0} phases • {rm.total_timeline || "N/A"}
                          {rm.mode === "progression" && <span className="text-neon-green ml-1">• salary</span>}
                          {rm.created_at && ` • ${new Date(rm.created_at).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(rm.id!); }}
                        className="text-[10px] font-mono text-muted hover:text-neon-red transition-colors px-2 py-1"
                      >
                        DEL
                      </button>
                      <span className="text-muted text-xs">{expandedId === rm.id ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {/* Expanded saved roadmap */}
                  {expandedId === rm.id && rm.phases && (
                    <div className="mt-3 ml-4 relative">
                      <div
                        className="absolute left-6 top-0 bottom-0 w-px"
                        style={{ backgroundColor: `${rm.color || "#00F5FF"}30` }}
                      />
                      <div className="space-y-3">
                        {rm.phases.map((phase, index) => (
                          <div key={index} className="relative pl-14">
                            <div
                              className="absolute left-4 top-4 w-3 h-3 rounded-full border-2"
                              style={{ borderColor: rm.color || "#00F5FF", backgroundColor: `${rm.color || "#00F5FF"}20` }}
                            />
                            <Card hover={false}>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
                                      style={{ backgroundColor: `${rm.color || "#00F5FF"}15`, color: rm.color || "#00F5FF" }}
                                    >
                                      {index + 1}
                                    </span>
                                    <h4 className="text-xs font-mono font-bold text-foreground">{phase.name}</h4>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {phase.salary_range && (
                                      <span className="text-[9px] font-mono font-bold text-neon-green">{phase.salary_range}</span>
                                    )}
                                    <span className="text-[9px] font-mono" style={{ color: rm.color || "#00F5FF" }}>{phase.timeline}</span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-muted">{phase.description}</p>
                                {phase.skills?.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {phase.skills.map((s) => (
                                      <span key={s} className="px-1.5 py-0.5 rounded text-[9px] font-mono border" style={{ borderColor: `${rm.color || "#00F5FF"}30`, color: rm.color || "#00F5FF" }}>{s}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </AnimatedItem>
      )}
    </AnimatedContainer>
  );
}
