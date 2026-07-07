"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import CategoryGroup from "@/components/CategoryGroup";
import CategorySelector from "@/components/CategorySelector";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import ElectricBorder from "@/components/ElectricBorder";
import { fetchArray } from "@/lib/fetch-helpers";

interface Project {
  id: number;
  name: string;
  status: "TODO" | "IN PROGRESS" | "DONE";
  technologies: string;
  category: string;
  deadline: string;
  description: string;
  goal: string;
}

const statusOptions = ["TODO", "IN PROGRESS", "DONE"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState({
    name: "",
    status: "TODO",
    technologies: "",
    category: "",
    deadline: "",
    description: "",
    goal: "",
  });

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  async function fetchProjects() {
    const data = await fetchArray("/api/projects");
    setProjects(data as Project[]);
  }

  async function fetchCategories() {
    const data = await fetchArray("/api/categories?scope=projects");
    setCategories(data);
  }

  function handleOpenModal(project?: Project) {
    if (project) {
      setEditingProject(project);
      setForm({
        name: project.name,
        status: project.status,
        technologies: project.technologies,
        category: project.category,
        deadline: project.deadline,
        description: project.description || "",
        goal: project.goal || "",
      });
    } else {
      setEditingProject(null);
      setForm({ name: "", status: "TODO", technologies: "", category: "", deadline: "", description: "", goal: "" });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    const method = editingProject ? "PUT" : "POST";
    const body = editingProject ? { ...form, id: editingProject.id } : form;

    await fetch("/api/projects", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setIsModalOpen(false);
    fetchProjects();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    fetchProjects();
  }

  function getCategoryColor(name: string): string {
    const cat = categories.find((c: any) => c.name === name);
    return cat?.color || "#00F5FF";
  }

  function getDeadlineDisplay(deadline: string) {
    if (!deadline) return { text: "NO DEADLINE", color: "text-muted" };
    const now = new Date();
    const dl = new Date(deadline);
    const daysLeft = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { text: "OVERDUE", color: "text-neon-red/70" };
    if (daysLeft <= 7) return { text: `${daysLeft}d LEFT`, color: "text-neon-red/70" };
    if (daysLeft <= 30) return { text: `${daysLeft}d LEFT`, color: "text-neon-cyan/70" };
    return { text: `${daysLeft}d LEFT`, color: "text-neon-green/70" };
  }

  // Group by category
  const grouped = projects.reduce((acc, proj) => {
    const cat = proj.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(proj);
    return acc;
  }, {} as Record<string, Project[]>);

  return (
    <>
      <AnimatedContainer className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-mono text-neon-cyan/70">
            {projects.length} PROJECTS TRACKED
          </h2>
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-[rgba(0,245,255,0.1)] border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-[rgba(0,245,255,0.2)] transition-colors"
            >
              + ADD PROJECT
            </button>
          </ElectricBorder>
        </div>

        {Object.entries(grouped).map(([category, projs]) => {
          const catColor = getCategoryColor(category);
          return (
            <AnimatedItem key={category}>
              <CategoryGroup category={category} count={projs.length}>
                {projs.map((project) => {
                  const deadline = getDeadlineDisplay(project.deadline);
                  const techs = project.technologies
                    ? project.technologies.split(",").map((t) => t.trim()).filter(Boolean)
                    : [];

                  return (
                    <ElectricBorder key={project.id} color={catColor} speed={0.6} chaos={0.08} borderRadius={12}>
                      <Card>
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-mono font-semibold text-foreground">
                              {project.name}
                            </h4>
                            <StatusBadge status={project.status} />
                          </div>

                          {project.description && (
                            <p className="text-xs text-muted line-clamp-2">
                              {project.description}
                            </p>
                          )}

                          {project.goal && (
                            <div className="p-2 rounded bg-[rgba(0,245,255,0.03)] border border-[rgba(0,245,255,0.08)]">
                              <p className="text-[10px] font-mono text-muted uppercase mb-1">GOAL</p>
                              <p className="text-xs text-foreground">{project.goal}</p>
                            </div>
                          )}

                          {techs.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {techs.map((tech) => (
                                <span
                                  key={tech}
                                  className="px-2 py-0.5 rounded text-[10px] font-mono border"
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

                          <div className="flex items-center justify-between pt-1">
                            <span className={`text-xs font-mono ${deadline.color}`}>
                              {deadline.text}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenModal(project)}
                                className="text-xs font-mono text-muted hover:text-neon-cyan transition-colors"
                              >
                                EDIT
                              </button>
                              <button
                                onClick={() => handleDelete(project.id)}
                                className="text-xs font-mono text-muted hover:text-neon-red transition-colors"
                              >
                                DEL
                              </button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </ElectricBorder>
                  );
                })}
              </CategoryGroup>
            </AnimatedItem>
          );
        })}

        {projects.length === 0 && (
          <AnimatedItem>
            <Card hover={false}>
              <p className="text-center font-mono text-muted py-8">
                No projects tracked yet. Click &quot;+ ADD PROJECT&quot; to start.
              </p>
            </Card>
          </AnimatedItem>
        )}
      </AnimatedContainer>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? "EDIT PROJECT" : "ADD PROJECT"}
      >
        <div className="space-y-4">
          <FormField
            label="Name"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Project name"
            required
          />
          <FormField
            label="Status"
            name="status"
            type="select"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={statusOptions}
          />
          <CategorySelector
            scope="projects"
            value={form.category}
            onChange={(cat) => setForm({ ...form, category: cat })}
          />
          <FormField
            label="Technologies"
            name="technologies"
            value={form.technologies}
            onChange={(e) => setForm({ ...form, technologies: e.target.value })}
            placeholder="React, TypeScript, Node.js (comma-separated)"
          />
          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief description of the project..."
          />
          <FormField
            label="Goal"
            name="goal"
            type="textarea"
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
            placeholder="What do you want to achieve with this project?"
          />
          <FormField
            label="Deadline"
            name="deadline"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
            >
              {editingProject ? "UPDATE" : "CREATE"}
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
