"use client";

import { useState } from "react";
import Card from "./Card";
import ElectricBorder from "./ElectricBorder";

interface McpToolParam {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  enum?: string[];
  default?: string | number | boolean;
}

interface McpTool {
  name: string;
  description: string;
  params: McpToolParam[];
}

interface McpToolResult {
  success: boolean;
  data: unknown;
  error?: string;
  toolName: string;
  duration: number;
}

export default function McpToolCard({ tool, color }: { tool: McpTool; color: string }) {
  const [expanded, setExpanded] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<McpToolResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize defaults
  const getInitialParams = () => {
    const vals: Record<string, string> = {};
    for (const p of tool.params) {
      if (p.default !== undefined) vals[p.name] = String(p.default);
    }
    return vals;
  };

  function handleExpand() {
    if (!expanded) {
      setParamValues(getInitialParams());
      setResult(null);
    }
    setExpanded(!expanded);
  }

  async function handleExecute() {
    setLoading(true);
    setResult(null);
    try {
      // Convert param values to proper types
      const params: Record<string, unknown> = {};
      for (const p of tool.params) {
        const val = paramValues[p.name];
        if (val === undefined || val === "") continue;
        if (p.type === "number") params[p.name] = Number(val);
        else if (p.type === "boolean") params[p.name] = val === "true";
        else params[p.name] = val;
      }

      const res = await fetch("/api/mcp/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName: tool.name, params }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({ success: false, data: null, error: e.message, toolName: tool.name, duration: 0 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card hover={false}>
      <div className="space-y-3">
        {/* Header */}
        <button onClick={handleExpand} className="w-full text-left flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-mono font-semibold text-foreground truncate" style={{ color }}>
              {tool.name}
            </h4>
            <p className="text-xs font-mono text-muted/70 mt-1 line-clamp-2">{tool.description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {tool.params.filter((p) => p.required).length > 0 && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border" style={{ borderColor: `${color}30`, color: `${color}99` }}>
                {tool.params.filter((p) => p.required).length} params
              </span>
            )}
            <span className="text-xs font-mono text-muted/50">{expanded ? "▲" : "▼"}</span>
          </div>
        </button>

        {/* Expanded form */}
        {expanded && (
          <div className="space-y-3 pt-2 border-t border-[rgba(0,245,255,0.08)]">
            {/* Parameters */}
            {tool.params.length > 0 && (
              <div className="space-y-2">
                {tool.params.map((param) => (
                  <div key={param.name}>
                    <label className="text-[10px] font-mono text-muted/60 uppercase tracking-wider">
                      {param.name}
                      {param.required && <span className="text-red-400 ml-1">*</span>}
                      <span className="ml-2 text-muted/30 normal-case">{param.type}</span>
                    </label>
                    {param.enum ? (
                      <select
                        value={paramValues[param.name] || ""}
                        onChange={(e) => setParamValues((prev) => ({ ...prev, [param.name]: e.target.value }))}
                        className="w-full mt-1 px-2 py-1.5 bg-black/40 border border-[rgba(0,245,255,0.1)] rounded text-xs font-mono text-foreground focus:outline-none focus:border-neon-cyan/30"
                      >
                        <option value="">Select...</option>
                        {param.enum.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={param.type === "number" ? "number" : "text"}
                        value={paramValues[param.name] || ""}
                        onChange={(e) => setParamValues((prev) => ({ ...prev, [param.name]: e.target.value }))}
                        placeholder={param.description}
                        className="w-full mt-1 px-2 py-1.5 bg-black/40 border border-[rgba(0,245,255,0.1)] rounded text-xs font-mono text-foreground placeholder:text-muted/30 focus:outline-none focus:border-neon-cyan/30"
                      />
                    )}
                    <p className="text-[9px] font-mono text-muted/40 mt-0.5">{param.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Execute button */}
            <ElectricBorder color={color} className="inline-block">
              <button
                onClick={handleExecute}
                disabled={loading}
                className="px-4 py-1.5 text-xs font-mono font-semibold transition-colors disabled:opacity-50"
                style={{ color }}
              >
                {loading ? "EXECUTING..." : "▶ EXECUTE"}
              </button>
            </ElectricBorder>

            {/* Result */}
            {result && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${result.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                    {result.success ? "SUCCESS" : "ERROR"}
                  </span>
                  {result.duration > 0 && (
                    <span className="text-[9px] font-mono text-muted/40">{result.duration}ms</span>
                  )}
                </div>
                <pre className="text-[10px] font-mono text-foreground/70 bg-black/60 border border-[rgba(0,245,255,0.08)] rounded p-3 overflow-auto max-h-64 whitespace-pre-wrap break-all">
                  {result.error || JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
