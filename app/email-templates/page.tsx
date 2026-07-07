"use client";

import { useState } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";
import { AnimatedContainer } from "@/components/AnimatedList";
import ModelSelector from "@/components/ModelSelector";

const EMAIL_TEMPLATES = [
  {
    id: "thank-you",
    name: "Post-Interview Thank You",
    icon: "🙏",
    subject: "Thank you for the interview — {position} at {company}",
    body: `Hi {interviewer_name},

Thank you for taking the time to speak with me today about the {position} role at {company}. I really enjoyed learning more about the team and the work you're doing with {specific_topic}.

Our conversation reinforced my excitement about this opportunity. I'm particularly drawn to {company}'s approach to {unique_aspect}, and I believe my experience with {relevant_skill} would allow me to contribute meaningfully to the team.

Please don't hesitate to reach out if you need any additional information. I look forward to hearing from you.

Best regards,
{your_name}`,
  },
  {
    id: "recruiter-reply",
    name: "Recruiter Initial Reply",
    icon: "💼",
    subject: "Re: {position} Opportunity at {company}",
    body: `Hi {recruiter_name},

Thank you for reaching out about the {position} role at {company}. I'm very interested in learning more about this opportunity.

A bit about my background: I have {years} years of experience in {domain}, with deep expertise in {key_skills}. I'm currently {current_situation}.

I'd love to schedule a call to discuss the role in more detail. I'm available {availability}.

Looking forward to connecting.

Best,
{your_name}`,
  },
  {
    id: "offer-negotiation",
    name: "Offer Negotiation",
    icon: "💰",
    subject: "Re: Offer — {position} at {company}",
    body: `Hi {recruiter_name},

Thank you for extending the offer for the {position} role at {company}. I'm thrilled about the opportunity to join the team.

After careful consideration, I'd like to discuss the compensation package. Based on my research of market rates for similar roles in {location}, and considering my {years} years of experience in {domain} along with my expertise in {key_skills}, I was hoping we could explore a base salary closer to ${"{target_salary}"}.

I'm confident I can make an immediate impact on {specific_team_goal}, and I believe an adjusted compensation package would better reflect the value I'll bring to the team.

I'm open to discussing this further and finding a package that works for both of us.

Best regards,
{your_name}`,
  },
  {
    id: "rejection-response",
    name: "Graceful Rejection Response",
    icon: "🤝",
    subject: "Re: {position} at {company}",
    body: `Hi {recruiter_name},

Thank you for letting me know about your decision and for the time you invested in the interview process. I really enjoyed learning about {company} and the work your team is doing.

If possible, I'd appreciate any feedback on my interview — I'm always looking to improve. I'd also love to stay connected for any future opportunities that might be a better fit.

I wish you and the team all the best.

Warm regards,
{your_name}`,
  },
  {
    id: "follow-up",
    name: "Application Follow-Up",
    icon: "📧",
    subject: "Following up — {position} application at {company}",
    body: `Hi {recruiter_name},

I hope this message finds you well. I applied for the {position} role at {company} on {date} and wanted to follow up on my application.

I remain very interested in this opportunity. My background in {domain} and expertise in {key_skills} align well with the role's requirements, and I'd welcome the chance to discuss how I can contribute to {company}'s goals.

Please let me know if there's any additional information I can provide.

Thank you for your time.

Best,
{your_name}`,
  },
  {
    id: "referral-request",
    name: "Referral Request",
    icon: "🔗",
    subject: "Would you be open to referring me to {company}?",
    body: `Hi {contact_name},

I hope you're doing well! I noticed that {company} has an open {position} role, and I'm very interested in applying.

Given your experience at {company}, I was wondering if you'd be willing to refer me or connect me with the hiring team. I have {years} years of experience in {domain} with expertise in {key_skills}, and I believe I'd be a strong fit for the role.

I've attached my resume for reference. I'd be happy to chat more about my background if that would be helpful.

Thank you so much for considering this — I really appreciate it!

Best,
{your_name}`,
  },
];

export default function EmailTemplatesPage() {
  const [selected, setSelected] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);

  const template = EMAIL_TEMPLATES[selected];

  // Extract all {placeholders} from template
  const placeholders = [...new Set([...template.subject.matchAll(/\{(\w+)\}/g), ...template.body.matchAll(/\{(\w+)\}/g)].map(m => m[1]))];

  function getFilledText(text: string) {
    let result = text;
    Object.entries(formData).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value || `{${key}}`);
    });
    return result;
  }

  function copyToClipboard() {
    const text = aiResult || `Subject: ${getFilledText(template.subject)}\n\n${getFilledText(template.body)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function generateWithAI() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "email",
          modelId: selectedModelId,
          prompt: `Write a ${template.name.toLowerCase()} email.`,
          extra: {
            emailType: template.name,
            companyName: formData.company || "",
            position: formData.position || "",
            interviewerName: formData.interviewer_name || formData.recruiter_name || "",
          },
        }),
      });
      const data = await res.json();
      if (data.result) setAiResult(data.result);
    } catch (e) {
      console.error("AI generation failed:", e);
    }
    setAiLoading(false);
  }

  return (
    <AnimatedContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">EMAIL TEMPLATES</GlowText>
        <ModelSelector selectedModelId={selectedModelId} onSelect={setSelectedModelId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template list */}
        <div className="space-y-2">
          {EMAIL_TEMPLATES.map((t, i) => (
            <button key={t.id} onClick={() => { setSelected(i); setFormData({}); }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${selected === i ? "bg-neon-cyan/10 border border-neon-cyan/30" : "border border-transparent hover:bg-[rgba(0,245,255,0.03)]"}`}>
              <span className="text-lg">{t.icon}</span>
              <span className={`text-xs font-mono ${selected === i ? "text-neon-cyan" : "text-foreground"}`}>{t.name}</span>
            </button>
          ))}
        </div>

        {/* Variables form */}
        <Card hover={false}>
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-3">FILL IN VARIABLES</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {placeholders.map(p => (
              <div key={p}>
                <label className="block text-[9px] font-mono text-muted mb-0.5">{p.replace(/_/g, " ").toUpperCase()}</label>
                <input value={formData[p] || ""} onChange={e => setFormData({ ...formData, [p]: e.target.value })}
                  placeholder={`{${p}}`}
                  className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1.5 text-xs font-mono text-foreground" />
              </div>
            ))}
          </div>
        </Card>

        {/* Preview */}
        <Card hover={false}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider">PREVIEW</h3>
            <div className="flex gap-2">
              <button onClick={generateWithAI} disabled={aiLoading}
                className="px-2 py-1 text-[9px] font-mono text-neon-cyan border border-neon-cyan/20 rounded hover:bg-neon-cyan/10 disabled:opacity-50">
                {aiLoading ? "GENERATING..." : "✦ AI GENERATE"}
              </button>
              <button onClick={copyToClipboard}
                className={`px-2 py-1 text-[9px] font-mono rounded border transition-all ${copied ? "text-neon-green border-neon-green/30 bg-neon-green/10" : "text-neon-cyan border-neon-cyan/20 hover:bg-neon-cyan/10"}`}>
                {copied ? "COPIED!" : "COPY"}
              </button>
            </div>
          </div>
          <div className="bg-[#0a0a12] border border-[rgba(0,245,255,0.1)] rounded-lg p-4 max-h-96 overflow-y-auto">
            {aiResult ? (
              <pre className="whitespace-pre-wrap text-xs font-mono text-foreground/70 leading-relaxed">{aiResult}</pre>
            ) : (
              <>
                <p className="text-xs font-mono text-neon-cyan mb-3 pb-2 border-b border-[rgba(0,245,255,0.1)]">
                  Subject: {getFilledText(template.subject)}
                </p>
                <pre className="whitespace-pre-wrap text-xs font-mono text-foreground/70 leading-relaxed">{getFilledText(template.body)}</pre>
              </>
            )}
          </div>
        </Card>
      </div>
    </AnimatedContainer>
  );
}
