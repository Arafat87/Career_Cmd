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

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  tech_stack: string;
  repo_url: string;
  live_url: string;
  image_url: string;
  category: string;
  featured: number;
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [form, setForm] = useState({ title: "", description: "", tech_stack: "", repo_url: "", live_url: "", image_url: "", category: "", featured: 0 });

  useEffect(() => { fetchItems(); fetchCategories(); }, []);

  async function fetchItems() {
    const data = await fetchArray("/api/portfolio"); setItems(data as PortfolioItem[]);
  }
  async function fetchCategories() {
    const data = await fetchArray("/api/categories?scope=portfolio"); setCategories(data);
  }

  function getCategoryColor(name: string): string {
    const cat = categories.find((c: any) => c.name === name); return cat?.color || "#00F5FF";
  }

  function handleOpenModal(item?: PortfolioItem) {
    if (item) {
      setEditingItem(item);
      setForm({ title: item.title, description: item.description, tech_stack: item.tech_stack, repo_url: item.repo_url, live_url: item.live_url, image_url: item.image_url, category: item.category, featured: item.featured });
    } else {
      setEditingItem(null);
      setForm({ title: "", description: "", tech_stack: "", repo_url: "", live_url: "", image_url: "", category: "", featured: 0 });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    if (editingItem) {
      await fetch("/api/portfolio", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingItem.id, ...form }) });
    } else {
      await fetch("/api/portfolio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setIsModalOpen(false); fetchItems();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this portfolio item?")) return;
    await fetch(`/api/portfolio?id=${id}`, { method: "DELETE" }); fetchItems();
  }

  const filtered = filterCategory ? items.filter((i) => i.category === filterCategory) : items;
  const uniqueCategories = [...new Set(items.map((i) => i.category).filter(Boolean))];

  return (
    <>
      <AnimatedContainer>
        <div className="flex items-center justify-between mb-6">
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">{items.length} PORTFOLIO ITEM{items.length !== 1 ? "S" : ""}</GlowText>
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">+ ADD ITEM</button>
          </ElectricBorder>
        </div>

        {uniqueCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setFilterCategory("")} className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${!filterCategory ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>ALL</button>
            {uniqueCategories.map((c) => (
              <button key={c} onClick={() => setFilterCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${filterCategory === c ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>{c}</button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <AnimatedItem key={item.id}>
              <Card>
                <div className="space-y-3">
                  {item.image_url ? (
                    <div className="w-full h-32 rounded-lg overflow-hidden bg-[rgba(0,245,255,0.05)]">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-32 rounded-lg bg-gradient-to-br from-[rgba(0,245,255,0.05)] to-[rgba(191,0,255,0.05)] flex items-center justify-center">
                      <span className="text-3xl">🖼</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-mono font-semibold text-foreground">{item.title}</h4>
                    {item.featured ? <span className="text-neon-yellow text-sm">★</span> : null}
                  </div>
                  {item.category && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono border" style={{ color: getCategoryColor(item.category), borderColor: `${getCategoryColor(item.category)}30`, backgroundColor: `${getCategoryColor(item.category)}10` }}>{item.category}</span>
                  )}
                  {item.description && <p className="text-xs font-mono text-foreground/60 line-clamp-2">{item.description}</p>}
                  {item.tech_stack && (
                    <div className="flex flex-wrap gap-1">
                      {item.tech_stack.split(",").map((t, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] text-muted">{t.trim()}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {item.repo_url && <a href={item.repo_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-neon-cyan/50 hover:text-neon-cyan">REPO</a>}
                    {item.live_url && <a href={item.live_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-neon-green/50 hover:text-neon-green">LIVE</a>}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-[rgba(0,245,255,0.08)]">
                    <button onClick={() => handleOpenModal(item)} className="px-3 py-1 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] rounded text-xs font-mono text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)] transition-colors">EDIT</button>
                    <button onClick={() => handleDelete(item.id)} className="px-3 py-1 bg-[rgba(255,45,85,0.05)] border border-[rgba(255,45,85,0.1)] rounded text-xs font-mono text-muted hover:text-neon-red hover:border-[rgba(255,45,85,0.2)] transition-colors">DEL</button>
                  </div>
                </div>
              </Card>
            </AnimatedItem>
          ))}
        </div>
        {filtered.length === 0 && <Card hover={false}><p className="text-sm font-mono text-muted text-center">No portfolio items yet</p></Card>}
      </AnimatedContainer>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "EDIT PORTFOLIO ITEM" : "ADD PORTFOLIO ITEM"}>
        <div className="space-y-4">
          <FormField label="Title" name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <CategorySelector scope="portfolio" value={form.category} onChange={(cat) => setForm({ ...form, category: cat })} />
          <FormField label="Description" name="description" type="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <FormField label="Tech Stack (comma-separated)" name="tech_stack" value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} placeholder="React, Node.js, PostgreSQL" />
          <FormField label="Image URL" name="image_url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <FormField label="Repository URL" name="repo_url" value={form.repo_url} onChange={(e) => setForm({ ...form, repo_url: e.target.value })} />
          <FormField label="Live URL" name="live_url" value={form.live_url} onChange={(e) => setForm({ ...form, live_url: e.target.value })} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked ? 1 : 0 })} className="accent-neon-cyan" />
            <span className="text-xs font-mono text-muted">Featured (show first)</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">{editingItem ? "UPDATE" : "CREATE"}</button>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground transition-colors">CANCEL</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
