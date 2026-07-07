"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import GlowText from "@/components/GlowText";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import ModelSelector from "@/components/ModelSelector";
import ElectricBorder from "@/components/ElectricBorder";

interface Company {
  id: number;
  name: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  glassdoor_rating: number;
  tech_stack: string;
  culture_notes: string;
  contacts: string;
  status: string;
  color: string;
  created_at: string;
}

const STATUSES = ["RESEARCHING", "APPLIED", "INTERESTED", "BLACKLISTED"];

interface SuggestedCompany {
  name: string;
  industry: string;
  reason: string;
  website: string;
  selected: boolean;
  status: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState({
    name: "", industry: "", size: "", location: "", website: "",
    glassdoor_rating: 0, tech_stack: "", culture_notes: "", contacts: "", status: "RESEARCHING", color: "#00F5FF",
  });
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [aiDiscoverOpen, setAiDiscoverOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedCompany[]>([]);

  useEffect(() => { fetchCompanies(); }, []);

  async function fetchCompanies() {
    const res = await fetch("/api/companies");
    const data = await res.json();
    if (Array.isArray(data)) setCompanies(data);
  }

  async function discoverCompanies() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "company-discover",
          modelId: selectedModelId,
          prompt: "Suggest 8 companies that would be a good fit for me based on my skills, experience, and career goals. Focus on companies known for hiring in my tech stack.",
          extra: {},
        }),
      });
      const data = await res.json();
      if (data.result) {
        try {
          const parsed = JSON.parse(data.result);
          if (Array.isArray(parsed)) {
            setSuggestions(parsed.map((s: any) => ({
              name: s.name || "",
              industry: s.industry || "Tech",
              reason: s.reason || "",
              website: s.website || "",
              selected: false,
              status: "RESEARCHING",
            })));
          }
        } catch {
          // If not valid JSON, show raw result as single suggestion
          setSuggestions([{ name: "AI Response", industry: "", reason: data.result, website: "", selected: false, status: "RESEARCHING" }]);
        }
      }
    } catch (e) {
      console.error("AI discovery failed:", e);
    }
    setAiLoading(false);
  }

  async function addSelectedCompanies() {
    const selected = suggestions.filter(s => s.selected);
    for (const s of selected) {
      await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: s.name, industry: s.industry, website: s.website,
          size: "", location: "", glassdoor_rating: 0, tech_stack: "",
          culture_notes: s.reason, contacts: "", status: s.status, color: "#00F5FF",
        }),
      });
    }
    setSuggestions([]);
    setAiDiscoverOpen(false);
    fetchCompanies();
  }

  function handleOpenModal(c?: Company) {
    if (c) {
      setEditing(c);
      setForm({ name: c.name, industry: c.industry, size: c.size, location: c.location, website: c.website,
        glassdoor_rating: c.glassdoor_rating, tech_stack: c.tech_stack, culture_notes: c.culture_notes, contacts: c.contacts, status: c.status, color: c.color });
    } else {
      setEditing(null);
      setForm({ name: "", industry: "", size: "", location: "", website: "", glassdoor_rating: 0, tech_stack: "", culture_notes: "", contacts: "", status: "RESEARCHING", color: "#00F5FF" });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    if (editing) {
      await fetch("/api/companies", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, ...form }) });
    } else {
      await fetch("/api/companies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setIsModalOpen(false);
    fetchCompanies();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete?")) return;
    await fetch(`/api/companies?id=${id}`, { method: "DELETE" });
    fetchCompanies();
  }

  const filtered = filterStatus ? companies.filter(c => c.status === filterStatus) : companies;

  return (
    <AnimatedContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">COMPANY RESEARCH HUB ({companies.length})</GlowText>
        <div className="flex items-center gap-3">
          <ModelSelector selectedModelId={selectedModelId} onSelect={setSelectedModelId} />
          <button onClick={() => { setAiDiscoverOpen(!aiDiscoverOpen); if (!aiDiscoverOpen && suggestions.length === 0) discoverCompanies(); }}
            className="px-3 py-1.5 bg-neon-purple/20 border border-neon-purple/30 rounded-lg font-mono text-xs text-neon-purple hover:bg-neon-purple/30">
            {aiDiscoverOpen ? "CLOSE" : "✦ AI DISCOVER"}
          </button>
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button onClick={() => handleOpenModal()}
              className="px-3 py-1.5 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-xs text-neon-cyan hover:bg-neon-cyan/30">+ ADD COMPANY</button>
          </ElectricBorder>
        </div>
      </div>

      {/* AI Discovery Panel */}
      {aiDiscoverOpen && (
        <Card hover={false} className="border-neon-purple/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono text-neon-purple tracking-wider">AI COMPANY SUGGESTIONS</h3>
            <div className="flex gap-2">
              <button onClick={discoverCompanies} disabled={aiLoading}
                className="px-2 py-1 text-[10px] font-mono bg-neon-purple/10 border border-neon-purple/20 rounded text-neon-purple hover:bg-neon-purple/20 disabled:opacity-50">
                {aiLoading ? "ANALYZING..." : "REFRESH"}
              </button>
              <button onClick={addSelectedCompanies}
                disabled={!suggestions.some(s => s.selected)}
                className="px-2 py-1 text-[10px] font-mono bg-neon-green/10 border border-neon-green/20 rounded text-neon-green hover:bg-neon-green/20 disabled:opacity-50">
                ADD SELECTED
              </button>
            </div>
          </div>
          {aiLoading && suggestions.length === 0 ? (
            <div className="text-center py-6 text-muted text-xs font-mono">Discovering companies that match your profile...</div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg border border-[rgba(0,245,255,0.08)] hover:bg-[rgba(0,245,255,0.03)]">
                  <input type="checkbox" checked={s.selected}
                    onChange={() => setSuggestions(prev => prev.map((p, j) => j === i ? { ...p, selected: !p.selected } : p))}
                    className="mt-1 accent-neon-purple" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-foreground">{s.name}</span>
                      {s.industry && <span className="text-[9px] px-1.5 py-0.5 rounded bg-neon-purple/10 text-neon-purple">{s.industry}</span>}
                      {s.website && <a href={s.website} target="_blank" rel="noopener noreferrer" className="text-[9px] text-neon-cyan hover:underline">LINK</a>}
                    </div>
                    {s.reason && <p className="text-[10px] text-muted mt-0.5 line-clamp-2">{s.reason}</p>}
                  </div>
                  <select value={s.status}
                    onChange={e => setSuggestions(prev => prev.map((p, j) => j === i ? { ...p, status: e.target.value } : p))}
                    className="text-[9px] px-1.5 py-0.5 bg-[#0d0d18] border border-[rgba(0,245,255,0.15)] rounded text-muted">
                    {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted text-xs font-mono">No suggestions yet. Click REFRESH to discover companies.</div>
          )}
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterStatus("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono ${!filterStatus ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>ALL</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono ${filterStatus === s ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>{s}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <AnimatedItem key={c.id}>
            <Card hover={false}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <h4 className="text-sm font-mono font-bold text-foreground">{c.name}</h4>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(c)} className="text-muted hover:text-neon-cyan text-xs">✎</button>
                  <button onClick={() => handleDelete(c.id)} className="text-muted hover:text-neon-red text-xs">✕</button>
                </div>
              </div>
              <div className="space-y-1 mb-3">
                {c.industry && <p className="text-[10px] font-mono text-muted">{c.industry}{c.size ? ` • ${c.size}` : ""}</p>}
                {c.location && <p className="text-[10px] font-mono text-muted">📍 {c.location}</p>}
                {c.glassdoor_rating > 0 && (
                  <p className="text-[10px] font-mono text-neon-yellow">★ {c.glassdoor_rating}/5 Glassdoor</p>
                )}
              </div>
              {c.tech_stack && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {c.tech_stack.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-neon-cyan/5 border border-neon-cyan/10 text-muted">{t}</span>
                  ))}
                </div>
              )}
              {c.culture_notes && <p className="text-[10px] font-mono text-foreground/50 mb-2 line-clamp-3">{c.culture_notes}</p>}
              {c.contacts && <p className="text-[10px] font-mono text-muted">👤 {c.contacts}</p>}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-[rgba(0,245,255,0.05)]">
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-neon-purple/10 text-neon-purple border border-neon-purple/20">{c.status}</span>
                {c.website && <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-[9px] font-mono text-neon-cyan hover:underline">WEBSITE →</a>}
              </div>
            </Card>
          </AnimatedItem>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? "EDIT COMPANY" : "ADD COMPANY"}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[9px] font-mono text-muted mb-1">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground" /></div>
            <div><label className="block text-[9px] font-mono text-muted mb-1">Industry</label>
              <input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-[9px] font-mono text-muted mb-1">Size</label>
              <input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} placeholder="1000-5000" className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground" /></div>
            <div><label className="block text-[9px] font-mono text-muted mb-1">Location</label>
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground" /></div>
            <div><label className="block text-[9px] font-mono text-muted mb-1">Glassdoor</label>
              <input type="number" min="0" max="5" step="0.1" value={form.glassdoor_rating} onChange={e => setForm({ ...form, glassdoor_rating: Number(e.target.value) })} className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground" /></div>
          </div>
          <div><label className="block text-[9px] font-mono text-muted mb-1">Website</label>
            <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground" /></div>
          <div><label className="block text-[9px] font-mono text-muted mb-1">Tech Stack (comma-separated)</label>
            <input value={form.tech_stack} onChange={e => setForm({ ...form, tech_stack: e.target.value })} placeholder="Kubernetes, Go, AWS..." className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground" /></div>
          <div><label className="block text-[9px] font-mono text-muted mb-1">Culture Notes</label>
            <textarea value={form.culture_notes} onChange={e => setForm({ ...form, culture_notes: e.target.value })} className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground resize-none h-16" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[9px] font-mono text-muted mb-1">Contacts</label>
              <input value={form.contacts} onChange={e => setForm({ ...form, contacts: e.target.value })} placeholder="Recruiter name, LinkedIn..." className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground" /></div>
            <div><label className="block text-[9px] font-mono text-muted mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground">
                {STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div><label className="block text-[9px] font-mono text-muted mb-1">Color</label>
            <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-12 h-8 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded cursor-pointer" /></div>
          <button onClick={handleSave} disabled={!form.name.trim()} className="w-full px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan disabled:opacity-50">{editing ? "UPDATE" : "ADD"} COMPANY</button>
        </div>
      </Modal>
    </AnimatedContainer>
  );
}
