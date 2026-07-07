"use client";

import { useEffect, useState } from "react";

const THEMES = [
  { id: "default", label: "Cyan", color: "#00F5FF" },
  { id: "purple", label: "Purple", color: "#BF00FF" },
  { id: "green", label: "Green", color: "#00FF88" },
  { id: "red", label: "Red", color: "#FF2D55" },
  { id: "amber", label: "Amber", color: "#FFD700" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("default");

  useEffect(() => {
    const saved = localStorage.getItem("hireops-theme") || "default";
    setTheme(saved);
    if (saved !== "default") {
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  function applyTheme(id: string) {
    setTheme(id);
    localStorage.setItem("hireops-theme", id);
    if (id === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", id);
    }
  }

  return (
    <div>
      <label className="block text-xs font-mono text-muted mb-3">THEME</label>
      <div className="flex gap-3">
        {THEMES.map((t) => (
          <button key={t.id} onClick={() => applyTheme(t.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs transition-all ${theme === t.id ? "border-2" : "border border-[rgba(0,245,255,0.1)]"}`}
            style={theme === t.id ? { borderColor: t.color, backgroundColor: `${t.color}10` } : {}}>
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: t.color }} />
            <span style={{ color: theme === t.id ? t.color : "#4A6274" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
