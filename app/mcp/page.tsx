"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import McpToolCard from "@/components/McpToolCard";
import ElectricBorder from "@/components/ElectricBorder";

interface McpTool {
  name: string;
  description: string;
  params: Array<{ name: string; type: string; description: string; required?: boolean; enum?: string[] }>;
}

interface McpServer {
  name: string;
  description: string;
  icon: string;
  color: string;
  toolCount: number;
  tools: McpTool[];
}

interface HistoryEntry {
  id: number;
  tool_name: string;
  server_name: string;
  input_json: string;
  output_json: string;
  success: number;
  duration_ms: number;
  created_at: string;
}

export default function McpHubPage() {
  const [servers, setServers] = useState<McpServer[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/mcp").then((r) => r.json()),
      fetch("/api/mcp/servers").then((r) => r.json()),
    ]).then(([mcpServers, serverConfigs]) => {
      // Merge enabled state from DB
      const enabledMap: Record<string, boolean> = {};
      if (Array.isArray(serverConfigs)) {
        for (const sc of serverConfigs) {
          enabledMap[sc.name] = sc.enabled === 1;
        }
      }
      const merged = (mcpServers as McpServer[]).map((s) => ({
        ...s,
        enabled: enabledMap[s.name] !== false,
      }));
      setServers(merged);
      if (merged.length > 0) setSelectedServer(merged[0].name);
      setLoading(false);
    }).catch(() => setLoading(false));

    // Load history
    fetch("/api/mcp/servers").then((r) => r.json()).then((data) => {
      // History comes from a separate call if needed
    });
  }, []);

  async function toggleServer(name: string, enabled: boolean) {
    await fetch("/api/mcp/servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", name, enabled }),
    });
    // Reload
    const data = await fetch("/api/mcp").then((r) => r.json());
    setServers(data);
  }

  const activeServer = servers.find((s) => s.name === selectedServer);
  const totalTools = servers.reduce((sum, s) => sum + s.toolCount, 0);

  if (loading) {
    return (
      <AnimatedContainer className="space-y-6">
        <div>
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">MCP HUB</GlowText>
          <p className="text-xs font-mono text-muted/50 mt-1">Loading MCP servers...</p>
        </div>
      </AnimatedContainer>
    );
  }

  return (
    <AnimatedContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">MCP HUB</GlowText>
          <p className="text-xs font-mono text-muted/50 mt-1">
            {servers.length} SERVERS • {totalTools} TOOLS • MODEL CONTEXT PROTOCOL
          </p>
        </div>
      </div>

      {/* Server Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {servers.map((server) => (
          <AnimatedItem key={server.name}>
            <button
              onClick={() => setSelectedServer(server.name)}
              className={`w-full text-left transition-all ${selectedServer === server.name ? "ring-1" : "opacity-70 hover:opacity-100"}`}
              style={{ "--tw-ring-color": server.color } as React.CSSProperties}
            >
              <Card hover={false}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-mono font-black"
                      style={{ background: `${server.color}15`, color: server.color, border: `1px solid ${server.color}30` }}
                    >
                      {server.icon}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: `${server.color}10`, color: `${server.color}aa` }}>
                      {server.toolCount} TOOLS
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-mono font-semibold text-foreground uppercase tracking-wider">{server.name}</h3>
                    <p className="text-[10px] font-mono text-muted/50 mt-1 line-clamp-2">{server.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {server.tools.slice(0, 3).map((t) => (
                      <span key={t.name} className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-muted/40">
                        {t.name}
                      </span>
                    ))}
                    {server.tools.length > 3 && (
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-muted/30">
                        +{server.tools.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </button>
          </AnimatedItem>
        ))}
      </div>

      {/* Tool Browser */}
      {activeServer && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xs font-mono text-muted/50 uppercase tracking-widest" style={{ color: `${activeServer.color}80` }}>
              {activeServer.icon} {activeServer.name} — TOOLS
            </h3>
            <div className="flex-1 h-px" style={{ background: `${activeServer.color}20` }} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeServer.tools.map((tool) => (
              <AnimatedItem key={tool.name}>
                <McpToolCard tool={tool} color={activeServer.color} />
              </AnimatedItem>
            ))}
          </div>
        </div>
      )}
    </AnimatedContainer>
  );
}
