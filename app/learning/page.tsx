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

interface LearningResource {
  id: number;
  title: string;
  url: string;
  resource_type: string;
  skill_category: string;
  status: string;
  progress_pct: number;
  notes: string;
  priority: number;
}

const RESOURCE_TYPES = [
  { value: "COURSE", label: "COURSE", color: "text-neon-cyan/70", bg: "bg-neon-cyan/10", border: "border-neon-cyan/20" },
  { value: "DOCUMENTATION", label: "DOCUMENTATION", color: "text-neon-purple/70", bg: "bg-neon-purple/10", border: "border-neon-purple/20" },
  { value: "LAB", label: "LAB", color: "text-neon-green/70", bg: "bg-neon-green/10", border: "border-neon-green/20" },
  { value: "BOOK", label: "BOOK", color: "text-neon-yellow/70", bg: "bg-neon-yellow/10", border: "border-neon-yellow/20" },
  { value: "VIDEO", label: "VIDEO", color: "text-neon-red/70", bg: "bg-neon-red/10", border: "border-neon-red/20" },
];

const RESOURCE_STATUSES = [
  { value: "NOT STARTED", label: "NOT STARTED", color: "text-muted", bg: "bg-muted/10", border: "border-muted/20" },
  { value: "IN PROGRESS", label: "IN PROGRESS", color: "text-neon-cyan/70", bg: "bg-neon-cyan/10", border: "border-neon-cyan/20" },
  { value: "COMPLETED", label: "COMPLETED", color: "text-neon-green/70", bg: "bg-neon-green/10", border: "border-neon-green/20" },
];

export default function LearningPage() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [form, setForm] = useState({
    title: "",
    url: "",
    resource_type: "COURSE",
    skill_category: "",
    status: "NOT STARTED",
    progress_pct: 0,
    notes: "",
    priority: 1,
  });

  useEffect(() => {
    fetchResources();
    fetchCategories();
  }, []);

  async function fetchResources() {
    const data = await fetchArray("/api/learning");
    setResources(data as LearningResource[]);
  }

  async function fetchCategories() {
    const data = await fetchArray("/api/categories?scope=learning");
    setCategories(data);
  }

  function getTypeStyle(type: string) {
    return RESOURCE_TYPES.find((t) => t.value === type) || RESOURCE_TYPES[0];
  }

  function getStatusStyle(status: string) {
    return RESOURCE_STATUSES.find((s) => s.value === status) || RESOURCE_STATUSES[0];
  }

  function getCategoryColor(name: string): string {
    const cat = categories.find((c: any) => c.name === name);
    return cat?.color || "#00F5FF";
  }

  function handleOpenModal(resource?: LearningResource) {
    if (resource) {
      setEditingResource(resource);
      setForm({
        title: resource.title,
        url: resource.url,
        resource_type: resource.resource_type,
        skill_category: resource.skill_category,
        status: resource.status,
        progress_pct: resource.progress_pct,
        notes: resource.notes,
        priority: resource.priority,
      });
    } else {
      setEditingResource(null);
      setForm({ title: "", url: "", resource_type: "COURSE", skill_category: "", status: "NOT STARTED", progress_pct: 0, notes: "", priority: 1 });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    if (editingResource) {
      await fetch("/api/learning", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingResource.id, ...form }),
      });
    } else {
      await fetch("/api/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setIsModalOpen(false);
    fetchResources();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this learning resource?")) return;
    await fetch(`/api/learning?id=${id}`, { method: "DELETE" });
    fetchResources();
  }

  const filtered = filterStatus ? resources.filter((r) => r.status === filterStatus) : resources;
  const statusCounts = RESOURCE_STATUSES.map((s) => ({
    ...s,
    count: resources.filter((r) => r.status === s.value).length,
  }));

  return (
    <>
      <AnimatedContainer>
        <div className="flex items-center justify-between mb-6">
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">
            {resources.length} RESOURCE{resources.length !== 1 ? "S" : ""}
          </GlowText>
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
            >
              + ADD RESOURCE
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
            ALL ({resources.length})
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

        {/* Resources grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((resource) => {
            const tt = getTypeStyle(resource.resource_type);
            const st = getStatusStyle(resource.status);
            return (
              <AnimatedItem key={resource.id}>
                <Card>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-mono font-semibold text-foreground">{resource.title}</h4>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${tt.color} ${tt.bg} border ${tt.border}`}>
                          {tt.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${st.color} ${st.bg} border ${st.border}`}>
                          {st.label}
                        </span>
                      </div>
                    </div>
                    {resource.skill_category && (
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-mono border"
                        style={{ color: getCategoryColor(resource.skill_category), borderColor: `${getCategoryColor(resource.skill_category)}30`, backgroundColor: `${getCategoryColor(resource.skill_category)}10` }}
                      >
                        {resource.skill_category}
                      </span>
                    )}
                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono text-muted">
                        <span>Progress</span>
                        <span>{resource.progress_pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[rgba(0,245,255,0.08)]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${resource.progress_pct}%`,
                            backgroundColor:
                              resource.progress_pct >= 100
                                ? "#39FF14"
                                : resource.progress_pct > 0
                                ? "#00F5FF"
                                : "rgba(0,245,255,0.15)",
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-muted">
                      <p>Priority: {resource.priority}</p>
                    </div>
                    {resource.notes && <p className="text-xs font-mono text-foreground/60 line-clamp-2">{resource.notes}</p>}
                    {resource.url && (
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-neon-cyan/50 hover:text-neon-cyan truncate block">
                        {resource.url}
                      </a>
                    )}
                    <div className="flex gap-2 pt-2 border-t border-[rgba(0,245,255,0.08)]">
                      <button onClick={() => handleOpenModal(resource)} className="px-3 py-1 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] rounded text-xs font-mono text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)] transition-colors">
                        EDIT
                      </button>
                      <button onClick={() => handleDelete(resource.id)} className="px-3 py-1 bg-[rgba(255,45,85,0.05)] border border-[rgba(255,45,85,0.1)] rounded text-xs font-mono text-muted hover:text-neon-red hover:border-[rgba(255,45,85,0.2)] transition-colors">
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
              {filterStatus ? `No ${filterStatus} resources` : "No learning resources yet. Add one to start tracking!"}
            </p>
          </Card>
        )}
      </AnimatedContainer>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingResource ? "EDIT RESOURCE" : "ADD RESOURCE"}>
        <div className="space-y-4">
          <FormField label="Title" name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <FormField label="URL" name="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Resource Type</label>
            <div className="flex flex-wrap gap-2">
              {RESOURCE_TYPES.map((tt) => (
                <button key={tt.value} type="button" onClick={() => setForm({ ...form, resource_type: tt.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${form.resource_type === tt.value ? `${tt.bg} ${tt.color} border ${tt.border}` : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"}`}>
                  {tt.label}
                </button>
              ))}
            </div>
          </div>
          <CategorySelector scope="learning" value={form.skill_category} onChange={(cat) => setForm({ ...form, skill_category: cat })} />
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {RESOURCE_STATUSES.map((st) => (
                <button key={st.value} type="button" onClick={() => setForm({ ...form, status: st.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${form.status === st.value ? `${st.bg} ${st.color} border ${st.border}` : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"}`}>
                  {st.label}
                </button>
              ))}
            </div>
          </div>
          <FormField label="Progress (%)" name="progress_pct" type="number" value={form.progress_pct.toString()} onChange={(e) => setForm({ ...form, progress_pct: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })} />
          <FormField label="Priority" name="priority" type="number" value={form.priority.toString()} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 1 })} />
          <FormField label="Notes" name="notes" type="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">
              {editingResource ? "UPDATE" : "CREATE"}
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
