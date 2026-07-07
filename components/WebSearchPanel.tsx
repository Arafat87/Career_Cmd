"use client";

import { useState } from "react";
import Card from "@/components/Card";

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

export default function WebSearchPanel({
  onInsertContext,
  onClose,
}: {
  onInsertContext: (text: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);

    // Use AI to generate search-like results
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          payload: {
            conversationId: 0,
            content: `Web search query: "${query}". Provide a brief, factual summary of what you know about this topic. Focus on recent developments, key facts, and actionable information.`,
            message_type: "search_result",
          },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Parse AI response as search results
      setResults([
        {
          title: `Search: ${query}`,
          snippet: data.assistantMessage?.content || "No results found.",
          url: "",
        },
      ]);
    } catch {
      setResults([
        {
          title: "Search unavailable",
          snippet: "Configure an AI model in Settings to use web search.",
          url: "",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card hover={false} className="border-neon-purple/10">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-mono text-neon-purple uppercase tracking-wider">
          WEB SEARCH
        </h4>
        <button
          onClick={onClose}
          className="text-muted hover:text-foreground text-xs font-mono transition-colors"
        >
          CLOSE
        </button>
      </div>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search for anything..."
          className="flex-1 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted focus:border-neon-cyan/50 transition-colors"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-neon-purple/20 border border-neon-purple/30 rounded-lg font-mono text-sm text-neon-purple hover:bg-neon-purple/30 transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "SEARCH"}
        </button>
      </div>
      {results.length > 0 && (
        <div className="mt-3 space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              onClick={() => onInsertContext(r.snippet)}
              className="p-3 rounded-lg bg-[rgba(0,245,255,0.02)] border border-[rgba(0,245,255,0.08)] hover:border-[rgba(0,245,255,0.15)] cursor-pointer transition-colors"
            >
              <p className="text-xs font-mono font-semibold text-foreground">{r.title}</p>
              <p className="text-[11px] font-mono text-muted mt-1 line-clamp-3">{r.snippet}</p>
              <p className="text-[10px] font-mono text-neon-cyan/50 mt-1">Click to add as context</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
