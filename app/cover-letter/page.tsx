"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";
import { AnimatedContainer } from "@/components/AnimatedList";
import ModelSelector from "@/components/ModelSelector";

const TEMPLATES = [
  {
    name: "Standard Professional",
    template: `Dear Hiring Manager,

I am writing to express my strong interest in the {position} role at {company}. With my background in {skills}, I am confident I would be a valuable addition to your team.

{experience_highlight}

I am particularly drawn to {company} because {company_reason}. My expertise in {relevant_skills} aligns well with the requirements of this position.

I would welcome the opportunity to discuss how my skills and experience can contribute to {company}'s continued success.

Best regards,
{your_name}`,
  },
  {
    name: "Technical Focus",
    template: `Dear {company} Engineering Team,

I'm excited to apply for the {position} position. As a {current_role} with {years} years of experience in {domain}, I've built deep expertise in {technical_skills}.

Key achievements:
• {achievement_1}
• {achievement_2}
• {achievement_3}

I'm passionate about {company}'s work in {company_focus} and would love to bring my experience in {relevant_area} to help drive your technical initiatives forward.

Looking forward to connecting.

Best,
{your_name}`,
  },
  {
    name: "Career Changer",
    template: `Dear Hiring Manager,

I am writing to apply for the {position} role at {company}. While my background is in {previous_field}, I have spent the past {transition_period} building expertise in {new_field} through {learning_methods}.

My transferable skills in {transferable_skills} combined with my fresh perspective in {new_field} allow me to approach problems with a unique angle.

{motivation_paragraph}

I am eager to bring my {soft_skills} and newly developed {technical_skills} to {company}.

Thank you for your consideration.

{your_name}`,
  },
];

export default function CoverLetterPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [formData, setFormData] = useState({
    position: "", company: "", your_name: "", skills: "", experience_highlight: "",
    company_reason: "", relevant_skills: "", current_role: "", years: "", domain: "",
    technical_skills: "", company_focus: "", relevant_area: "", achievement_1: "",
    achievement_2: "", achievement_3: "", previous_field: "", transition_period: "",
    new_field: "", learning_methods: "", transferable_skills: "", motivation_paragraph: "",
    soft_skills: "",
  });
  const [generated, setGenerated] = useState("");
  const [savedLetters, setSavedLetters] = useState<{ id: number; company: string; position: string; letter: string; date: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("hireops_cover_letters");
    if (saved) setSavedLetters(JSON.parse(saved));
  }, []);

  function generate() {
    let letter = TEMPLATES[selectedTemplate].template;
    Object.entries(formData).forEach(([key, value]) => {
      letter = letter.replace(new RegExp(`\\{${key}\\}`, "g"), value || `[${key}]`);
    });
    setGenerated(letter);
  }

  async function generateWithAI() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cover-letter",
          modelId: selectedModelId,
          prompt: "Write a professional cover letter based on my actual experience and skills.",
          extra: {
            companyName: formData.company,
            position: formData.position,
            template: TEMPLATES[selectedTemplate].name,
            jobDescription: formData.experience_highlight,
          },
        }),
      });
      const data = await res.json();
      if (data.result) setGenerated(data.result);
    } catch (e) {
      console.error("AI generation failed:", e);
    }
    setAiLoading(false);
  }

  function saveLetter() {
    const entry = {
      id: Date.now(),
      company: formData.company,
      position: formData.position,
      letter: generated,
      date: new Date().toISOString(),
    };
    const next = [entry, ...savedLetters];
    setSavedLetters(next);
    localStorage.setItem("hireops_cover_letters", JSON.stringify(next));
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generated);
  }

  const fields = [
    { key: "position", label: "Position", placeholder: "Senior Cloud Engineer" },
    { key: "company", label: "Company", placeholder: "Google" },
    { key: "your_name", label: "Your Name", placeholder: "John Doe" },
    { key: "skills", label: "Key Skills", placeholder: "AWS, Kubernetes, Terraform" },
    { key: "experience_highlight", label: "Experience Highlight", placeholder: "In my previous role at X, I..." },
    { key: "company_reason", label: "Why This Company?", placeholder: "Your innovative approach to..." },
    { key: "relevant_skills", label: "Relevant Skills", placeholder: "cloud architecture, DevOps..." },
  ];

  return (
    <AnimatedContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">COVER LETTER GENERATOR</GlowText>
        <ModelSelector selectedModelId={selectedModelId} onSelect={setSelectedModelId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card hover={false}>
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-4">TEMPLATE</h3>
          <div className="flex gap-2 mb-4">
            {TEMPLATES.map((t, i) => (
              <button key={i} onClick={() => setSelectedTemplate(i)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono transition-all ${selectedTemplate === i ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>{t.name}</button>
            ))}
          </div>

          <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-3 mt-6">DETAILS</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-[9px] font-mono text-muted mb-0.5">{f.label}</label>
                <input value={(formData as any)[f.key]} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} placeholder={f.placeholder}
                  className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted/30" />
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={generate}
              className="flex-1 px-4 py-2.5 bg-neon-purple/20 border border-neon-purple/30 rounded-lg font-mono text-sm text-neon-purple hover:bg-neon-purple/30 transition-colors">
              GENERATE FROM TEMPLATE
            </button>
            <button onClick={generateWithAI} disabled={aiLoading}
              className="flex-1 px-4 py-2.5 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50">
              {aiLoading ? "GENERATING..." : "✦ AI GENERATE"}
            </button>
          </div>
        </Card>

        {/* Preview */}
        <Card hover={false}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider">PREVIEW</h3>
            {generated && (
              <div className="flex gap-2">
                <button onClick={copyToClipboard} className="px-2 py-1 text-[9px] font-mono text-neon-cyan border border-neon-cyan/20 rounded hover:bg-neon-cyan/10">COPY</button>
                <button onClick={saveLetter} className="px-2 py-1 text-[9px] font-mono text-neon-green border border-neon-green/20 rounded hover:bg-neon-green/10">SAVE</button>
              </div>
            )}
          </div>
          {generated ? (
            <pre className="whitespace-pre-wrap text-xs font-mono text-foreground/80 leading-relaxed bg-[#0a0a12] border border-[rgba(0,245,255,0.1)] rounded-lg p-4 max-h-[500px] overflow-y-auto">{generated}</pre>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted/30 text-xs font-mono">Fill in the details and click Generate</div>
          )}
        </Card>
      </div>

      {/* Saved Letters */}
      {savedLetters.length > 0 && (
        <Card hover={false}>
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-3">SAVED LETTERS ({savedLetters.length})</h3>
          <div className="space-y-2">
            {savedLetters.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-2 rounded-lg border border-[rgba(0,245,255,0.05)] hover:bg-[rgba(0,245,255,0.03)]">
                <div>
                  <span className="text-xs font-mono text-foreground">{l.position}</span>
                  <span className="text-xs font-mono text-muted mx-2">@</span>
                  <span className="text-xs font-mono text-neon-cyan">{l.company}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-mono text-muted">{new Date(l.date).toLocaleDateString()}</span>
                  <button onClick={() => { navigator.clipboard.writeText(l.letter); }} className="text-[9px] font-mono text-muted hover:text-neon-cyan">COPY</button>
                  <button onClick={() => setSavedLetters((prev) => { const next = prev.filter((s) => s.id !== l.id); localStorage.setItem("hireops_cover_letters", JSON.stringify(next)); return next; })}
                    className="text-[9px] font-mono text-muted hover:text-neon-red">DELETE</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </AnimatedContainer>
  );
}
