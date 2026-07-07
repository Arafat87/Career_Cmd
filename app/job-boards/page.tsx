"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import GlowText from "@/components/GlowText";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import ModelSelector from "@/components/ModelSelector";
import ElectricBorder from "@/components/ElectricBorder";

interface JobBoard {
  id: number;
  name: string;
  url: string;
  category: string;
  icon: string;
  color: string;
  last_scanned: string;
  job_count: number;
  created_at: string;
}

const DEFAULT_BOARDS: Omit<JobBoard, "id" | "last_scanned" | "job_count" | "created_at">[] = [
  { name: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs/", category: "GENERAL", icon: "💼", color: "#0A66C2" },
  { name: "Indeed", url: "https://www.indeed.com/", category: "GENERAL", icon: "🔍", color: "#2164F3" },
  { name: "Glassdoor", url: "https://www.glassdoor.com/Job/", category: "GENERAL", icon: "🏢", color: "#0CAA41" },
  { name: "Dice", url: "https://www.dice.com/", category: "TECH", icon: "🎲", color: "#0066CC" },
  { name: "Stack Overflow Jobs", url: "https://stackoverflow.com/jobs", category: "TECH", icon: "📚", color: "#F48024" },
  { name: "AngelList", url: "https://angel.co/jobs", category: "STARTUP", icon: "👼", color: "#000000" },
  { name: "Wellfound", url: "https://wellfound.com/jobs", category: "STARTUP", icon: "🚀", color: "#000000" },
  { name: "Levels.fyi", url: "https://www.levels.fyi/jobs", category: "SALARY", icon: "📊", color: "#1B72C0" },
  { name: "Hired", url: "https://hired.com/", category: "TECH", icon: "🤝", color: "#2B2B2B" },
  { name: "Built In", url: "https://builtin.com/jobs", category: "TECH", icon: "🏗", color: "#1DC3E1" },
  { name: "RemoteOK", url: "https://remoteok.com/", category: "REMOTE", icon: "🌍", color: "#0D1117" },
  { name: "We Work Remotely", url: "https://weworkremotely.com/", category: "REMOTE", icon: "🏠", color: "#F4B23B" },
  { name: "FlexJobs", url: "https://www.flexjobs.com/", category: "REMOTE", icon: "🕐", color: "#25AAE1" },
  { name: "USAJOBS", url: "https://www.usajobs.gov/", category: "GOVERNMENT", icon: "🏛", color: "#003366" },
  { name: "ClearanceJobs", url: "https://www.clearancejobs.com/", category: "GOVERNMENT", icon: "🔒", color: "#1B3654" },
  { name: "CyberSecJobs", url: "https://www.cybersecjobs.com/", category: "SECURITY", icon: "🛡", color: "#FF4444" },
  { name: "DevOps Jobs", url: "https://devopsjobs.net/", category: "DEVOPS", icon: "⚙", color: "#00C7B7" },
  { name: "Himalayas", url: "https://himalayas.app/jobs", category: "REMOTE", icon: "🏔", color: "#5C6BC0" },
];

export default function JobBoardsPage() {
  const [boards, setBoards] = useState<JobBoard[]>([]);
  const [activeBoard, setActiveBoard] = useState<JobBoard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<JobBoard | null>(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [scanning, setScanning] = useState<number | null>(null);
  const [scanResults, setScanResults] = useState<{ boardId: number; jobs: any[] } | null>(null);
  const [form, setForm] = useState({ name: "", url: "", category: "GENERAL", icon: "🔗", color: "#00F5FF" });
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);

  useEffect(() => {
    fetchBoards();
  }, []);

  async function fetchBoards() {
    const res = await fetch("/api/job-boards");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      setBoards(data);
      if (!activeBoard) setActiveBoard(data[0]);
    } else {
      // Seed default boards
      for (const board of DEFAULT_BOARDS) {
        await fetch("/api/job-boards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(board),
        });
      }
      fetchBoards();
    }
  }

  function handleOpenModal(board?: JobBoard) {
    if (board) {
      setEditing(board);
      setForm({ name: board.name, url: board.url, category: board.category, icon: board.icon, color: board.color });
    } else {
      setEditing(null);
      setForm({ name: "", url: "", category: "GENERAL", icon: "🔗", color: "#00F5FF" });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.url.trim()) return;
    if (editing) {
      await fetch("/api/job-boards", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, ...form }) });
    } else {
      await fetch("/api/job-boards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setIsModalOpen(false);
    fetchBoards();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this job board?")) return;
    await fetch(`/api/job-boards?id=${id}`, { method: "DELETE" });
    if (activeBoard?.id === id) setActiveBoard(null);
    fetchBoards();
  }

  async function handleScan(board: JobBoard) {
    setScanning(board.id);
    // Simulate scanning — in a real app this would scrape the board
    setTimeout(() => {
      const mockJobs = [
        { title: "Senior Cloud Engineer", company: "TechCorp", location: "Remote", salary: "$150k-$200k", score: 85 },
        { title: "DevOps Lead", company: "StartupXYZ", location: "San Francisco", salary: "$180k-$220k", score: 72 },
        { title: "Infrastructure Engineer", company: "BigTech Inc", location: "Remote", salary: "$160k-$210k", score: 91 },
      ];
      setScanResults({ boardId: board.id, jobs: mockJobs });
      setScanning(null);
    }, 2000);
  }

  async function handleScore(job: any) {
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "job-score",
          modelId: selectedModelId,
          extra: {
            jobTitle: job.title,
            company: job.company,
            jobDescription: `${job.title} at ${job.company}, ${job.location}, ${job.salary}`,
          },
        }),
      });
      const data = await res.json();
      if (data.result) {
        try {
          const parsed = JSON.parse(data.result);
          alert(`Match Score: ${parsed.score}/100\n\nMatches: ${parsed.matches?.join(", ")}\n\nGaps: ${parsed.gaps?.join(", ")}`);
        } catch {
          alert(data.result);
        }
      }
    } catch (e) {
      console.error("Scoring failed:", e);
    }
  }

  const categories = [...new Set(boards.map(b => b.category))];
  const filtered = filterCategory ? boards.filter(b => b.category === filterCategory) : boards;

  return (
    <AnimatedContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">JOB BOARDS ({boards.length})</GlowText>
        <div className="flex items-center gap-3">
          <ModelSelector selectedModelId={selectedModelId} onSelect={setSelectedModelId} />
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button onClick={() => handleOpenModal()}
              className="px-3 py-1.5 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-xs text-neon-cyan hover:bg-neon-cyan/30">+ ADD BOARD</button>
          </ElectricBorder>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterCategory("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono ${!filterCategory ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>ALL</button>
        {categories.map(c => (
          <button key={c} onClick={() => setFilterCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono ${filterCategory === c ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>{c}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Board list */}
        <div className="space-y-2">
          {filtered.map(board => (
            <AnimatedItem key={board.id}>
              <button onClick={() => setActiveBoard(board)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${activeBoard?.id === board.id ? "bg-neon-cyan/10 border border-neon-cyan/30" : "border border-transparent hover:bg-[rgba(0,245,255,0.03)]"}`}>
                <span className="text-lg">{board.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-mono truncate ${activeBoard?.id === board.id ? "text-neon-cyan" : "text-foreground"}`}>{board.name}</p>
                  <p className="text-[9px] font-mono text-muted">{board.category}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); handleOpenModal(board); }}
                    className="text-muted hover:text-neon-cyan text-[10px]">✎</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(board.id); }}
                    className="text-muted hover:text-neon-red text-[10px]">✕</button>
                </div>
              </button>
            </AnimatedItem>
          ))}
        </div>

        {/* Active board view */}
        <div className="lg:col-span-2">
          {activeBoard ? (
            <Card hover={false}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activeBoard.icon}</span>
                  <div>
                    <h3 className="text-sm font-mono font-bold text-foreground">{activeBoard.name}</h3>
                    <p className="text-[10px] font-mono text-muted">{activeBoard.category}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleScan(activeBoard)} disabled={scanning === activeBoard.id}
                    className="px-3 py-1.5 bg-neon-purple/20 border border-neon-purple/30 rounded-lg font-mono text-xs text-neon-purple hover:bg-neon-purple/30 disabled:opacity-50">
                    {scanning === activeBoard.id ? "SCANNING..." : "📡 SCAN"}
                  </button>
                  <a href={activeBoard.url} target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-xs text-neon-cyan hover:bg-neon-cyan/30">
                    OPEN BOARD →
                  </a>
                </div>
              </div>

              {/* Embedded board preview */}
              <div className="w-full h-96 rounded-lg overflow-hidden border border-[rgba(0,245,255,0.1)] mb-4">
                <iframe src={activeBoard.url} className="w-full h-full" title={activeBoard.name}
                  sandbox="allow-scripts allow-same-origin" />
              </div>

              {/* Scan results */}
              {scanResults && scanResults.boardId === activeBoard.id && (
                <div>
                  <h4 className="text-xs font-mono text-muted uppercase tracking-wider mb-3">SCAN RESULTS ({scanResults.jobs.length} jobs found)</h4>
                  <div className="space-y-2">
                    {scanResults.jobs.map((job, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[rgba(0,245,255,0.08)] hover:bg-[rgba(0,245,255,0.03)]">
                        <div>
                          <p className="text-xs font-mono text-foreground">{job.title}</p>
                          <p className="text-[10px] font-mono text-muted">{job.company} • {job.location} • {job.salary}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-bold" style={{ color: job.score > 80 ? "#00FF88" : job.score > 60 ? "#FFD700" : "#FF2D55" }}>{job.score}%</span>
                          <button onClick={() => handleScore(job)}
                            className="px-2 py-1 text-[9px] font-mono text-neon-cyan border border-neon-cyan/20 rounded hover:bg-neon-cyan/10">
                            ✦ AI SCORE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card hover={false} className="flex items-center justify-center h-96">
              <p className="text-sm font-mono text-muted">Select a job board to view</p>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? "EDIT JOB BOARD" : "ADD JOB BOARD"}>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-16">
              <label className="block text-[9px] font-mono text-muted mb-1">Icon</label>
              <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} maxLength={2}
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-2 py-2 text-center text-lg" />
            </div>
            <div className="flex-1">
              <label className="block text-[9px] font-mono text-muted mb-1">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="LinkedIn Jobs"
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground" />
            </div>
            <div className="w-24">
              <label className="block text-[9px] font-mono text-muted mb-1">Color</label>
              <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                className="w-full h-[38px] bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg cursor-pointer" />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-mono text-muted mb-1">URL</label>
            <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..."
              className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground" />
          </div>
          <div>
            <label className="block text-[9px] font-mono text-muted mb-1">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground">
              {["GENERAL", "TECH", "STARTUP", "REMOTE", "GOVERNMENT", "SECURITY", "DEVOPS", "SALARY", "OTHER"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={handleSave} disabled={!form.name.trim() || !form.url.trim()}
            className="w-full px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan disabled:opacity-50">
            {editing ? "UPDATE" : "ADD"} BOARD
          </button>
        </div>
      </Modal>
    </AnimatedContainer>
  );
}
