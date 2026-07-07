"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import ElectricBorder from "@/components/ElectricBorder";
import GlowText from "@/components/GlowText";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import { fetchArray } from "@/lib/fetch-helpers";

interface RssFeed {
  id: number;
  name: string;
  url: string;
  last_scanned: string;
  created_at: string;
}

interface JobListing {
  title: string;
  company: string;
  location: string;
  matchScore: number;
  summary: string;
  url: string;
  _verified?: boolean;
}

interface JobTitle {
  id: number;
  title: string;
  company: string;
  location: string;
  category: string;
}

interface JobSearch {
  id: number;
  name: string;
  search_mode: string;
  search_terms: string;
  results_json: string;
  last_run: string;
  created_at: string;
}

export default function JobRssPage() {
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [searches, setSearches] = useState<JobSearch[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [feedName, setFeedName] = useState("");
  const [feedUrl, setFeedUrl] = useState("");
  const [searchMode, setSearchMode] = useState<"target" | "custom" | "feeds">("target");
  const [customSearchTerm, setCustomSearchTerm] = useState("");
  const [selectedTargets, setSelectedTargets] = useState<number[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<JobListing[]>([]);
  const [scanQuery, setScanQuery] = useState("");
  const [error, setError] = useState("");
  const [isAddFeedOpen, setIsAddFeedOpen] = useState(false);

  useEffect(() => {
    fetchFeeds();
    fetchSearches();
    fetchJobTitles();
  }, []);

  async function fetchFeeds() {
    const data = await fetchArray("/api/job-rss");
    setFeeds(data);
  }

  async function fetchSearches() {
    const data = await fetchArray("/api/job-rss/searches");
    setSearches(data);
  }

  async function fetchJobTitles() {
    const data = await fetchArray("/api/jobtitles");
    setJobTitles(data);
  }

  async function handleAddFeed() {
    if (!feedName.trim() || !feedUrl.trim()) return;
    await fetch("/api/job-rss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: feedName, url: feedUrl }),
    });
    setFeedName("");
    setFeedUrl("");
    setIsAddFeedOpen(false);
    fetchFeeds();
  }

  async function handleDeleteFeed(id: number) {
    await fetch(`/api/job-rss?id=${id}`, { method: "DELETE" });
    fetchFeeds();
  }

  async function handleSearch() {
    setScanning(true);
    setError("");
    setScanResults([]);
    try {
      const body: any = { mode: searchMode, feedUrls: feeds.map((f) => f.url) };
      if (searchMode === "target") {
        body.targetRoleIds = selectedTargets.length > 0 ? selectedTargets : undefined;
      } else if (searchMode === "feeds") {
        body.searchTerms = customSearchTerm ? customSearchTerm.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
      } else {
        body.searchTerms = customSearchTerm.split(",").map((s) => s.trim()).filter(Boolean);
      }

      const res = await fetch("/api/job-rss/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScanResults(data.listings || []);
      setScanQuery(data.queries?.join(", ") || "");
      fetchSearches();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  }

  async function handleSaveToListing(listing: JobListing) {
    await fetch("/api/saved-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: listing.title,
        company: listing.company,
        location: listing.location,
        url: listing.url,
        description: listing.summary,
        match_score: listing.matchScore,
        status: "BOOKMARKED",
        date_saved: new Date().toISOString().split("T")[0],
      }),
    });
  }

  async function handleDeleteSearch(id: number) {
    await fetch(`/api/job-rss/searches?id=${id}`, { method: "DELETE" });
    fetchSearches();
  }

  function toggleTarget(id: number) {
    setSelectedTargets((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  const matchColor = (score: number) => {
    if (score >= 80) return "text-neon-green";
    if (score >= 60) return "text-neon-cyan";
    if (score >= 40) return "text-neon-yellow";
    return "text-neon-red/70";
  };

  return (
    <>
      <AnimatedContainer>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">
            JOB RSS SCANNER
          </GlowText>
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button onClick={() => setIsAddFeedOpen(true)} className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">
              + ADD FEED
            </button>
          </ElectricBorder>
        </div>

        {/* RSS Feeds List */}
        {feeds.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-mono text-muted/50 uppercase tracking-widest mb-3">MONITORED FEEDS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {feeds.map((feed) => (
                <Card key={feed.id} hover={false}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-mono text-foreground truncate">{feed.name}</p>
                      <p className="text-[10px] font-mono text-muted/50 truncate">{feed.url}</p>
                    </div>
                    <button onClick={() => handleDeleteFeed(feed.id)} className="text-muted hover:text-neon-red text-xs ml-2">×</button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search Mode Toggle */}
        <div className="mb-6">
          <h3 className="text-xs font-mono text-muted/50 uppercase tracking-widest mb-3">SEARCH MODE</h3>
          <div className="flex gap-3">
            <ElectricBorder color={searchMode === "target" ? "#00F5FF" : "#333"} speed={searchMode === "target" ? 1 : 0} chaos={0.1} borderRadius={10}>
              <button
                onClick={() => setSearchMode("target")}
                className={`px-4 py-2.5 rounded-lg font-mono text-sm transition-colors ${
                  searchMode === "target"
                    ? "bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan"
                    : "bg-[#0a0a12] border border-[rgba(0,245,255,0.08)] text-muted hover:text-foreground"
                }`}
              >
                ◎ TARGET ROLES
              </button>
            </ElectricBorder>
            <ElectricBorder color={searchMode === "custom" ? "#BF00FF" : "#333"} speed={searchMode === "custom" ? 1 : 0} chaos={0.1} borderRadius={10}>
              <button
                onClick={() => setSearchMode("custom")}
                className={`px-4 py-2.5 rounded-lg font-mono text-sm transition-colors ${
                  searchMode === "custom"
                    ? "bg-neon-purple/20 border border-neon-purple/30 text-neon-purple"
                    : "bg-[#0a0a12] border border-[rgba(0,245,255,0.08)] text-muted hover:text-foreground"
                }`}
              >
                ✎ CUSTOM SEARCH
              </button>
            </ElectricBorder>
            <ElectricBorder color={searchMode === "feeds" ? "#00FF88" : "#333"} speed={searchMode === "feeds" ? 1 : 0} chaos={0.1} borderRadius={10}>
              <button
                onClick={() => setSearchMode("feeds")}
                className={`px-4 py-2.5 rounded-lg font-mono text-sm transition-colors ${
                  searchMode === "feeds"
                    ? "bg-neon-green/20 border border-neon-green/30 text-neon-green"
                    : "bg-[#0a0a12] border border-[rgba(0,245,255,0.08)] text-muted hover:text-foreground"
                }`}
              >
                ◉ FEEDS ONLY
              </button>
            </ElectricBorder>
          </div>
        </div>

        {/* Search Input based on mode */}
        <div className="mb-6">
          {searchMode === "target" ? (
            <div>
              <p className="text-xs font-mono text-muted/50 mb-3">SELECT TARGET ROLES TO SEARCH FOR (or leave empty to search all)</p>
              {jobTitles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {jobTitles.map((jt) => (
                    <button
                      key={jt.id}
                      onClick={() => toggleTarget(jt.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                        selectedTargets.includes(jt.id)
                          ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40"
                          : "bg-[#0a0a12] text-muted border border-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.25)]"
                      }`}
                    >
                      {jt.title}
                      {jt.company && <span className="text-muted/50 ml-1">@ {jt.company}</span>}
                    </button>
                  ))}
                </div>
              ) : (
                <Card hover={false}>
                  <p className="text-xs font-mono text-muted text-center">
                    No target roles configured. Add job targets in the JOB TARGETS page first.
                  </p>
                </Card>
              )}
            </div>
          ) : searchMode === "feeds" ? (
            <div>
              <p className="text-xs font-mono text-muted/50 mb-3">
                SEARCH WITHIN MONITORED FEEDS ({feeds.length} feeds)
                {feeds.length === 0 && " — Add feeds above first!"}
              </p>
              <input
                value={customSearchTerm}
                onChange={(e) => setCustomSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Optional: narrow down with keywords (leave empty to use your target roles)"
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted"
              />
            </div>
          ) : (
            <div>
              <p className="text-xs font-mono text-muted/50 mb-3">ENTER SEARCH TERMS</p>
              <input
                value={customSearchTerm}
                onChange={(e) => setCustomSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. senior devops engineer remote, cloud architect AWS..."
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted"
              />
            </div>
          )}
        </div>

        {/* Search Button */}
        <div className="mb-6">
          <ElectricBorder color={searchMode === "target" ? "#00F5FF" : searchMode === "feeds" ? "#00FF88" : "#BF00FF"} speed={1} chaos={0.15} borderRadius={10}>
            <button
              onClick={handleSearch}
              disabled={scanning || (searchMode === "custom" && !customSearchTerm.trim()) || (searchMode === "feeds" && feeds.length === 0)}
              className={`px-6 py-3 rounded-lg font-mono text-sm transition-colors disabled:opacity-50 ${
                searchMode === "target"
                  ? "bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/30"
                  : searchMode === "feeds"
                  ? "bg-neon-green/20 border border-neon-green/30 text-neon-green hover:bg-neon-green/30"
                  : "bg-neon-purple/20 border border-neon-purple/30 text-neon-purple hover:bg-neon-purple/30"
              }`}
            >
              {scanning ? "⏳ SCANNING..." : searchMode === "target" ? "◎ SCAN TARGET ROLES" : searchMode === "feeds" ? "◉ SCAN FEEDS ONLY" : "✎ SCAN CUSTOM SEARCH"}
            </button>
          </ElectricBorder>
        </div>

        {error && (
          <div className="mb-6 bg-neon-red/10 border border-neon-red/20 rounded-lg p-3">
            <p className="text-xs font-mono text-neon-red">{error}</p>
          </div>
        )}

        {/* Scan Results */}
        {scanResults.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono text-muted/50 uppercase tracking-widest">
                SEARCH RESULTS — {scanResults.length} FOUND
              </h3>
              {scanQuery && <p className="text-[10px] font-mono text-muted/30">Query: {scanQuery}</p>}
            </div>
            <p className="text-[10px] font-mono text-neon-yellow/40 mb-3">
              ⚠ Links are AI-discovered and verified for availability. Job postings may expire — if a link shows 404, the listing was likely removed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scanResults.map((listing, i) => (
                <AnimatedItem key={i}>
                  <Card hover={false}>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-mono font-semibold text-foreground truncate">{listing.title}</h4>
                          <p className="text-xs font-mono text-muted">{listing.company}{listing.location ? ` • ${listing.location}` : ""}</p>
                        </div>
                        <span className={`text-lg font-mono font-bold ${matchColor(listing.matchScore)}`}>
                          {listing.matchScore}%
                        </span>
                      </div>
                      {listing.summary && <p className="text-xs font-mono text-foreground/60 line-clamp-2">{listing.summary}</p>}
                      <div className="flex gap-2 pt-2 border-t border-[rgba(0,245,255,0.08)]">
                        <button onClick={() => handleSaveToListing(listing)} className="px-3 py-1 bg-neon-green/10 border border-neon-green/20 rounded text-xs font-mono text-neon-green hover:bg-neon-green/20 transition-colors">
                          ★ SAVE TO JOBS
                        </button>
                        {listing.url && (
                          <a href={listing.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 border border-[rgba(0,245,255,0.1)] rounded text-xs font-mono text-muted hover:text-foreground transition-colors">
                            OPEN ↗
                          </a>
                        )}
                        {listing._verified && (
                          <span className="px-2 py-1 text-[9px] font-mono text-neon-green/60 rounded">✓ VERIFIED</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </AnimatedItem>
              ))}
            </div>
          </div>
        )}

        {/* Search History */}
        {searches.length > 0 && (
          <div>
            <h3 className="text-xs font-mono text-muted/50 uppercase tracking-widest mb-3">SEARCH HISTORY</h3>
            <div className="space-y-2">
              {searches.map((s) => {
                const results = JSON.parse(s.results_json || "[]");
                return (
                  <Card key={s.id} hover={false}>
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                            s.search_mode === "target" ? "bg-neon-cyan/10 text-neon-cyan" : "bg-neon-purple/10 text-neon-purple"
                          }`}>
                            {s.search_mode}
                          </span>
                          <p className="text-sm font-mono text-foreground truncate">{s.name}</p>
                        </div>
                        <p className="text-[10px] font-mono text-muted/50 mt-0.5">
                          {results.length} results • {s.last_run ? new Date(s.last_run).toLocaleDateString() : "Never run"}
                        </p>
                      </div>
                      <button onClick={() => handleDeleteSearch(s.id)} className="text-muted hover:text-neon-red text-xs ml-2">×</button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </AnimatedContainer>

      {/* Add Feed Modal */}
      <Modal isOpen={isAddFeedOpen} onClose={() => setIsAddFeedOpen(false)} title="ADD RSS FEED">
        <div className="space-y-4">
          <FormField label="Feed Name" name="feedName" value={feedName} onChange={(e) => setFeedName(e.target.value)} placeholder="e.g. Indeed Remote Jobs" />
          <FormField label="Feed URL" name="feedUrl" value={feedUrl} onChange={(e) => setFeedUrl(e.target.value)} placeholder="https://..." />
          <div className="flex gap-3">
            <button onClick={handleAddFeed} className="flex-1 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">ADD</button>
            <button onClick={() => setIsAddFeedOpen(false)} className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted">CANCEL</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
