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

interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  color: string;
  pinned: number;
  created_at: string;
  updated_at: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [form, setForm] = useState({ title: "", content: "", category: "", color: "#00F5FF", pinned: 0 });

  useEffect(() => {
    fetchNotes();
    fetchCategories();
  }, []);

  async function fetchNotes() {
    const data = await fetchArray("/api/notes");
    setNotes(data as Note[]);
  }

  async function fetchCategories() {
    const data = await fetchArray("/api/categories?scope=notes");
    setCategories(data);
  }

  function getCategoryColor(name: string): string {
    const cat = categories.find((c: any) => c.name === name);
    return cat?.color || "#00F5FF";
  }

  function handleOpenModal(note?: Note) {
    if (note) {
      setEditingNote(note);
      setForm({ title: note.title, content: note.content, category: note.category, color: note.color, pinned: note.pinned });
    } else {
      setEditingNote(null);
      setForm({ title: "", content: "", category: "", color: "#00F5FF", pinned: 0 });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    if (editingNote) {
      await fetch("/api/notes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingNote.id, ...form }) });
    } else {
      await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setIsModalOpen(false);
    fetchNotes();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    fetchNotes();
  }

  async function handleTogglePin(note: Note) {
    await fetch("/api/notes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...note, pinned: note.pinned ? 0 : 1 }) });
    fetchNotes();
  }

  const filtered = notes.filter((n) => {
    const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !filterCategory || n.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = [...new Set(notes.map((n) => n.category).filter(Boolean))];

  return (
    <>
      <AnimatedContainer>
        <div className="flex items-center justify-between mb-6">
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">
            {notes.length} NOTE{notes.length !== 1 ? "S" : ""}
          </GlowText>
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">
              + ADD NOTE
            </button>
          </ElectricBorder>
        </div>

        {/* Search and filter */}
        <div className="flex gap-3 mb-6">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes..."
            className="flex-1 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted focus:border-neon-cyan/50 transition-colors" />
          {uniqueCategories.length > 0 && (
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground">
              <option value="">All Categories</option>
              {uniqueCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>

        {/* Notes grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <AnimatedItem key={note.id}>
              <Card>
                <div className="space-y-2" style={{ borderLeft: `3px solid ${note.color}`, paddingLeft: "12px" }}>
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-mono font-semibold text-foreground flex-1">{note.title}</h4>
                    <button onClick={() => handleTogglePin(note)} className={`ml-2 text-sm ${note.pinned ? "text-neon-yellow" : "text-muted/30"}`} title={note.pinned ? "Unpin" : "Pin"}>
                      📌
                    </button>
                  </div>
                  {note.category && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono border"
                      style={{ color: getCategoryColor(note.category), borderColor: `${getCategoryColor(note.category)}30`, backgroundColor: `${getCategoryColor(note.category)}10` }}>
                      {note.category}
                    </span>
                  )}
                  <p className="text-xs font-mono text-foreground/60 whitespace-pre-wrap line-clamp-4">{note.content}</p>
                  <p className="text-[10px] font-mono text-muted">
                    {new Date(note.updated_at + "Z").toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <div className="flex gap-2 pt-2 border-t border-[rgba(0,245,255,0.08)]">
                    <button onClick={() => handleOpenModal(note)} className="px-3 py-1 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] rounded text-xs font-mono text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)] transition-colors">EDIT</button>
                    <button onClick={() => handleDelete(note.id)} className="px-3 py-1 bg-[rgba(255,45,85,0.05)] border border-[rgba(255,45,85,0.1)] rounded text-xs font-mono text-muted hover:text-neon-red hover:border-[rgba(255,45,85,0.2)] transition-colors">DEL</button>
                  </div>
                </div>
              </Card>
            </AnimatedItem>
          ))}
        </div>

        {filtered.length === 0 && (
          <Card hover={false}>
            <p className="text-sm font-mono text-muted text-center">
              {search || filterCategory ? "No notes match your search" : "No notes yet. Add one!"}
            </p>
          </Card>
        )}
      </AnimatedContainer>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingNote ? "EDIT NOTE" : "ADD NOTE"}>
        <div className="space-y-4">
          <FormField label="Title" name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <CategorySelector scope="notes" value={form.category} onChange={(cat) => setForm({ ...form, category: cat })} />
          <FormField label="Content" name="content" type="textarea" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-8 h-8 rounded cursor-pointer bg-transparent border border-[rgba(0,245,255,0.15)]" />
              <span className="text-xs font-mono text-muted">{form.color}</span>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked ? 1 : 0 })} className="accent-neon-cyan" />
            <span className="text-xs font-mono text-muted">Pin this note</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">
              {editingNote ? "UPDATE" : "CREATE"}
            </button>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground transition-colors">CANCEL</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
