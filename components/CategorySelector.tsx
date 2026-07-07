"use client";

import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  color: string;
  scope: string;
}

interface CategorySelectorProps {
  scope: string;
  value: string;
  onChange: (category: string) => void;
  onColorChange?: (color: string) => void;
}

export default function CategorySelector({ scope, value, onChange, onColorChange }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#00F5FF");

  useEffect(() => {
    fetchCategories();
  }, [scope]);

  async function fetchCategories() {
    const res = await fetch(`/api/categories?scope=${scope}`);
    const data = await res.json();
    setCategories(data as Category[]);
  }

  async function handleAddCategory() {
    if (!newName.trim()) return;
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, color: newColor, scope }),
    });
    setNewName("");
    setIsAdding(false);
    fetchCategories();
  }

  async function handleDeleteCategory(id: number) {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    fetchCategories();
  }

  function getCategoryColor(name: string): string {
    const cat = categories.find((c) => c.name === name);
    return cat?.color || "#00F5FF";
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-mono text-muted uppercase tracking-wider">
        Category
      </label>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                onChange(cat.name);
                onColorChange?.(cat.color);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-mono border transition-all ${
                value === cat.name
                  ? "border-current"
                  : "border-[rgba(0,245,255,0.1)] text-muted hover:text-foreground"
              }`}
              style={
                value === cat.name
                  ? {
                      color: cat.color,
                      borderColor: cat.color,
                      backgroundColor: `${cat.color}15`,
                      boxShadow: `0 0 8px ${cat.color}40`,
                    }
                  : undefined
              }
            >
              {cat.name}
            </button>
            <button
              type="button"
              onClick={() => handleDeleteCategory(cat.id)}
              className="text-[10px] text-muted hover:text-neon-red transition-colors"
            >
              ×
            </button>
          </div>
        ))}
        {!isAdding ? (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="px-3 py-1.5 rounded-md text-xs font-mono border border-dashed border-[rgba(0,245,255,0.2)] text-muted hover:text-neon-cyan transition-colors"
          >
            + NEW
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name"
              className="w-24 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1 text-xs font-mono text-foreground"
            />
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="text-xs font-mono text-neon-green hover:opacity-80"
            >
              ✓
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs font-mono text-muted hover:text-neon-red"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
