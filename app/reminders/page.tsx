"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import CategorySelector from "@/components/CategorySelector";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import { fetchArray } from "@/lib/fetch-helpers";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import ElectricBorder from "@/components/ElectricBorder";

interface ReminderItem {
  id: string;
  type: "certification" | "project" | "custom";
  name: string;
  date: string;
  daysLeft: number;
  category: string;
  color: string;
  sourceId?: number;
}

interface CustomReminder {
  id: number;
  title: string;
  date: string;
  type: string;
  category: string;
  color: string;
  reference_id: number | null;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderItem | null>(null);
  const [form, setForm] = useState({ title: "", date: "", category: "", color: "#00F5FF" });

  useEffect(() => {
    fetchReminders();
    fetchCategories();
  }, []);

  async function fetchReminders() {
    try {
      const [certs, projects, customReminders] = await Promise.all([
        fetchArray("/api/certifications"),
        fetchArray("/api/projects"),
        fetchArray("/api/reminders"),
      ]);

      const now = new Date();
      const maxDate = new Date(now.getTime() + 270 * 24 * 60 * 60 * 1000);

      const certReminders: ReminderItem[] = (certs as any[])
        .filter((c) => {
          if (!c.expiration_date) return false;
          const d = new Date(c.expiration_date);
          return d >= now && d <= maxDate;
        })
        .map((c) => ({
          id: `cert-${c.id}`,
          type: "certification" as const,
          name: c.name,
          date: c.expiration_date,
          daysLeft: Math.ceil(
            (new Date(c.expiration_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          ),
          category: c.category || "Certification",
          color: "#00F5FF",
          sourceId: c.id,
        }));

      const projectReminders: ReminderItem[] = (projects as any[])
        .filter((p) => {
          if (!p.deadline || p.status === "DONE") return false;
          const d = new Date(p.deadline);
          return d >= now && d <= maxDate;
        })
        .map((p) => ({
          id: `project-${p.id}`,
          type: "project" as const,
          name: p.name,
          date: p.deadline,
          daysLeft: Math.ceil(
            (new Date(p.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          ),
          category: p.category || "Project",
          color: "#BF00FF",
          sourceId: p.id,
        }));

      const customItems: ReminderItem[] = (customReminders as CustomReminder[])
        .filter((r) => {
          const d = new Date(r.date);
          return d >= now && d <= maxDate;
        })
        .map((r) => ({
          id: `custom-${r.id}`,
          type: "custom" as const,
          name: r.title,
          date: r.date,
          daysLeft: Math.ceil(
            (new Date(r.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          ),
          category: r.category || "Custom",
          color: r.color || "#00F5FF",
          sourceId: r.id,
        }));

      const all = [...certReminders, ...projectReminders, ...customItems].sort(
        (a, b) => a.daysLeft - b.daysLeft
      );

      setReminders(all);
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    }
  }

  async function fetchCategories() {
    const res = await fetch("/api/categories?scope=reminders");
    const data = await res.json();
    setCategories(data);
  }

  function getColorForDays(daysLeft: number) {
    if (daysLeft <= 30) return { color: "#FF2D55", glow: "glow-red", label: "CRITICAL" };
    if (daysLeft <= 90) return { color: "#FF8C00", glow: "glow-orange", label: "WARNING" };
    if (daysLeft <= 180) return { color: "#FFD700", glow: "glow-yellow", label: "ATTENTION" };
    if (daysLeft <= 210) return { color: "#00FF88", glow: "glow-green", label: "MODERATE" };
    if (daysLeft <= 240) return { color: "#00804A", glow: "glow-dark-green", label: "DISTANT" };
    return { color: "#0088FF", glow: "glow-blue", label: "FAR" };
  }

  function handleOpenModal(reminder?: ReminderItem) {
    if (reminder) {
      setEditingReminder(reminder);
      setForm({
        title: reminder.name,
        date: reminder.date,
        category: reminder.category,
        color: reminder.color || "#00F5FF",
      });
    } else {
      setEditingReminder(null);
      setForm({ title: "", date: "", category: "", color: "#00F5FF" });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.date) return;

    if (editingReminder && editingReminder.type === "custom") {
      const id = editingReminder.sourceId;
      await fetch("/api/reminders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: form.title,
          date: form.date,
          type: "custom",
          category: form.category,
          color: form.color,
        }),
      });
    } else {
      await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          date: form.date,
          type: "custom",
          category: form.category,
          color: form.color,
          reference_id: null,
        }),
      });
    }

    setIsModalOpen(false);
    fetchReminders();
  }

  async function handleDeleteReminder(reminder: ReminderItem) {
    if (!confirm("Delete this reminder?")) return;

    if (reminder.type === "custom" && reminder.sourceId) {
      await fetch(`/api/reminders?id=${reminder.sourceId}`, { method: "DELETE" });
    }

    fetchReminders();
  }

  // Summary counts
  const counts = {
    critical: reminders.filter((r) => r.daysLeft <= 30).length,
    warning: reminders.filter((r) => r.daysLeft > 30 && r.daysLeft <= 90).length,
    attention: reminders.filter((r) => r.daysLeft > 90 && r.daysLeft <= 180).length,
    moderate: reminders.filter((r) => r.daysLeft > 180 && r.daysLeft <= 210).length,
    distant: reminders.filter((r) => r.daysLeft > 210 && r.daysLeft <= 240).length,
    far: reminders.filter((r) => r.daysLeft > 240).length,
  };

  return (
    <>
      <AnimatedContainer className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-mono text-neon-cyan/70">
            {reminders.length} REMINDERS
          </h2>
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-[rgba(0,245,255,0.1)] border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-[rgba(0,245,255,0.2)] transition-colors"
            >
              + ADD REMINDER
            </button>
          </ElectricBorder>
        </div>

        {/* Summary Cards */}
        {reminders.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <Card hover={false} className="border-[#FF2D5530]">
              <div className="text-center">
                <span className="w-2 h-2 rounded-full bg-neon-red inline-block animate-pulse-glow" />
                <p className="text-xl font-mono font-bold text-neon-red/70 mt-1">{counts.critical}</p>
                <p className="text-[10px] font-mono text-muted">0-30d</p>
              </div>
            </Card>
            <Card hover={false} className="border-[#FF8C0030]">
              <div className="text-center">
                <span className="w-2 h-2 rounded-full bg-neon-orange inline-block animate-pulse-glow" />
                <p className="text-xl font-mono font-bold text-neon-orange/70 mt-1">{counts.warning}</p>
                <p className="text-[10px] font-mono text-muted">31-90d</p>
              </div>
            </Card>
            <Card hover={false} className="border-[#FFD70030]">
              <div className="text-center">
                <span className="w-2 h-2 rounded-full bg-neon-yellow inline-block animate-pulse-glow" />
                <p className="text-xl font-mono font-bold text-neon-yellow/70 mt-1">{counts.attention}</p>
                <p className="text-[10px] font-mono text-muted">91-180d</p>
              </div>
            </Card>
            <Card hover={false} className="border-[#00FF8830]">
              <div className="text-center">
                <span className="w-2 h-2 rounded-full bg-neon-light-green inline-block animate-pulse-glow" />
                <p className="text-xl font-mono font-bold text-neon-light-green/70 mt-1">{counts.moderate}</p>
                <p className="text-[10px] font-mono text-muted">181-210d</p>
              </div>
            </Card>
            <Card hover={false} className="border-[#00804A30]">
              <div className="text-center">
                <span className="w-2 h-2 rounded-full bg-neon-dark-green inline-block animate-pulse-glow" />
                <p className="text-xl font-mono font-bold text-neon-dark-green/70 mt-1">{counts.distant}</p>
                <p className="text-[10px] font-mono text-muted">211-240d</p>
              </div>
            </Card>
            <Card hover={false} className="border-[#0088FF30]">
              <div className="text-center">
                <span className="w-2 h-2 rounded-full bg-neon-blue inline-block animate-pulse-glow" />
                <p className="text-xl font-mono font-bold text-neon-blue/70 mt-1">{counts.far}</p>
                <p className="text-[10px] font-mono text-muted">241-270d</p>
              </div>
            </Card>
          </div>
        )}

        {/* Reminder List */}
        <div className="space-y-3">
          {reminders.map((reminder) => {
            const urgency = getColorForDays(reminder.daysLeft);
            return (
              <AnimatedItem key={reminder.id}>
                <Card
                  hover={false}
                  className="border-l-2"
                  style={{ borderLeftColor: reminder.color || urgency.color }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span
                        className="w-2.5 h-2.5 rounded-full animate-pulse-glow"
                        style={{ backgroundColor: reminder.color || urgency.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-mono border"
                            style={{
                              color: reminder.color || urgency.color,
                              borderColor: `${reminder.color || urgency.color}40`,
                              backgroundColor: `${reminder.color || urgency.color}10`,
                            }}
                          >
                            {reminder.category || (reminder.type === "certification"
                              ? "CERT"
                              : reminder.type === "project"
                              ? "PROJECT"
                              : "CUSTOM")}
                          </span>
                          <h4 className="text-sm font-mono font-semibold text-foreground">
                            {reminder.name}
                          </h4>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p
                          className="text-lg font-mono font-bold"
                          style={{
                            color: urgency.color,
                            textShadow: `0 0 7px ${urgency.color}, 0 0 10px ${urgency.color}`,
                          }}
                        >
                          {reminder.daysLeft}d
                        </p>
                        <p className="text-[10px] font-mono text-muted uppercase">
                          {urgency.label}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {reminder.type === "custom" && (
                          <>
                            <button
                              onClick={() => handleOpenModal(reminder)}
                              className="text-[10px] font-mono text-muted hover:text-neon-cyan transition-colors"
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => handleDeleteReminder(reminder)}
                              className="text-[10px] font-mono text-muted hover:text-neon-red transition-colors"
                            >
                              DEL
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </AnimatedItem>
            );
          })}
        </div>

        {reminders.length === 0 && (
          <AnimatedItem>
            <Card hover={false}>
              <p className="text-center font-mono text-muted py-8">
                No reminders within the next 270 days. Click &quot;+ ADD REMINDER&quot; to create one.
              </p>
            </Card>
          </AnimatedItem>
        )}
      </AnimatedContainer>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReminder ? "EDIT REMINDER" : "ADD REMINDER"}
      >
        <div className="space-y-4">
          <FormField
            label="Title"
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Reminder title"
            required
          />
          <FormField
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <CategorySelector
            scope="reminders"
            value={form.category}
            onChange={(cat) => setForm({ ...form, category: cat })}
            onColorChange={(color) => setForm({ ...form, color })}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-muted uppercase tracking-wider">
              Custom Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono text-muted">{form.color}</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
            >
              {editingReminder ? "UPDATE" : "CREATE"}
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
