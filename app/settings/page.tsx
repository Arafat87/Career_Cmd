"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import PulsingDot from "@/components/PulsingDot";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import ElectricBorder from "@/components/ElectricBorder";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import SoundToggle from "@/components/SoundToggle";

interface ModelConfig {
  id: number; provider: string; model_name: string; api_key: string; base_url: string; temperature: number; max_tokens: number; top_p: number; is_default: number;
}

interface ProviderModel {
  id: number; provider: string; model_name: string;
}

interface CustomProvider {
  id: number; name: string; base_url: string; api_key: string;
}

const BUILTIN_PROVIDERS = ["openai", "anthropic", "google", "groq", "openrouter", "ollama", "custom"];

const PROVIDER_DEFAULTS: Record<string, { base_url: string; api_key: string }> = {
  openrouter: { base_url: "https://openrouter.ai/api/v1", api_key: "" },
  ollama: { base_url: "http://localhost:11434/v1", api_key: "ollama" },
};

export default function SettingsPage() {
  const [configs, setConfigs] = useState<ModelConfig[]>([]);
  const [providerModels, setProviderModels] = useState<ProviderModel[]>([]);
  const [customProviders, setCustomProviders] = useState<CustomProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [newModelName, setNewModelName] = useState("");
  const [newProviderName, setNewProviderName] = useState("");
  const [newProviderUrl, setNewProviderUrl] = useState("");
  const [newProviderKey, setNewProviderKey] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ModelConfig | null>(null);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [form, setForm] = useState({
    provider: "openai", model_name: "", api_key: "", base_url: "", temperature: 0.7, max_tokens: 4096, top_p: 1.0, is_default: 0,
  });

  // MCP server state
  const [mcpServers, setMcpServers] = useState<any[]>([]);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [cfgRes, pmRes, cpRes, mcpRes] = await Promise.all([
      fetch("/api/settings").then(r => r.json()).catch(() => []),
      fetch("/api/provider-models").then(r => r.json()).catch(() => []),
      fetch("/api/providers").then(r => r.json()).catch(() => []),
      fetch("/api/mcp").then(r => r.json()).catch(() => []),
    ]);
    setConfigs(Array.isArray(cfgRes) ? cfgRes : []);
    setProviderModels(Array.isArray(pmRes) ? pmRes : []);
    setCustomProviders(Array.isArray(cpRes) ? cpRes : []);
    setMcpServers(Array.isArray(mcpRes) ? mcpRes : []);
  }

  // All providers = builtin + custom
  const allProviders = [...BUILTIN_PROVIDERS, ...customProviders.map((c) => c.name)];

  // Models grouped by provider
  function getModelsForProvider(provider: string): ProviderModel[] {
    return providerModels.filter((m) => m.provider === provider);
  }

  // Add a model to a provider
  async function handleAddModel(provider: string) {
    if (!newModelName.trim()) return;
    await fetch("/api/provider-models", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, model_name: newModelName.trim() }),
    });
    setNewModelName(""); fetchAll();
  }

  // Delete a model
  async function handleDeleteModel(id: number) {
    await fetch(`/api/provider-models?id=${id}`, { method: "DELETE" });
    fetchAll();
  }

  // Add custom provider
  async function handleAddProvider() {
    if (!newProviderName.trim()) return;
    await fetch("/api/providers", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newProviderName.trim(), base_url: newProviderUrl, api_key: newProviderKey }),
    });
    setNewProviderName(""); setNewProviderUrl(""); setNewProviderKey(""); setShowAddProvider(false); fetchAll();
  }

  // Delete custom provider
  async function handleDeleteProvider(id: number) {
    if (!confirm("Delete this provider and all its models?")) return;
    await fetch(`/api/providers?id=${id}`, { method: "DELETE" });
    if (selectedProvider && customProviders.find((c) => c.id === id)?.name === selectedProvider) setSelectedProvider(null);
    fetchAll();
  }

  // Model config CRUD
  function handleOpenModal(config?: ModelConfig) {
    if (config) {
      setEditingConfig(config);
      setForm({ provider: config.provider, model_name: config.model_name, api_key: "", base_url: config.base_url, temperature: config.temperature, max_tokens: config.max_tokens, top_p: config.top_p, is_default: config.is_default });
    } else {
      setEditingConfig(null);
      setForm({ provider: selectedProvider || "openai", model_name: "", api_key: "", base_url: "", temperature: 0.7, max_tokens: 4096, top_p: 1.0, is_default: 0 });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    const method = editingConfig ? "PUT" : "POST";
    const body: any = editingConfig ? { ...form, id: editingConfig.id, api_key: form.api_key || editingConfig.api_key } : form;
    if (body.api_key === "••••••••") body.api_key = editingConfig?.api_key || "";
    await fetch("/api/settings", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setIsModalOpen(false); fetchAll();
  }

  async function handleDeleteConfig(id: number) {
    if (!confirm("Delete this model configuration?")) return;
    await fetch(`/api/settings?id=${id}`, { method: "DELETE" }); fetchAll();
  }

  async function handleSetDefault(id: number) {
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, is_default: 1 }) }); fetchAll();
  }

  return (
    <>
      <AnimatedContainer className="space-y-6">
        {/* Theme Section */}
        <Card hover={false}>
          <ThemeSwitcher />
        </Card>

        {/* Sound Effects */}
        <Card hover={false}>
          <SoundToggle />
        </Card>

        <div className="flex items-center justify-between">
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">MODEL CONFIGURATION</GlowText>
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-[rgba(0,245,255,0.1)] border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-[rgba(0,245,255,0.2)] transition-colors">+ ADD MODEL CONFIG</button>
          </ElectricBorder>
        </div>

        <div className="flex gap-6">
          {/* Left: Provider List */}
          <div className="w-64 flex-shrink-0 space-y-2">
            <h3 className="text-xs font-mono text-muted/50 uppercase tracking-widest mb-2">PROVIDERS</h3>
            {allProviders.map((p) => {
              const isCustom = customProviders.find((c) => c.name === p);
              const modelCount = getModelsForProvider(p).length;
              return (
                <div key={p} onClick={() => setSelectedProvider(p)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${selectedProvider === p ? "bg-neon-cyan/10 border border-neon-cyan/30" : "border border-transparent hover:bg-[rgba(0,245,255,0.03)]"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono uppercase ${selectedProvider === p ? "text-neon-cyan" : "text-foreground"}`}>{p}</span>
                    {isCustom && <span className="text-[8px] font-mono text-muted/50">custom</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted">{modelCount}</span>
                    {isCustom && (
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteProvider(isCustom.id); }}
                        className="text-muted hover:text-neon-red text-[10px]">×</button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add Provider */}
            {!showAddProvider ? (
              <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
                <button onClick={() => setShowAddProvider(true)} className="w-full px-3 py-2 border border-dashed border-[rgba(0,245,255,0.1)] rounded-lg text-xs font-mono text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)] transition-colors">+ ADD PROVIDER</button>
              </ElectricBorder>
            ) : (
              <Card hover={false} className="!p-3 space-y-2">
                <input value={newProviderName} onChange={(e) => setNewProviderName(e.target.value)} placeholder="Provider name..."
                  className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1.5 text-xs font-mono text-foreground placeholder:text-muted" />
                <input value={newProviderUrl} onChange={(e) => setNewProviderUrl(e.target.value)} placeholder="Base URL (optional)"
                  className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1.5 text-xs font-mono text-foreground placeholder:text-muted" />
                <input value={newProviderKey} onChange={(e) => setNewProviderKey(e.target.value)} placeholder="Default API key (optional)"
                  className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1.5 text-xs font-mono text-foreground placeholder:text-muted" />
                <div className="flex gap-2">
                  <button onClick={handleAddProvider} className="flex-1 px-2 py-1.5 bg-neon-cyan/20 border border-neon-cyan/30 rounded text-xs font-mono text-neon-cyan">ADD</button>
                  <button onClick={() => setShowAddProvider(false)} className="px-2 py-1.5 border border-[rgba(0,245,255,0.1)] rounded text-xs font-mono text-muted">✕</button>
                </div>
              </Card>
            )}
          </div>

          {/* Right: Models for selected provider */}
          <div className="flex-1">
            {selectedProvider ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-mono text-neon-cyan/70 uppercase tracking-wider">{selectedProvider} MODELS</h3>
                  <span className="text-xs font-mono text-muted">{getModelsForProvider(selectedProvider).length} model(s)</span>
                </div>

                {/* Model list */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {getModelsForProvider(selectedProvider).map((m) => (
                    <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[rgba(0,245,255,0.02)] border border-[rgba(0,245,255,0.08)]">
                      <span className="text-xs font-mono text-foreground truncate">{m.model_name}</span>
                      <button onClick={() => handleDeleteModel(m.id)} className="text-muted hover:text-neon-red text-xs ml-2 flex-shrink-0">×</button>
                    </div>
                  ))}
                </div>

                {/* Add model input */}
                <div className="flex gap-2">
                  <input value={newModelName} onChange={(e) => setNewModelName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddModel(selectedProvider)}
                    placeholder="Add model name..."
                    className="flex-1 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
                  <button onClick={() => handleAddModel(selectedProvider)} disabled={!newModelName.trim()}
                    className="px-4 py-2 bg-neon-green/20 border border-neon-green/30 rounded-lg font-mono text-sm text-neon-green hover:bg-neon-green/30 transition-colors disabled:opacity-50">+ ADD</button>
                </div>

                {/* Model configs for this provider */}
                <div className="pt-4 border-t border-[rgba(0,245,255,0.08)]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-mono text-muted/50 uppercase tracking-widest">ACTIVE CONFIGS</h3>
                    <button onClick={() => { setForm({ ...form, provider: selectedProvider, model_name: "" }); setEditingConfig(null); setIsModalOpen(true); }}
                      className="text-xs font-mono text-neon-cyan hover:text-neon-cyan/80">+ CREATE CONFIG</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {configs.filter((c) => c.provider === selectedProvider).map((config) => (
                      <Card key={config.id} hover={false} className={config.is_default ? "border-neon-cyan/20" : ""}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {config.is_default ? <PulsingDot color="cyan" size="md" /> : <span className="w-2 h-2 rounded-full bg-muted" />}
                              <span className="text-sm font-mono font-semibold text-foreground">{config.model_name}</span>
                            </div>
                            {config.is_default ? (
                              <span className="text-[10px] font-mono text-neon-green/70">DEFAULT</span>
                            ) : (
                              <button onClick={() => handleSetDefault(config.id)} className="text-[10px] font-mono text-muted hover:text-neon-cyan">SET DEFAULT</button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                            <div><span className="text-muted">Temp:</span> <span className="text-neon-cyan/70">{config.temperature}</span></div>
                            <div><span className="text-muted">Tokens:</span> <span className="text-neon-cyan/70">{config.max_tokens}</span></div>
                            <div><span className="text-muted">Top P:</span> <span className="text-neon-cyan/70">{config.top_p}</span></div>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleOpenModal(config)} className="text-xs font-mono text-muted hover:text-neon-cyan">EDIT</button>
                            <button onClick={() => handleDeleteConfig(config.id)} className="text-xs font-mono text-muted hover:text-neon-red">DEL</button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {configs.filter((c) => c.provider === selectedProvider).length === 0 && (
                      <p className="text-xs font-mono text-muted col-span-2">No configs for this provider. Click &quot;+ CREATE CONFIG&quot; to add one.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm font-mono text-muted">← Select a provider to manage its models</p>
              </div>
            )}
          </div>
        </div>
      </AnimatedContainer>

      {/* Add/Edit Model Config Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingConfig ? "EDIT MODEL CONFIG" : "ADD MODEL CONFIG"}>
        <div className="space-y-4">
          <FormField label="Provider" name="provider" type="select" value={form.provider}
            onChange={(e) => {
              const p = e.target.value;
              const defaults = PROVIDER_DEFAULTS[p];
              setForm({ ...form, provider: p, model_name: "", base_url: defaults?.base_url || "", api_key: defaults?.api_key || "" });
            }}
            options={allProviders} />

          {/* Model selector from provider_models */}
          {getModelsForProvider(form.provider).length > 0 ? (
            <FormField label="Model" name="model_name" type="select" value={form.model_name}
              onChange={(e) => setForm({ ...form, model_name: e.target.value })}
              options={getModelsForProvider(form.provider).map((m) => m.model_name)} />
          ) : (
            <FormField label="Model Name" name="model_name" value={form.model_name}
              onChange={(e) => setForm({ ...form, model_name: e.target.value })} placeholder="model-name" required />
          )}

          <FormField label="API Key" name="api_key" value={form.api_key}
            onChange={(e) => setForm({ ...form, api_key: e.target.value })}
            placeholder={editingConfig ? "Leave blank to keep existing" : "sk-..."} />

          {["custom", "openrouter", "ollama"].includes(form.provider) && (
            <FormField label="Base URL" name="base_url" value={form.base_url}
              onChange={(e) => setForm({ ...form, base_url: e.target.value })}
              placeholder={form.provider === "ollama" ? "http://localhost:11434/v1" : form.provider === "openrouter" ? "https://openrouter.ai/api/v1" : "http://..."} />
          )}

          <FormField label="Temperature" name="temperature" type="number" value={form.temperature.toString()}
            onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })} min={0} max={2} step={0.1} />
          <FormField label="Max Tokens" name="max_tokens" type="number" value={form.max_tokens.toString()}
            onChange={(e) => setForm({ ...form, max_tokens: Number(e.target.value) })} min={1} max={128000} />
          <FormField label="Top P" name="top_p" type="number" value={form.top_p.toString()}
            onChange={(e) => setForm({ ...form, top_p: Number(e.target.value) })} min={0} max={1} step={0.1} />

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_default === 1} onChange={(e) => setForm({ ...form, is_default: e.target.checked ? 1 : 0 })} className="accent-neon-cyan" />
            <span className="text-xs font-mono text-muted">SET AS DEFAULT MODEL</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">{editingConfig ? "UPDATE" : "CREATE"}</button>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground transition-colors">CANCEL</button>
          </div>
        </div>
      </Modal>

      {/* MCP Servers */}
      <AnimatedContainer className="mt-8">
        <h3 className="text-xs font-mono text-muted/50 uppercase tracking-widest mb-4">MCP SERVERS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mcpServers.map((server: any) => {
            const serverColors: Record<string, string> = { database: "#00FF88", browser: "#FF8C00" };
            const color = serverColors[server.name] || "#00F5FF";
            return (
              <Card key={server.name} hover={false}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-mono font-black" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                      {server.name === "database" ? "DB" : "BR"}
                    </div>
                    <div>
                      <h4 className="text-sm font-mono font-semibold text-foreground uppercase">{server.name}</h4>
                      <p className="text-[10px] font-mono text-muted/50">{server.toolCount} tools</p>
                    </div>
                  </div>
                  <PulsingDot color={server.name === "database" ? "green" : "cyan"} />
                </div>
                <p className="text-[10px] font-mono text-muted/60 mb-3">{server.description}</p>
                <div className="flex flex-wrap gap-1">
                  {server.tools?.slice(0, 4).map((t: any) => (
                    <span key={t.name} className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-muted/40">{t.name}</span>
                  ))}
                  {server.tools?.length > 4 && <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-muted/30">+{server.tools.length - 4}</span>}
                </div>
              </Card>
            );
          })}
        </div>
        <div className="mt-3">
          <a href="/mcp" className="text-[10px] font-mono text-neon-cyan/50 hover:text-neon-cyan">MANAGE MCP TOOLS →</a>
        </div>
      </AnimatedContainer>

      {/* Data Export/Import */}
      <AnimatedContainer className="mt-8">
        <h3 className="text-xs font-mono text-muted/50 uppercase tracking-widest mb-4">DATA MANAGEMENT</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card hover={false}>
            <div className="space-y-3">
              <p className="text-sm font-mono text-foreground">Export All Data</p>
              <p className="text-xs font-mono text-muted/50">Download a JSON backup of all your career data</p>
              <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
                <a href="/api/export" download className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors inline-block">
                  EXPORT JSON
                </a>
              </ElectricBorder>
            </div>
          </Card>
          <Card hover={false}>
            <div className="space-y-3">
              <p className="text-sm font-mono text-foreground">Import Data</p>
              <p className="text-xs font-mono text-muted/50">Restore from a JSON backup file</p>
              <label className="px-4 py-2 bg-neon-purple/20 border border-neon-purple/30 rounded-lg font-mono text-sm text-neon-purple hover:bg-neon-purple/30 transition-colors inline-block cursor-pointer">
                IMPORT JSON
                <input type="file" accept=".json" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const text = await file.text();
                  const res = await fetch("/api/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: text });
                  const data = await res.json();
                  if (data.success) alert(`Imported ${data.imported} records`); else alert(`Error: ${data.error}`);
                  e.target.value = "";
                }} />
              </label>
            </div>
          </Card>
        </div>
      </AnimatedContainer>
    </>
  );
}
