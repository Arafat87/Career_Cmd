"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import CategorySelector from "@/components/CategorySelector";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import ElectricBorder from "@/components/ElectricBorder";
import { fetchArray } from "@/lib/fetch-helpers";

interface SavedJob {
  id: number;
  title: string;
  company: string;
  url: string;
  location: string;
  salary_min: number;
  salary_max: number;
  description: string;
  category: string;
  match_score: number;
  status: string;
  date_saved: string;
  notes: string;
}

const JOB_STATUSES = [
  { value: "BOOKMARKED", label: "BOOKMARKED", color: "text-neon-cyan/70", bg: "bg-neon-cyan/10", border: "border-neon-cyan/20" },
  { value: "APPLIED", label: "APPLIED", color: "text-neon-purple/70", bg: "bg-neon-purple/10", border: "border-neon-purple/20" },
  { value: "INTERVIEWING", label: "INTERVIEWING", color: "text-neon-yellow/70", bg: "bg-neon-yellow/10", border: "border-neon-yellow/20" },
  { value: "OFFER", label: "OFFER", color: "text-neon-green/70", bg: "bg-neon-green/10", border: "border-neon-green/20" },
  { value: "REJECTED", label: "REJECTED", color: "text-neon-red/70", bg: "bg-neon-red/10", border: "border-neon-red/20" },
];

function getMatchScoreStyle(score: number) {
  if (score >= 70) return { color: "text-neon-green/70", bg: "bg-neon-green/10", border: "border-neon-green/20" };
  if (score >= 40) return { color: "text-neon-cyan/70", bg: "bg-neon-cyan/10", border: "border-neon-cyan/20" };
  return { color: "text-neon-red/70", bg: "bg-neon-red/10", border: "border-neon-red/20" };
}

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<SavedJob | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [form, setForm] = useState({
    title: "",
    company: "",
    url: "",
    location: "",
    salary_min: 0,
    salary_max: 0,
    description: "",
    category: "",
    match_score: 0,
    status: "BOOKMARKED",
    date_saved: "",
    notes: "",
  });

  useEffect(() => {
    fetchJobs();
    fetchCategories();
  }, []);

  async function fetchJobs() {
    const data = await fetchArray("/api/saved-jobs");
    setJobs(data as SavedJob[]);
  }

  async function fetchCategories() {
    const data = await fetchArray("/api/categories?scope=saved-jobs");
    setCategories(data);
  }

  function getStatusStyle(status: string) {
    return JOB_STATUSES.find((s) => s.value === status) || JOB_STATUSES[0];
  }

  function getCategoryColor(name: string): string {
    const cat = categories.find((c: any) => c.name === name);
    return cat?.color || "#00F5FF";
  }

  function handleOpenModal(job?: SavedJob) {
    if (job) {
      setEditingJob(job);
      setForm({
        title: job.title,
        company: job.company,
        url: job.url,
        location: job.location,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        description: job.description,
        category: job.category,
        match_score: job.match_score,
        status: job.status,
        date_saved: job.date_saved,
        notes: job.notes,
      });
    } else {
      setEditingJob(null);
      setForm({
        title: "",
        company: "",
        url: "",
        location: "",
        salary_min: 0,
        salary_max: 0,
        description: "",
        category: "",
        match_score: 0,
        status: "BOOKMARKED",
        date_saved: "",
        notes: "",
      });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.company.trim()) return;
    if (editingJob) {
      await fetch("/api/saved-jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingJob.id, ...form }),
      });
    } else {
      await fetch("/api/saved-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setIsModalOpen(false);
    fetchJobs();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this saved job?")) return;
    await fetch(`/api/saved-jobs?id=${id}`, { method: "DELETE" });
    fetchJobs();
  }

  const filtered = filterStatus ? jobs.filter((j) => j.status === filterStatus) : jobs;
  const statusCounts = JOB_STATUSES.map((s) => ({
    ...s,
    count: jobs.filter((j) => j.status === s.value).length,
  }));

  return (
    <>
      <AnimatedContainer>
        <div className="flex items-center justify-between mb-6">
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">
            {jobs.length} SAVED JOB{jobs.length !== 1 ? "S" : ""}
          </GlowText>
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
            >
              + ADD SAVED JOB
            </button>
          </ElectricBorder>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterStatus("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              !filterStatus
                ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30"
                : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"
            }`}
          >
            ALL ({jobs.length})
          </button>
          {statusCounts
            .filter((s) => s.count > 0)
            .map((s) => (
              <button
                key={s.value}
                onClick={() => setFilterStatus(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  filterStatus === s.value
                    ? `${s.bg} ${s.color} border ${s.border}`
                    : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"
                }`}
              >
                {s.label} ({s.count})
              </button>
            ))}
        </div>

        {/* Jobs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((job) => {
            const st = getStatusStyle(job.status);
            const ms = getMatchScoreStyle(job.match_score);
            return (
              <AnimatedItem key={job.id}>
                <Card>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-mono font-semibold text-foreground">{job.title}</h4>
                        <p className="text-xs font-mono text-muted mt-0.5">{job.company}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.match_score > 0 && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${ms.color} ${ms.bg} border ${ms.border}`}
                          >
                            {job.match_score}%
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${st.color} ${st.bg} border ${st.border}`}
                        >
                          {st.label}
                        </span>
                      </div>
                    </div>
                    {job.category && (
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-mono border"
                        style={{
                          color: getCategoryColor(job.category),
                          borderColor: `${getCategoryColor(job.category)}30`,
                          backgroundColor: `${getCategoryColor(job.category)}10`,
                        }}
                      >
                        {job.category}
                      </span>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-muted">
                      {job.location && <p>LOCATION: {job.location}</p>}
                      {job.date_saved && <p>SAVED: {job.date_saved}</p>}
                      {(job.salary_min > 0 || job.salary_max > 0) && (
                        <p>
                          SALARY: ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                        </p>
                      )}
                    </div>
                    {job.description && (
                      <p className="text-xs font-mono text-foreground/60 line-clamp-2">{job.description}</p>
                    )}
                    {job.notes && <p className="text-xs font-mono text-foreground/40 line-clamp-2">{job.notes}</p>}
                    {job.url && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-neon-cyan/50 hover:text-neon-cyan truncate block"
                      >
                        {job.url}
                      </a>
                    )}
                    <div className="flex gap-2 pt-2 border-t border-[rgba(0,245,255,0.08)]">
                      <button
                        onClick={() => handleOpenModal(job)}
                        className="px-3 py-1 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] rounded text-xs font-mono text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)] transition-colors"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="px-3 py-1 bg-[rgba(255,45,85,0.05)] border border-[rgba(255,45,85,0.1)] rounded text-xs font-mono text-muted hover:text-neon-red hover:border-[rgba(255,45,85,0.2)] transition-colors"
                      >
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
              {filterStatus ? `No ${filterStatus} saved jobs` : "No saved jobs yet. Bookmark one to start tracking!"}
            </p>
          </Card>
        )}
      </AnimatedContainer>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingJob ? "EDIT SAVED JOB" : "ADD SAVED JOB"}
      >
        <div className="space-y-4">
          <FormField
            label="Title"
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <FormField
            label="Company"
            name="company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            required
          />
          <FormField
            label="URL"
            name="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://..."
          />
          <FormField
            label="Location"
            name="location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Salary Min"
              name="salary_min"
              type="number"
              value={form.salary_min.toString()}
              onChange={(e) => setForm({ ...form, salary_min: parseFloat(e.target.value) || 0 })}
            />
            <FormField
              label="Salary Max"
              name="salary_max"
              type="number"
              value={form.salary_max.toString()}
              onChange={(e) => setForm({ ...form, salary_max: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <CategorySelector scope="saved-jobs" value={form.category} onChange={(cat) => setForm({ ...form, category: cat })} />
          <FormField
            label="Match Score (0-100)"
            name="match_score"
            type="number"
            value={form.match_score.toString()}
            onChange={(e) => setForm({ ...form, match_score: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
          />
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {JOB_STATUSES.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setForm({ ...form, status: st.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                    form.status === st.value
                      ? `${st.bg} ${st.color} border ${st.border}`
                      : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
          <FormField
            label="Date Saved"
            name="date_saved"
            type="date"
            value={form.date_saved}
            onChange={(e) => setForm({ ...form, date_saved: e.target.value })}
          />
          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <FormField
            label="Notes"
            name="notes"
            type="textarea"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
            >
              {editingJob ? "UPDATE" : "CREATE"}
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
