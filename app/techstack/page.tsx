"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import CategoryGroup from "@/components/CategoryGroup";
import CategorySelector from "@/components/CategorySelector";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import IconLookup from "@/components/IconLookup";
import ElectricBorder from "@/components/ElectricBorder";
import { fetchArray } from "@/lib/fetch-helpers";

interface TechItem {
  id: number;
  name: string;
  category: string;
  proficiency_goal: string;
  image_url: string;
}

const proficiencyOptions = ["Beginner", "Intermediate", "Advanced", "Expert"];

export default function TechStackPage() {
  const [techStack, setTechStack] = useState<TechItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TechItem | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    proficiency_goal: "",
    image_url: "",
  });

  useEffect(() => {
    fetchTechStack();
    fetchCategories();
  }, []);

  async function fetchTechStack() {
    const data = await fetchArray("/api/techstack");
    setTechStack(data as TechItem[]);
  }

  async function fetchCategories() {
    const data = await fetchArray("/api/categories?scope=techstack");
    setCategories(data);
  }

  function handleOpenModal(item?: TechItem) {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name,
        category: item.category,
        proficiency_goal: item.proficiency_goal,
        image_url: item.image_url || "",
      });
    } else {
      setEditingItem(null);
      setForm({ name: "", category: "", proficiency_goal: "", image_url: "" });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    const method = editingItem ? "PUT" : "POST";
    const body = editingItem ? { ...form, id: editingItem.id } : form;

    await fetch("/api/techstack", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setIsModalOpen(false);
    fetchTechStack();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this tech item?")) return;
    await fetch(`/api/techstack?id=${id}`, { method: "DELETE" });
    fetchTechStack();
  }

  function getCategoryColor(name: string): string {
    const cat = categories.find((c: any) => c.name === name);
    return cat?.color || "#00F5FF";
  }

  function getProficiencyColor(level: string) {
    switch (level) {
      case "Beginner":
        return "text-neon-cyan/70 bg-[rgba(0,245,255,0.08)] border-neon-cyan/15";
      case "Intermediate":
        return "text-neon-purple/70 bg-[rgba(191,0,255,0.08)] border-neon-purple/15";
      case "Advanced":
        return "text-neon-green/70 bg-[rgba(0,255,136,0.08)] border-neon-green/15";
      case "Expert":
        return "text-neon-red/70 bg-[rgba(255,45,85,0.08)] border-neon-red/15";
      default:
        return "text-muted bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.1)]";
    }
  }

  // Group by category
  const grouped = techStack.reduce((acc, item) => {
    const cat = item.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, TechItem[]>);

  return (
    <>
      <AnimatedContainer className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-mono text-neon-cyan/70">
            {techStack.length} TECHNOLOGIES TRACKED
          </h2>
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-[rgba(0,245,255,0.1)] border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-[rgba(0,245,255,0.2)] transition-colors"
            >
              + ADD TECHNOLOGY
            </button>
          </ElectricBorder>
        </div>

        {Object.entries(grouped).map(([category, items]) => {
          const catColor = getCategoryColor(category);
          return (
            <AnimatedItem key={category}>
              <CategoryGroup category={category} count={items.length}>
                {items.map((item) => {
                  return (
                    <ElectricBorder key={item.id} color={catColor} speed={0.6} chaos={0.08} borderRadius={12}>
                      <Card>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            {item.image_url ? (
                              <div className="w-10 h-10 rounded-lg bg-white/5 border border-[rgba(0,245,255,0.1)] flex items-center justify-center shrink-0">
                                <img src={item.image_url} alt={item.name}
                                  className="w-7 h-7 object-contain"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-white/5 border border-[rgba(0,245,255,0.05)] flex items-center justify-center shrink-0">
                                <span className="text-lg opacity-30">▣</span>
                              </div>
                            )}
                            <h4 className="text-sm font-mono font-semibold text-foreground">
                              {item.name}
                            </h4>
                          </div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-mono border ${getProficiencyColor(
                              item.proficiency_goal
                            )}`}
                          >
                            {item.proficiency_goal || "NO GOAL SET"}
                          </span>
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              onClick={() => handleOpenModal(item)}
                              className="text-xs font-mono text-muted hover:text-neon-cyan transition-colors"
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-xs font-mono text-muted hover:text-neon-red transition-colors"
                            >
                              DEL
                            </button>
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

        {techStack.length === 0 && (
          <AnimatedItem>
            <Card hover={false}>
              <p className="text-center font-mono text-muted py-8">
                No technologies tracked yet. Click &quot;+ ADD TECHNOLOGY&quot; to start.
              </p>
            </Card>
          </AnimatedItem>
        )}
      </AnimatedContainer>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "EDIT TECHNOLOGY" : "ADD TECHNOLOGY"}
      >
        <div className="space-y-4">
          <FormField
            label="Name"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="React, Docker, Kubernetes..."
            required
          />
          <CategorySelector
            scope="techstack"
            value={form.category}
            onChange={(cat) => setForm({ ...form, category: cat })}
          />
          <div>
            <label className="block text-xs font-mono text-muted mb-2">IMAGE / ICON</label>
            <IconLookup
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              onNameChange={(name) => setForm({ ...form, name: form.name || name })}
              placeholder="Type tech name (e.g. Docker, Kubernetes, Python)..."
            />
          </div>
          <FormField
            label="Proficiency Goal"
            name="proficiency_goal"
            type="select"
            value={form.proficiency_goal}
            onChange={(e) => setForm({ ...form, proficiency_goal: e.target.value })}
            options={proficiencyOptions}
          />
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
            >
              {editingItem ? "UPDATE" : "CREATE"}
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
