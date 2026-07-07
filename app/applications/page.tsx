"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import CategoryGroup from "@/components/CategoryGroup";
import CategorySelector from "@/components/CategorySelector";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import ElectricBorder from "@/components/ElectricBorder";
import Pagination from "@/components/Pagination";
import ConfirmDialog from "@/components/ConfirmDialog";
import { fetchArray } from "@/lib/fetch-helpers";

interface Application {
  id: number;
  company: string;
  position: string;
  status: string;
  date_applied: string;
  location: string;
  salary_min: number;
  salary_max: number;
  notes: string;
  url: string;
  category: string;
  interview_date: string;
}

const APP_STATUSES = [
  { value: "APPLIED", label: "APPLIED", color: "text-neon-cyan/70", bg: "bg-neon-cyan/10", border: "border-neon-cyan/20" },
  { value: "PHONE SCREEN", label: "PHONE SCREEN", color: "text-neon-purple/70", bg: "bg-neon-purple/10", border: "border-neon-purple/20" },
  { value: "INTERVIEW", label: "INTERVIEW", color: "text-neon-yellow/70", bg: "bg-neon-yellow/10", border: "border-neon-yellow/20" },
  { value: "OFFER", label: "OFFER", color: "text-neon-green/70", bg: "bg-neon-green/10", border: "border-neon-green/20" },
  { value: "REJECTED", label: "REJECTED", color: "text-neon-red/70", bg: "bg-neon-red/10", border: "border-neon-red/20" },
  { value: "WITHDRAWN", label: "WITHDRAWN", color: "text-muted", bg: "bg-muted/10", border: "border-muted/20" },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({
    company: "",
    position: "",
    status: "APPLIED",
    date_applied: "",
    location: "",
    salary_min: 0,
    salary_max: 0,
    notes: "",
    url: "",
    category: "",
    interview_date: "",
  });

  useEffect(() => {
    fetchApplications();
    fetchCategories();
  }, []);

  async function fetchApplications() {
    const data = await fetchArray("/api/applications");
    setApplications(data as Application[]);
  }

  async function fetchCategories() {
    const data = await fetchArray("/api/categories?scope=applications");
    setCategories(data);
  }

  function getStatusStyle(status: string) {
    return APP_STATUSES.find((s) => s.value === status) || APP_STATUSES[0];
  }

  function getCategoryColor(name: string): string {
    const cat = categories.find((c: any) => c.name === name);
    return cat?.color || "#00F5FF";
  }

  function handleOpenModal(app?: Application) {
    if (app) {
      setEditingApp(app);
      setForm({
        company: app.company,
        position: app.position,
        status: app.status,
        date_applied: app.date_applied,
        location: app.location,
        salary_min: app.salary_min,
        salary_max: app.salary_max,
        notes: app.notes,
        url: app.url,
        category: app.category,
        interview_date: app.interview_date || "",
      });
    } else {
      setEditingApp(null);
      setForm({ company: "", position: "", status: "APPLIED", date_applied: "", location: "", salary_min: 0, salary_max: 0, notes: "", url: "", category: "", interview_date: "" });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!form.company.trim() || !form.position.trim()) return;
    if (editingApp) {
      await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingApp.id, ...form }),
      });
    } else {
      await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setIsModalOpen(false);
    fetchApplications();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/applications?id=${id}`, { method: "DELETE" });
    fetchApplications();
    setDeleteId(null);
  }

  const filtered = filterStatus ? applications.filter((a) => a.status === filterStatus) : applications;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const statusCounts = APP_STATUSES.map((s) => ({
    ...s,
    count: applications.filter((a) => a.status === s.value).length,
  }));

  return (
    <>
      <AnimatedContainer>
        <div className="flex items-center justify-between mb-6">
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">
            {applications.length} APPLICATION{applications.length !== 1 ? "S" : ""}
          </GlowText>
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
            >
              + ADD APPLICATION
            </button>
          </ElectricBorder>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => { setFilterStatus(""); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              !filterStatus ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"
            }`}
          >
            ALL ({applications.length})
          </button>
          {statusCounts.filter((s) => s.count > 0).map((s) => (
            <button
              key={s.value}
              onClick={() => { setFilterStatus(s.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                filterStatus === s.value ? `${s.bg} ${s.color} border ${s.border}` : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"
              }`}
            >
              {s.label} ({s.count})
            </button>
          ))}
        </div>

        {/* Applications grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginated.map((app) => {
            const st = getStatusStyle(app.status);
            return (
              <AnimatedItem key={app.id}>
                <Card>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-mono font-semibold text-foreground">{app.position}</h4>
                        <p className="text-xs font-mono text-muted mt-0.5">{app.company}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${st.color} ${st.bg} border ${st.border}`}>
                        {st.label}
                      </span>
                    </div>
                    {app.category && (
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-mono border"
                        style={{ color: getCategoryColor(app.category), borderColor: `${getCategoryColor(app.category)}30`, backgroundColor: `${getCategoryColor(app.category)}10` }}
                      >
                        {app.category}
                      </span>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-muted">
                      {app.location && <p>📍 {app.location}</p>}
                      {app.date_applied && <p>📅 {app.date_applied}</p>}
                      {(app.salary_min > 0 || app.salary_max > 0) && (
                        <p>💰 ${app.salary_min.toLocaleString()} - ${app.salary_max.toLocaleString()}</p>
                      )}
                      {app.interview_date && <p>🎤 {app.interview_date}</p>}
                    </div>
                    {app.notes && <p className="text-xs font-mono text-foreground/60 line-clamp-2">{app.notes}</p>}
                    {app.url && (
                      <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-neon-cyan/50 hover:text-neon-cyan truncate block">
                        {app.url}
                      </a>
                    )}
                    <div className="flex gap-2 pt-2 border-t border-[rgba(0,245,255,0.08)]">
                      <button onClick={() => handleOpenModal(app)} className="px-3 py-1 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] rounded text-xs font-mono text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)] transition-colors">
                        EDIT
                      </button>
                      <button onClick={() => setDeleteId(app.id)} className="px-3 py-1 bg-[rgba(255,45,85,0.05)] border border-[rgba(255,45,85,0.1)] rounded text-xs font-mono text-muted hover:text-neon-red hover:border-[rgba(255,45,85,0.2)] transition-colors">
                        DEL
                      </button>
                    </div>
                  </div>
                </Card>
              </AnimatedItem>
            );
          })}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

        {filtered.length === 0 && (
          <Card hover={false}>
            <p className="text-sm font-mono text-muted text-center">
              {filterStatus ? `No ${filterStatus} applications` : "No applications yet. Add one to start tracking!"}
            </p>
          </Card>
        )}
      </AnimatedContainer>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingApp ? "EDIT APPLICATION" : "ADD APPLICATION"}>
        <div className="space-y-4">
          <FormField label="Company" name="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
          <FormField label="Position" name="position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required />
          <CategorySelector scope="applications" value={form.category} onChange={(cat) => setForm({ ...form, category: cat })} />
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {APP_STATUSES.map((st) => (
                <button key={st.value} type="button" onClick={() => setForm({ ...form, status: st.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${form.status === st.value ? `${st.bg} ${st.color} border ${st.border}` : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"}`}>
                  {st.label}
                </button>
              ))}
            </div>
          </div>
          <FormField label="Date Applied" name="date_applied" type="date" value={form.date_applied} onChange={(e) => setForm({ ...form, date_applied: e.target.value })} />
          <FormField label="Location" name="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Salary Min" name="salary_min" type="number" value={form.salary_min.toString()} onChange={(e) => setForm({ ...form, salary_min: parseFloat(e.target.value) || 0 })} />
            <FormField label="Salary Max" name="salary_max" type="number" value={form.salary_max.toString()} onChange={(e) => setForm({ ...form, salary_max: parseFloat(e.target.value) || 0 })} />
          </div>
          <FormField label="Interview Date" name="interview_date" type="date" value={form.interview_date} onChange={(e) => setForm({ ...form, interview_date: e.target.value })} />
          <FormField label="URL" name="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
          <FormField label="Notes" name="notes" type="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">
              {editingApp ? "UPDATE" : "CREATE"}
            </button>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground transition-colors">
              CANCEL
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="DELETE APPLICATION"
        message="This action cannot be undone. The application record will be permanently removed."
        confirmLabel="DELETE"
      />
    </>
  );
}
