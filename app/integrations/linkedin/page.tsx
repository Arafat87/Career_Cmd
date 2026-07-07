"use client";

import { useState } from "react";
import Card from "@/components/Card";
import SkillTag from "@/components/SkillTag";
import ThinkingIndicator from "@/components/ThinkingIndicator";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";

export default function LinkedInPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());
  const [addedProjects, setAddedProjects] = useState<Set<number>>(new Set());

  async function handleParse() {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/integrations/linkedin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function addSkill(skill: string) {
    await fetch("/api/techstack", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: skill, category: "LinkedIn Import", proficiency_goal: "Intermediate", image_url: "" }),
    });
    setAddedSkills((prev) => new Set([...prev, skill]));
  }

  async function addExperience(exp: any, idx: number) {
    await fetch("/api/projects", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${exp.title} at ${exp.company}`,
        status: "DONE",
        technologies: "",
        category: "LinkedIn Import",
        deadline: "",
        description: exp.description || "",
        goal: exp.duration || "",
      }),
    });
    setAddedProjects((prev) => new Set([...prev, idx]));
  }

  return (
    <AnimatedContainer className="space-y-6">
      <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">LINKEDIN IMPORT</GlowText>

      <Card hover={false}>
        <p className="text-xs font-mono text-muted mb-3">Paste your LinkedIn profile text (About, Experience, Skills sections):</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Copy and paste your LinkedIn profile..."
          className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted mb-4" />
        <button onClick={handleParse} disabled={loading || !text.trim()} className="px-6 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50">
          {loading ? "PARSING..." : "PARSE PROFILE"}
        </button>
      </Card>

      {loading && <ThinkingIndicator />}
      {error && <Card hover={false}><p className="text-sm font-mono text-neon-red">{error}</p></Card>}

      {result && (
        <div className="space-y-4">
          {result.summary && (
            <Card hover={false}><h3 className="text-sm font-mono text-neon-cyan/70 mb-2">SUMMARY</h3><p className="text-xs font-mono text-foreground/70">{result.summary}</p></Card>
          )}

          {result.skills?.length > 0 && (
            <Card hover={false}>
              <h3 className="text-sm font-mono text-neon-cyan/70 mb-3">SKILLS ({result.skills.length})</h3>
              <div className="flex flex-wrap gap-2">
                {result.skills.map((skill: string) => (
                  <button key={skill} onClick={() => addSkill(skill)} disabled={addedSkills.has(skill)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-colors ${addedSkills.has(skill) ? "bg-neon-green/10 border border-neon-green/20 text-neon-green" : "bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] text-foreground hover:border-[rgba(0,245,255,0.2)]"}`}>
                    {addedSkills.has(skill) ? "✓" : "+"} {skill}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {result.experience?.length > 0 && (
            <Card hover={false}>
              <h3 className="text-sm font-mono text-neon-cyan/70 mb-3">EXPERIENCE ({result.experience.length})</h3>
              <div className="space-y-3">
                {result.experience.map((exp: any, i: number) => (
                  <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-[rgba(0,245,255,0.02)] border border-[rgba(0,245,255,0.08)]">
                    <div>
                      <p className="text-sm font-mono font-semibold text-foreground">{exp.title}</p>
                      <p className="text-xs font-mono text-muted">{exp.company} {exp.duration && `• ${exp.duration}`}</p>
                      {exp.description && <p className="text-xs font-mono text-foreground/50 mt-1 line-clamp-2">{exp.description}</p>}
                    </div>
                    <button onClick={() => addExperience(exp, i)} disabled={addedProjects.has(i)}
                      className={`px-3 py-1 rounded text-xs font-mono flex-shrink-0 ml-3 ${addedProjects.has(i) ? "bg-neon-green/10 border border-neon-green/20 text-neon-green" : "bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] text-muted hover:text-foreground"}`}>
                      {addedProjects.has(i) ? "✓" : "+ PROJECT"}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {result.education?.length > 0 && (
            <Card hover={false}>
              <h3 className="text-sm font-mono text-neon-cyan/70 mb-3">EDUCATION</h3>
              <div className="space-y-2">{result.education.map((edu: any, i: number) => (
                <div key={i}><p className="text-sm font-mono text-foreground">{edu.degree}</p><p className="text-xs font-mono text-muted">{edu.school} {edu.year && `• ${edu.year}`}</p></div>
              ))}</div>
            </Card>
          )}

          {result.certifications?.length > 0 && (
            <Card hover={false}>
              <h3 className="text-sm font-mono text-neon-cyan/70 mb-3">CERTIFICATIONS</h3>
              <div className="flex flex-wrap gap-1">{result.certifications.map((c: string) => <SkillTag key={c} name={c} category="LinkedIn" />)}</div>
            </Card>
          )}
        </div>
      )}
    </AnimatedContainer>
  );
}
