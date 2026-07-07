"use client";

import { useEffect, useState, useRef } from "react";
import Card from "@/components/Card";
import CategorySelector from "@/components/CategorySelector";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import SkillTag from "@/components/SkillTag";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import ElectricBorder from "@/components/ElectricBorder";
import { fetchArray } from "@/lib/fetch-helpers";
import EmojiPicker from "emoji-picker-react";

interface JobTitle {
  id: number;
  title: string;
  company: string;
  category: string;
  location: string;
  salary_min: number;
  salary_max: number;
  description: string;
  tech_stack: string;
  icon: string;
}

export default function JobTitlesPage() {
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobTitle | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiTab, setEmojiTab] = useState<"picker" | "url">("picker");
  const emojiRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    title: "",
    company: "",
    category: "",
    location: "",
    salary_min: 0,
    salary_max: 0,
    description: "",
    tech_stack: "",
    icon: "",
  });

  useEffect(() => {
    fetchJobTitles();
    fetchCategories();
  }, []);

  // Close emoji picker on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchJobTitles() {
    const data = await fetchArray("/api/jobtitles");
    setJobTitles(data as JobTitle[]);
  }

  async function fetchCategories() {
    const data = await fetchArray("/api/categories?scope=jobtitles");
    setCategories(data);
  }

  function handleOpenModal(job?: JobTitle) {
    if (job) {
      setEditingJob(job);
      setForm({
        title: job.title,
        company: job.company,
        category: job.category,
        location: job.location,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        description: job.description,
        tech_stack: job.tech_stack || "",
        icon: job.icon || "",
      });
    } else {
      setEditingJob(null);
      setForm({
        title: "",
        company: "",
        category: "",
        location: "",
        salary_min: 0,
        salary_max: 0,
        description: "",
        tech_stack: "",
        icon: "",
      });
    }
    setShowEmojiPicker(false);
    setEmojiTab("picker");
    setIsModalOpen(true);
  }

  async function handleSave() {
    const method = editingJob ? "PUT" : "POST";
    const body = editingJob ? { ...form, id: editingJob.id } : form;

    await fetch("/api/jobtitles", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setIsModalOpen(false);
    fetchJobTitles();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this job target?")) return;
    await fetch(`/api/jobtitles?id=${id}`, { method: "DELETE" });
    fetchJobTitles();
  }

  function getCategoryColor(name: string): string {
    const cat = categories.find((c: any) => c.name === name);
    return cat?.color || "#00F5FF";
  }

  const uniqueCategories = [...new Set(jobTitles.map((j) => j.category).filter(Boolean))];
  const filtered = filterCategory
    ? jobTitles.filter((j) => j.category === filterCategory)
    : jobTitles;

  return (
    <>
      <AnimatedContainer className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-mono text-neon-cyan/70">
            {jobTitles.length} JOB TARGETS
          </h2>
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-[rgba(0,245,255,0.1)] border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-[rgba(0,245,255,0.2)] transition-colors"
            >
              + ADD JOB TARGET
            </button>
          </ElectricBorder>
        </div>

        {/* Category Filter */}
        {uniqueCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory("")}
              className={`px-3 py-1 rounded-md text-xs font-mono border transition-colors ${
                !filterCategory
                  ? "bg-neon-cyan/20 border-neon-cyan/30 text-neon-cyan"
                  : "border-[rgba(0,245,255,0.1)] text-muted hover:text-foreground"
              }`}
            >
              ALL
            </button>
            {uniqueCategories.map((cat) => {
              const color = getCategoryColor(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-md text-xs font-mono border transition-all ${
                    filterCategory === cat
                      ? ""
                      : "border-[rgba(0,245,255,0.1)] text-muted hover:text-foreground"
                  }`}
                  style={
                    filterCategory === cat
                      ? {
                          color,
                          borderColor: color,
                          backgroundColor: `${color}15`,
                          boxShadow: `0 0 8px ${color}40`,
                        }
                      : undefined
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((job) => {
            const catColor = getCategoryColor(job.category);
            const techs = job.tech_stack
              ? job.tech_stack.split(",").map((t) => t.trim()).filter(Boolean)
              : [];

            return (
              <AnimatedItem key={job.id}>
                <Card>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {job.icon && (
                          job.icon.startsWith("http") ? (
                            <img src={job.icon} alt="" className="w-6 h-6 rounded object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          ) : (
                            <span className="text-2xl">{job.icon}</span>
                          )
                        )}
                        <div>
                          <h4 className="text-sm font-mono font-semibold text-foreground/90">
                            {job.title}
                          </h4>
                          <p className="text-xs font-mono text-muted mt-0.5">
                            {job.company}
                          </p>
                        </div>
                      </div>
                      {job.category && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-mono border"
                          style={{
                            color: catColor,
                            borderColor: `${catColor}40`,
                            backgroundColor: `${catColor}15`,
                          }}
                        >
                          {job.category}
                        </span>
                      )}
                    </div>

                    {job.location && (
                      <p className="text-xs font-mono text-muted">
                        {job.location}
                      </p>
                    )}

                    {(job.salary_min > 0 || job.salary_max > 0) && (
                      <p className="text-sm font-mono text-neon-green/70">
                        ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                      </p>
                    )}

                    {job.description && (
                      <div className="text-xs text-muted whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto pr-1">
                        {job.description}
                      </div>
                    )}

                    {techs.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {techs.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded text-[10px] font-mono border cursor-default"
                            style={{
                              color: catColor,
                              borderColor: `${catColor}30`,
                              backgroundColor: `${catColor}10`,
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleOpenModal(job)}
                        className="text-xs font-mono text-muted hover:text-neon-cyan transition-colors"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="text-xs font-mono text-muted hover:text-neon-red transition-colors"
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
          <AnimatedItem>
            <Card hover={false}>
              <p className="text-center font-mono text-muted py-8">
                {jobTitles.length === 0
                  ? "No job targets yet. Click \"+ ADD JOB TARGET\" to start."
                  : "No jobs match this category filter."}
              </p>
            </Card>
          </AnimatedItem>
        )}
      </AnimatedContainer>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingJob ? "EDIT JOB TARGET" : "ADD JOB TARGET"}
      >
        <div className="space-y-4">
          {/* Icon/Emoji Selector */}
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Icon / Emoji</label>
            <div className="flex items-center gap-3">
              <div className="relative" ref={emojiRef}>
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-12 h-12 rounded-lg border border-[rgba(0,245,255,0.15)] bg-[#0a0a12] flex items-center justify-center text-2xl hover:border-neon-cyan/30 transition-colors overflow-hidden">
                  {form.icon ? (
                    form.icon.startsWith("http") ? <img src={form.icon} alt="" className="w-8 h-8 object-contain" /> : <span>{form.icon}</span>
                  ) : <span className="text-muted text-sm">+</span>}
                </button>
                {form.icon && (
                  <button type="button" onClick={() => setForm({ ...form, icon: "" })}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-neon-red/80 text-white text-[10px] flex items-center justify-center hover:bg-neon-red">×</button>
                )}

                {showEmojiPicker && (
                  <div className="absolute top-14 left-0 z-[100] bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg shadow-2xl overflow-hidden">
                    <div className="flex border-b border-[rgba(0,245,255,0.1)]">
                      <button type="button" onClick={() => setEmojiTab("picker")}
                        className={`flex-1 px-3 py-1.5 text-[10px] font-mono ${emojiTab === "picker" ? "text-neon-cyan bg-neon-cyan/10" : "text-muted hover:text-foreground"}`}>EMOJI</button>
                      <button type="button" onClick={() => setEmojiTab("url")}
                        className={`flex-1 px-3 py-1.5 text-[10px] font-mono ${emojiTab === "url" ? "text-neon-purple bg-neon-purple/10" : "text-muted hover:text-foreground"}`}>CUSTOM URL</button>
                    </div>
                    {emojiTab === "picker" ? (
                      <div className="[&>div]:!bg-transparent [&>div]:!border-none [&_.epr_-search]:!bg-[#0a0a12] [&_.epr_-search]:!border-[rgba(0,245,255,0.15)] [&_.epr_-search]:!text-foreground [&_.epr_-category-name]:!text-muted [&_.epr_-category-name]:!font-mono">
                        <EmojiPicker onEmojiClick={(emoji) => { setForm({ ...form, icon: emoji.emoji }); setShowEmojiPicker(false); }}
                          width={320} height={350} theme={"dark" as any} />
                      </div>
                    ) : (
                      <div className="p-3 space-y-2">
                        <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                          placeholder="https://example.com/icon.png"
                          className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted" />
                        <p className="text-[9px] font-mono text-muted">Paste a URL to a custom emoji or icon image</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="Emoji or image URL..."
                  className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
              </div>
            </div>
          </div>

          <FormField
            label="Title"
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Senior Cloud Engineer"
            required
          />
          <FormField
            label="Company"
            name="company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            placeholder="Amazon, Google, Microsoft..."
          />
          <CategorySelector
            scope="jobtitles"
            value={form.category}
            onChange={(cat) => setForm({ ...form, category: cat })}
          />
          <FormField
            label="Location"
            name="location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Remote, New York, London..."
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Salary Min"
              name="salary_min"
              type="number"
              value={form.salary_min}
              onChange={(e) => setForm({ ...form, salary_min: Number(e.target.value) })}
              min={0}
              step={1000}
            />
            <FormField
              label="Salary Max"
              name="salary_max"
              type="number"
              value={form.salary_max}
              onChange={(e) => setForm({ ...form, salary_max: Number(e.target.value) })}
              min={0}
              step={1000}
            />
          </div>
          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Job description, requirements, responsibilities..."
          />
          <FormField
            label="Tech Stack"
            name="tech_stack"
            value={form.tech_stack}
            onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
            placeholder="AWS, Kubernetes, Python, Terraform (comma-separated)"
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
