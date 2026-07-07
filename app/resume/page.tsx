"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";
import { AnimatedContainer } from "@/components/AnimatedList";
import ModelSelector from "@/components/ModelSelector";

interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  experience: { company: string; role: string; period: string; bullets: string }[];
  education: { school: string; degree: string; year: string }[];
  skills: string;
  certifications: string;
}

const EMPTY: ResumeData = {
  name: "", title: "", email: "", phone: "", location: "", linkedin: "", github: "",
  summary: "", experience: [{ company: "", role: "", period: "", bullets: "" }],
  education: [{ school: "", degree: "", year: "" }], skills: "", certifications: "",
};

export default function ResumePage() {
  const [data, setData] = useState<ResumeData>(EMPTY);
  const [showPreview, setShowPreview] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("hireops_resume");
    if (saved) setData(JSON.parse(saved));
  }, []);

  function save() {
    localStorage.setItem("hireops_resume", JSON.stringify(data));
  }

  async function generateWithAI(section: string) {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "resume",
          modelId: selectedModelId,
          prompt: `Improve my resume ${section} section. Make it ATS-optimized with strong action verbs and quantified achievements.`,
          extra: {
            targetRole: data.title,
            section: section,
          },
        }),
      });
      const result = await res.json();
      if (result.result) {
        if (section === "summary") {
          setData(prev => ({ ...prev, summary: result.result }));
        } else if (section === "skills") {
          setData(prev => ({ ...prev, skills: result.result }));
        }
      }
    } catch (e) {
      console.error("AI generation failed:", e);
    }
    setAiLoading(false);
  }

  function updateField<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setData(prev => ({ ...prev, [key]: value }));
  }

  function addExperience() {
    setData(prev => ({ ...prev, experience: [...prev.experience, { company: "", role: "", period: "", bullets: "" }] }));
  }

  function addEducation() {
    setData(prev => ({ ...prev, education: [...prev.education, { school: "", degree: "", year: "" }] }));
  }

  function printResume() {
    setShowPreview(true);
    setTimeout(() => window.print(), 500);
  }

  return (
    <AnimatedContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">RESUME BUILDER</GlowText>
        <div className="flex items-center gap-3">
          <ModelSelector selectedModelId={selectedModelId} onSelect={setSelectedModelId} />
          <button onClick={save} className="px-3 py-1.5 bg-neon-green/10 border border-neon-green/20 rounded-lg font-mono text-xs text-neon-green hover:bg-neon-green/20">SAVE</button>
          <button onClick={printResume} className="px-3 py-1.5 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-xs text-neon-cyan hover:bg-neon-cyan/30">PRINT / PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          <Card hover={false}>
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-3">PERSONAL INFO</h3>
            <div className="space-y-2">
              {(["name", "title", "email", "phone", "location", "linkedin", "github"] as const).map(f => (
                <div key={f}>
                  <label className="block text-[9px] font-mono text-muted mb-0.5">{f.toUpperCase()}</label>
                  <input value={data[f]} onChange={e => updateField(f, e.target.value)}
                    className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1.5 text-xs font-mono text-foreground" />
                </div>
              ))}
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono text-muted uppercase tracking-wider">SUMMARY</h3>
              <button onClick={() => generateWithAI("summary")} disabled={aiLoading}
                className="px-2 py-1 text-[9px] font-mono text-neon-cyan border border-neon-cyan/20 rounded hover:bg-neon-cyan/10 disabled:opacity-50">
                {aiLoading ? "..." : "✦ AI IMPROVE"}
              </button>
            </div>
            <textarea value={data.summary} onChange={e => updateField("summary", e.target.value)} rows={4}
              className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1.5 text-xs font-mono text-foreground resize-none" />
          </Card>

          <Card hover={false}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono text-muted uppercase tracking-wider">EXPERIENCE</h3>
              <button onClick={addExperience} className="text-[10px] font-mono text-neon-cyan">+ ADD</button>
            </div>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-4 p-3 rounded-lg border border-[rgba(0,245,255,0.08)]">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input value={exp.company} onChange={e => { const next = [...data.experience]; next[i] = { ...next[i], company: e.target.value }; updateField("experience", next); }}
                    placeholder="Company" className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1.5 text-xs font-mono text-foreground" />
                  <input value={exp.role} onChange={e => { const next = [...data.experience]; next[i] = { ...next[i], role: e.target.value }; updateField("experience", next); }}
                    placeholder="Role" className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1.5 text-xs font-mono text-foreground" />
                </div>
                <input value={exp.period} onChange={e => { const next = [...data.experience]; next[i] = { ...next[i], period: e.target.value }; updateField("experience", next); }}
                  placeholder="Jan 2022 — Present" className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1.5 text-xs font-mono text-foreground mb-2" />
                <textarea value={exp.bullets} onChange={e => { const next = [...data.experience]; next[i] = { ...next[i], bullets: e.target.value }; updateField("experience", next); }}
                  placeholder="• Reduced deployment time by 80%...&#10;• Built CI/CD pipeline serving 50+ devs..."
                  className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1.5 text-xs font-mono text-foreground resize-none h-20" />
              </div>
            ))}
          </Card>

          <Card hover={false}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono text-muted uppercase tracking-wider">EDUCATION</h3>
              <button onClick={addEducation} className="text-[10px] font-mono text-neon-cyan">+ ADD</button>
            </div>
            {data.education.map((ed, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                <input value={ed.school} onChange={e => { const next = [...data.education]; next[i] = { ...next[i], school: e.target.value }; updateField("education", next); }}
                  placeholder="School" className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1.5 text-xs font-mono text-foreground" />
                <input value={ed.degree} onChange={e => { const next = [...data.education]; next[i] = { ...next[i], degree: e.target.value }; updateField("education", next); }}
                  placeholder="Degree" className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1.5 text-xs font-mono text-foreground" />
                <input value={ed.year} onChange={e => { const next = [...data.education]; next[i] = { ...next[i], year: e.target.value }; updateField("education", next); }}
                  placeholder="2024" className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1.5 text-xs font-mono text-foreground" />
              </div>
            ))}
          </Card>

          <Card hover={false}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono text-muted uppercase tracking-wider">SKILLS</h3>
              <button onClick={() => generateWithAI("skills")} disabled={aiLoading}
                className="px-2 py-1 text-[9px] font-mono text-neon-cyan border border-neon-cyan/20 rounded hover:bg-neon-cyan/10 disabled:opacity-50">
                {aiLoading ? "..." : "✦ AI SUGGEST"}
              </button>
            </div>
            <textarea value={data.skills} onChange={e => updateField("skills", e.target.value)} placeholder="AWS, Kubernetes, Terraform, Python, Docker..."
              className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1.5 text-xs font-mono text-foreground resize-none h-16" />
          </Card>

          <Card hover={false}>
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-3">CERTIFICATIONS</h3>
            <textarea value={data.certifications} onChange={e => updateField("certifications", e.target.value)} placeholder="AWS Solutions Architect, CCNA, CompTIA Security+..."
              className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1.5 text-xs font-mono text-foreground resize-none h-16" />
          </Card>
        </div>

        {/* Preview */}
        <div className="sticky top-4">
          <Card hover={false} className="bg-white text-black p-8 print:shadow-none print:border-none">
            <div className="border-b-2 border-gray-800 pb-3 mb-4">
              <h1 className="text-xl font-bold">{data.name || "Your Name"}</h1>
              <p className="text-sm text-gray-600">{data.title || "Job Title"}</p>
              <div className="flex gap-3 text-[10px] text-gray-500 mt-1">
                {data.email && <span>{data.email}</span>}
                {data.phone && <span>{data.phone}</span>}
                {data.location && <span>{data.location}</span>}
                {data.linkedin && <span>{data.linkedin}</span>}
                {data.github && <span>{data.github}</span>}
              </div>
            </div>

            {data.summary && (
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 mb-1">Summary</h2>
                <p className="text-[11px] text-gray-700 leading-relaxed">{data.summary}</p>
              </div>
            )}

            {data.experience.some(e => e.company || e.role) && (
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 mb-1">Experience</h2>
                {data.experience.filter(e => e.company || e.role).map((exp, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between">
                      <span className="text-[11px] font-bold">{exp.role || "Role"} — {exp.company || "Company"}</span>
                      <span className="text-[10px] text-gray-500">{exp.period}</span>
                    </div>
                    <pre className="text-[10px] text-gray-600 whitespace-pre-wrap mt-0.5">{exp.bullets}</pre>
                  </div>
                ))}
              </div>
            )}

            {data.education.some(e => e.school) && (
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 mb-1">Education</h2>
                {data.education.filter(e => e.school).map((ed, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-[11px]">{ed.degree} — {ed.school}</span>
                    <span className="text-[10px] text-gray-500">{ed.year}</span>
                  </div>
                ))}
              </div>
            )}

            {data.skills && (
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 mb-1">Skills</h2>
                <p className="text-[10px] text-gray-700">{data.skills}</p>
              </div>
            )}

            {data.certifications && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 mb-1">Certifications</h2>
                <p className="text-[10px] text-gray-700">{data.certifications}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AnimatedContainer>
  );
}
