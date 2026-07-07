"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import GlowText from "@/components/GlowText";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import LoadingBar from "@/components/LoadingBar";
import ElectricBorder from "@/components/ElectricBorder";

interface Goal {
  id: number;
  title: string;
  description: string;
  category: string;
  targetDate: string;
  status: "NOT STARTED" | "IN PROGRESS" | "COMPLETED";
  progress: number;
  milestones: { text: string; done: boolean }[];
  created_at: string;
}

const CATEGORIES = ["CAREER", "SKILLS", "CERTIFICATIONS", "INTERVIEWS", "SALARY", "PERSONAL"];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", category: "CAREER", targetDate: "",
    milestones: [""],
  });

  useEffect(() => {
    fetch("/api/goals").then(r => r.json()).then(data => { if (Array.isArray(data)) setGoals(data); }).catch(() => {});
  }, []);

  async function fetchGoals() {
    const res = await fetch("/api/goals");
    const data = await res.json();
    if (Array.isArray(data)) setGoals(data);
  }

  function handleOpenModal(goal?: Goal) {
    if (goal) {
      setEditingGoal(goal);
      setForm({
        title: goal.title, description: goal.description, category: goal.category,
        targetDate: goal.targetDate, milestones: goal.milestones.length ? goal.milestones.map(m => m.text) : [""],
      });
    } else {
      setEditingGoal(null);
      setForm({ title: "", description: "", category: "CAREER", targetDate: "", milestones: [""] });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    const data = {
      ...form,
      milestones: form.milestones.filter(m => m.trim()).map(m => ({ text: m, done: false })),
    };
    if (editingGoal) {
      await fetch("/api/goals", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingGoal.id, ...data, status: editingGoal.status, progress: editingGoal.progress }) });
    } else {
      await fetch("/api/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    }
    setIsModalOpen(false);
    fetchGoals();
  }

  async function toggleMilestone(goalId: number, milestoneIdx: number) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const milestones = [...goal.milestones];
    milestones[milestoneIdx] = { ...milestones[milestoneIdx], done: !milestones[milestoneIdx].done };
    const progress = milestones.length ? Math.round((milestones.filter(m => m.done).length / milestones.length) * 100) : 0;
    const status = progress === 100 ? "COMPLETED" : progress > 0 ? "IN PROGRESS" : "NOT STARTED";
    await fetch("/api/goals", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: goalId, milestones, progress, status }) });
    fetchGoals();
  }

  async function deleteGoal(id: number) {
    if (!confirm("Delete this goal?")) return;
    await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
    fetchGoals();
  }

  const filtered = filterCategory ? goals.filter(g => g.category === filterCategory) : goals;
  const completed = goals.filter(g => g.status === "COMPLETED").length;

  return (
    <AnimatedContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">GOAL TRACKER</GlowText>
          <span className="text-[10px] font-mono text-muted">{completed}/{goals.length} completed</span>
        </div>
        <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
          <button onClick={() => handleOpenModal()}
            className="px-3 py-1.5 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-xs text-neon-cyan hover:bg-neon-cyan/30 transition-colors">+ NEW GOAL</button>
        </ElectricBorder>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterCategory("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono ${!filterCategory ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>ALL</button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilterCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono ${filterCategory === c ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>{c}</button>
        ))}
      </div>

      {/* Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(goal => (
          <AnimatedItem key={goal.id}>
            <Card hover={false} className={goal.status === "COMPLETED" ? "border-neon-green/20" : ""}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-neon-purple/10 text-neon-purple border border-neon-purple/20">{goal.category}</span>
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-[8px] font-mono ${goal.status === "COMPLETED" ? "bg-neon-green/10 text-neon-green border border-neon-green/20" : goal.status === "IN PROGRESS" ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20" : "bg-[rgba(0,245,255,0.05)] text-muted border border-[rgba(0,245,255,0.1)]"}`}>{goal.status}</span>
                </div>
                <button onClick={() => deleteGoal(goal.id)} className="text-muted hover:text-neon-red text-xs">✕</button>
              </div>
              <h4 className="text-sm font-mono font-semibold text-foreground mb-1">{goal.title}</h4>
              {goal.description && <p className="text-[10px] font-mono text-muted mb-3">{goal.description}</p>}

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono text-muted">PROGRESS</span>
                  <span className="text-[9px] font-mono text-neon-cyan">{goal.progress}%</span>
                </div>
                <LoadingBar progress={goal.progress} color={goal.status === "COMPLETED" ? "#00FF88" : "#00F5FF"} segments={20} height={4} animated={false} />
              </div>

              {goal.milestones.length > 0 && (
                <div className="space-y-1">
                  {goal.milestones.map((m, i) => (
                    <button key={i} onClick={() => toggleMilestone(goal.id, i)}
                      className="flex items-center gap-2 w-full text-left p-1 rounded hover:bg-[rgba(0,245,255,0.03)] transition-colors">
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${m.done ? "bg-neon-green/20 border-neon-green/40" : "border-[rgba(0,245,255,0.2)]"}`}>
                        {m.done && <span className="text-[8px] text-neon-green">✓</span>}
                      </div>
                      <span className={`text-[10px] font-mono ${m.done ? "text-muted line-through" : "text-foreground"}`}>{m.text}</span>
                    </button>
                  ))}
                </div>
              )}

              {goal.targetDate && (
                <p className="text-[9px] font-mono text-muted mt-2">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
              )}
            </Card>
          </AnimatedItem>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card hover={false} className="text-center py-12">
          <p className="text-sm font-mono text-muted">No goals yet. Set your first career goal!</p>
        </Card>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingGoal ? "EDIT GOAL" : "NEW GOAL"}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted mb-1">Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Get AWS Solutions Architect certified"
              className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground" />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Details..."
              className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground resize-none h-20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-muted mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-1">Target Date</label>
              <input type="date" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })}
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Milestones</label>
            {form.milestones.map((m, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={m} onChange={e => { const next = [...form.milestones]; next[i] = e.target.value; setForm({ ...form, milestones: next }); }}
                  placeholder={`Milestone ${i + 1}`}
                  className="flex-1 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground" />
                {form.milestones.length > 1 && (
                  <button onClick={() => setForm({ ...form, milestones: form.milestones.filter((_, j) => j !== i) })}
                    className="px-2 text-muted hover:text-neon-red">✕</button>
                )}
              </div>
            ))}
            <button onClick={() => setForm({ ...form, milestones: [...form.milestones, ""] })}
              className="text-[10px] font-mono text-neon-cyan hover:text-neon-cyan/80">+ Add milestone</button>
          </div>
          <button onClick={handleSave} disabled={!form.title.trim()}
            className="w-full px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 disabled:opacity-50">
            {editingGoal ? "UPDATE" : "CREATE"} GOAL
          </button>
        </div>
      </Modal>
    </AnimatedContainer>
  );
}
