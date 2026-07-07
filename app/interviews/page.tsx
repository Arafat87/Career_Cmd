"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import CategorySelector from "@/components/CategorySelector";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import ElectricBorder from "@/components/ElectricBorder";
import { fetchArray } from "@/lib/fetch-helpers";

interface Interview {
  id: number;
  company: string;
  position: string;
  round_type: string;
  date: string;
  time: string;
  location: string;
  interviewer_name: string;
  feedback: string;
  status: string;
  prep_notes: string;
}

const ROUND_TYPES = [
  { value: "PHONE", label: "PHONE", color: "text-neon-cyan/70", bg: "bg-neon-cyan/10", border: "border-neon-cyan/20" },
  { value: "TECHNICAL", label: "TECHNICAL", color: "text-neon-purple/70", bg: "bg-neon-purple/10", border: "border-neon-purple/20" },
  { value: "BEHAVIORAL", label: "BEHAVIORAL", color: "text-neon-yellow/70", bg: "bg-neon-yellow/10", border: "border-neon-yellow/20" },
  { value: "ONSITE", label: "ONSITE", color: "text-neon-green/70", bg: "bg-neon-green/10", border: "border-neon-green/20" },
  { value: "FINAL", label: "FINAL", color: "text-neon-red/70", bg: "bg-neon-red/10", border: "border-neon-red/20" },
  { value: "OTHER", label: "OTHER", color: "text-muted", bg: "bg-muted/10", border: "border-muted/20" },
];

const INTERVIEW_STATUSES = [
  { value: "SCHEDULED", label: "SCHEDULED", color: "text-neon-cyan/70", bg: "bg-neon-cyan/10", border: "border-neon-cyan/20" },
  { value: "COMPLETED", label: "COMPLETED", color: "text-neon-green/70", bg: "bg-neon-green/10", border: "border-neon-green/20" },
  { value: "CANCELLED", label: "CANCELLED", color: "text-neon-red/70", bg: "bg-neon-red/10", border: "border-neon-red/20" },
];

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [form, setForm] = useState({
    company: "",
    position: "",
    round_type: "PHONE",
    date: "",
    time: "",
    location: "",
    interviewer_name: "",
    feedback: "",
    status: "SCHEDULED",
    prep_notes: "",
  });

  useEffect(() => {
    fetchInterviews();
    fetchCategories();
  }, []);

  async function fetchInterviews() {
    const data = await fetchArray("/api/interviews");
    setInterviews(data as Interview[]);
  }

  async function fetchCategories() {
    const data = await fetchArray("/api/categories?scope=interviews");
    setCategories(data);
  }

  function getRoundTypeStyle(roundType: string) {
    return ROUND_TYPES.find((r) => r.value === roundType) || ROUND_TYPES[5];
  }

  function getStatusStyle(status: string) {
    return INTERVIEW_STATUSES.find((s) => s.value === status) || INTERVIEW_STATUSES[0];
  }

  function handleOpenModal(interview?: Interview) {
    if (interview) {
      setEditingInterview(interview);
      setForm({
        company: interview.company,
        position: interview.position,
        round_type: interview.round_type,
        date: interview.date,
        time: interview.time,
        location: interview.location,
        interviewer_name: interview.interviewer_name,
        feedback: interview.feedback,
        status: interview.status,
        prep_notes: interview.prep_notes,
      });
    } else {
      setEditingInterview(null);
      setForm({ company: "", position: "", round_type: "PHONE", date: "", time: "", location: "", interviewer_name: "", feedback: "", status: "SCHEDULED", prep_notes: "" });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!form.company.trim()) return;
    if (editingInterview) {
      await fetch("/api/interviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingInterview.id, ...form }),
      });
    } else {
      await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setIsModalOpen(false);
    fetchInterviews();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this interview?")) return;
    await fetch(`/api/interviews?id=${id}`, { method: "DELETE" });
    fetchInterviews();
  }

  const filtered = filterStatus ? interviews.filter((i) => i.status === filterStatus) : interviews;
  const statusCounts = INTERVIEW_STATUSES.map((s) => ({
    ...s,
    count: interviews.filter((i) => i.status === s.value).length,
  }));

  return (
    <>
      <AnimatedContainer>
        <div className="flex items-center justify-between mb-6">
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">
            {interviews.length} INTERVIEW{interviews.length !== 1 ? "S" : ""}
          </GlowText>
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
            >
              + ADD INTERVIEW
            </button>
          </ElectricBorder>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterStatus("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              !filterStatus ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"
            }`}
          >
            ALL ({interviews.length})
          </button>
          {statusCounts.filter((s) => s.count > 0).map((s) => (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                filterStatus === s.value ? `${s.bg} ${s.color} border ${s.border}` : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"
              }`}
            >
              {s.label} ({s.count})
            </button>
          ))}
        </div>

        {/* Interviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((interview) => {
            const rt = getRoundTypeStyle(interview.round_type);
            const st = getStatusStyle(interview.status);
            return (
              <AnimatedItem key={interview.id}>
                <Card>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-mono font-semibold text-foreground">{interview.company}</h4>
                        {interview.position && <p className="text-xs font-mono text-muted mt-0.5">{interview.position}</p>}
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${rt.color} ${rt.bg} border ${rt.border}`}>
                          {rt.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${st.color} ${st.bg} border ${st.border}`}>
                          {st.label}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-muted">
                      {interview.date && <p>📅 {interview.date}</p>}
                      {interview.time && <p>🕐 {interview.time}</p>}
                      {interview.location && <p>📍 {interview.location}</p>}
                      {interview.interviewer_name && <p>👤 {interview.interviewer_name}</p>}
                    </div>
                    {interview.feedback && <p className="text-xs font-mono text-foreground/60 line-clamp-2">{interview.feedback}</p>}
                    <div className="flex gap-2 pt-2 border-t border-[rgba(0,245,255,0.08)]">
                      <button onClick={() => handleOpenModal(interview)} className="px-3 py-1 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] rounded text-xs font-mono text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)] transition-colors">
                        EDIT
                      </button>
                      <button onClick={() => handleDelete(interview.id)} className="px-3 py-1 bg-[rgba(255,45,85,0.05)] border border-[rgba(255,45,85,0.1)] rounded text-xs font-mono text-muted hover:text-neon-red hover:border-[rgba(255,45,85,0.2)] transition-colors">
                        DEL
                      </button>
                    </div>
                  </div>
                </Card>
              </AnimatedItem>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <Card hover={false}>
            <p className="text-sm font-mono text-muted text-center">
              {filterStatus ? `No ${filterStatus} interviews` : "No interviews yet. Add one to start tracking!"}
            </p>
          </Card>
        )}
      </AnimatedContainer>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingInterview ? "EDIT INTERVIEW" : "ADD INTERVIEW"}>
        <div className="space-y-4">
          <FormField label="Company" name="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
          <FormField label="Position" name="position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Round Type</label>
            <div className="flex flex-wrap gap-2">
              {ROUND_TYPES.map((rt) => (
                <button key={rt.value} type="button" onClick={() => setForm({ ...form, round_type: rt.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${form.round_type === rt.value ? `${rt.bg} ${rt.color} border ${rt.border}` : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"}`}>
                  {rt.label}
                </button>
              ))}
            </div>
          </div>
          <FormField label="Date" name="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <FormField label="Time" name="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="e.g. 2:00 PM" />
          <FormField label="Location" name="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Zoom, On-site, etc." />
          <FormField label="Interviewer Name" name="interviewer_name" value={form.interviewer_name} onChange={(e) => setForm({ ...form, interviewer_name: e.target.value })} />
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {INTERVIEW_STATUSES.map((st) => (
                <button key={st.value} type="button" onClick={() => setForm({ ...form, status: st.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${form.status === st.value ? `${st.bg} ${st.color} border ${st.border}` : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"}`}>
                  {st.label}
                </button>
              ))}
            </div>
          </div>
          <FormField label="Prep Notes" name="prep_notes" type="textarea" value={form.prep_notes} onChange={(e) => setForm({ ...form, prep_notes: e.target.value })} />
          <FormField label="Feedback" name="feedback" type="textarea" value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">
              {editingInterview ? "UPDATE" : "CREATE"}
            </button>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground transition-colors">
              CANCEL
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
