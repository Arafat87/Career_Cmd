"use client";

import { useState } from "react";
import Card from "@/components/Card";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import ElectricBorder from "@/components/ElectricBorder";

interface Repo {
  name: string; description: string; language: string; stars: number; url: string; homepage: string; updated_at: string;
}

interface ActivityEvent {
  type: string; repo: string; created_at: string; action?: string; title?: string; url?: string;
}

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#FFD700", TypeScript: "#0088FF", Python: "#00FF88", Go: "#00F5FF", Rust: "#FF8C00",
  Java: "#FF2D55", "C++": "#BF00FF", C: "#4A6274", Shell: "#00FF88", HTML: "#FF8C00", CSS: "#0088FF",
};

const EVENT_COLORS: Record<string, string> = {
  PushEvent: "#00FF88",
  PullRequestEvent: "#0088FF",
  IssuesEvent: "#FFD700",
  CreateEvent: "#BF00FF",
  DeleteEvent: "#FF2D55",
  ForkEvent: "#FF8C00",
  ReleaseEvent: "#00F5FF",
  WatchEvent: "#FFD700",
};

export default function GitHubPage() {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [error, setError] = useState("");
  const [imported, setImported] = useState<Set<string>>(new Set());

  async function handleFetch() {
    if (!username.trim()) return;
    setLoading(true); setError(""); setRepos([]); setActivity([]);
    try {
      const res = await fetch(`/api/integrations/github?username=${encodeURIComponent(username.trim())}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRepos(Array.isArray(data) ? data : []);

      // Fetch activity
      setActivityLoading(true);
      try {
        const actRes = await fetch(`/api/integrations/github/activity?username=${encodeURIComponent(username.trim())}`);
        if (actRes.ok) {
          const events = await actRes.json();
          if (Array.isArray(events)) {
            setActivity(events.map((e: any) => ({
              type: e.event_type || "unknown",
              repo: e.repo_name || "",
              created_at: e.github_created_at || "",
              title: e.title || "",
              url: e.url || "",
            })));
          }
        }
      } catch {} finally { setActivityLoading(false); }
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  async function handleImport(repo: Repo) {
    await fetch("/api/portfolio", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: repo.name,
        description: repo.description,
        tech_stack: repo.language,
        repo_url: repo.url,
        live_url: repo.homepage,
        image_url: "",
        category: "GitHub",
        featured: repo.stars > 10 ? 1 : 0,
      }),
    });
    setImported((prev) => new Set([...prev, repo.name]));
  }

  return (
    <AnimatedContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">GITHUB SYNC</GlowText>
      </div>

      <Card hover={false}>
        <div className="flex gap-3">
          <input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            placeholder="GitHub username..." className="flex-1 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
          <ElectricBorder color="#6e40c9">
            <button onClick={handleFetch} disabled={loading || !username.trim()} className="px-6 py-2 font-mono text-sm text-[#6e40c9] hover:bg-[#6e40c9]/10 transition-colors disabled:opacity-50">
              {loading ? "FETCHING..." : "FETCH REPOS"}
            </button>
          </ElectricBorder>
        </div>
        {error && <p className="text-sm font-mono text-neon-red mt-2">{error}</p>}
      </Card>

      {/* Recent Activity */}
      {activity.length > 0 && (
        <AnimatedItem>
          <Card hover={false}>
            <h3 className="text-xs font-mono text-[#6e40c9] uppercase tracking-widest mb-3">RECENT ACTIVITY</h3>
            <div className="space-y-2 max-h-64 overflow-auto">
              {activity.slice(0, 25).map((evt, i) => {
                const color = EVENT_COLORS[evt.type] || "#4A6274";
                const typeLabel = evt.type.replace("Event", "");
                const date = evt.created_at ? new Date(evt.created_at).toLocaleDateString() : "";
                return (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-foreground/70 w-20 truncate">{typeLabel}</span>
                    {evt.action && <span className="text-muted/50 truncate w-16">{evt.action}</span>}
                    <span className="text-muted/40 truncate flex-1">{evt.title || evt.repo}</span>
                    <span className="text-muted/30 shrink-0">{date}</span>
                    {evt.url && <a href={evt.url} target="_blank" rel="noopener noreferrer" className="text-neon-cyan/40 hover:text-neon-cyan shrink-0">↗</a>}
                  </div>
                );
              })}
            </div>
            {activityLoading && <p className="text-[10px] font-mono text-muted/40 mt-2">Loading activity...</p>}
          </Card>
        </AnimatedItem>
      )}

      {/* Repos */}
      {repos.length > 0 && (
        <div>
          <h3 className="text-xs font-mono text-muted/50 uppercase tracking-widest mb-3">REPOSITORIES ({repos.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repos.map((repo) => (
              <AnimatedItem key={repo.name}>
                <Card hover={false}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-mono font-semibold text-foreground">{repo.name}</h4>
                        {repo.language && (
                          <span className="text-[10px] font-mono" style={{ color: LANG_COLORS[repo.language] || "#4A6274" }}>{repo.language}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-neon-yellow text-xs">&#9733;</span>
                        <span className="text-[10px] font-mono text-muted">{repo.stars}</span>
                      </div>
                    </div>
                    {repo.description && <p className="text-xs font-mono text-foreground/60 line-clamp-2">{repo.description}</p>}
                    <div className="flex gap-2">
                      <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-neon-cyan/50 hover:text-neon-cyan">REPO</a>
                      {repo.homepage && <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-neon-green/50 hover:text-neon-green">LIVE</a>}
                    </div>
                    <button onClick={() => handleImport(repo)} disabled={imported.has(repo.name)}
                      className={`w-full px-3 py-1.5 rounded text-xs font-mono transition-colors ${imported.has(repo.name) ? "bg-neon-green/10 border border-neon-green/20 text-neon-green" : "bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)]"}`}>
                      {imported.has(repo.name) ? "IMPORTED" : "IMPORT TO PORTFOLIO"}
                    </button>
                  </div>
                </Card>
              </AnimatedItem>
            ))}
          </div>
        </div>
      )}
    </AnimatedContainer>
  );
}
