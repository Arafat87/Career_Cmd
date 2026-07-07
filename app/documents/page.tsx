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

interface Document {
  id: number;
  title: string;
  doc_type: string;
  url: string;
  content_text: string;
  tags: string;
  version: string;
  notes: string;
  category: string;
}

const DEFAULT_FORM = {
  title: "",
  doc_type: "RESUME",
  url: "",
  content_text: "",
  tags: "",
  version: "1.0",
  notes: "",
  category: "",
};

const DOC_TYPES = [
  { value: "RESUME", label: "RESUME", color: "text-neon-cyan/70", bg: "bg-neon-cyan/10", border: "border-neon-cyan/20" },
  { value: "COVER LETTER", label: "COVER LETTER", color: "text-neon-purple/70", bg: "bg-neon-purple/10", border: "border-neon-purple/20" },
  { value: "PORTFOLIO", label: "PORTFOLIO", color: "text-neon-yellow/70", bg: "bg-neon-yellow/10", border: "border-neon-yellow/20" },
  { value: "LINK", label: "LINK", color: "text-neon-green/70", bg: "bg-neon-green/10", border: "border-neon-green/20" },
  { value: "REFERENCE", label: "REFERENCE", color: "text-neon-blue/70", bg: "bg-neon-blue/10", border: "border-neon-blue/20" },
  { value: "OTHER", label: "OTHER", color: "text-muted", bg: "bg-muted/10", border: "border-muted/20" },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [filterType, setFilterType] = useState<string>("");
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, []);

  async function fetchDocuments() {
    const data = await fetchArray("/api/documents");
    setDocuments(data as Document[]);
  }

  async function fetchCategories() {
    const data = await fetchArray("/api/categories?scope=documents");
    setCategories(data);
  }

  function getCategoryColor(name: string): string {
    const cat = categories.find((c: any) => c.name === name);
    return cat?.color || "#00F5FF";
  }

  function getDocTypeStyle(docType: string) {
    return DOC_TYPES.find((d) => d.value === docType) || DOC_TYPES[DOC_TYPES.length - 1];
  }

  function handleOpenModal(doc?: Document) {
    if (doc) {
      setEditingDoc(doc);
      setForm({
        title: doc.title,
        doc_type: doc.doc_type,
        url: doc.url,
        content_text: doc.content_text,
        tags: doc.tags,
        version: doc.version,
        notes: doc.notes,
        category: doc.category,
      });
    } else {
      setEditingDoc(null);
      setForm({ ...DEFAULT_FORM });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    if (editingDoc) {
      await fetch("/api/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingDoc.id, ...form }),
      });
    } else {
      await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setIsModalOpen(false);
    fetchDocuments();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    fetchDocuments();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setForm((prev) => ({ ...prev, url: data.url }));
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const filtered = filterType ? documents.filter((d) => d.doc_type === filterType) : documents;
  const typeCounts = DOC_TYPES.map((t) => ({
    ...t,
    count: documents.filter((d) => d.doc_type === t.value).length,
  }));

  function renderTagPills(tags: string) {
    if (!tags) return null;
    return tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => (
      <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-neon-cyan/5 text-neon-cyan/60 border border-neon-cyan/10">
        {tag}
      </span>
    ));
  }

  return (
    <>
      <AnimatedContainer>
        <div className="flex items-center justify-between mb-6">
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">
            {documents.length} DOCUMENT{documents.length !== 1 ? "S" : ""}
          </GlowText>
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
            >
              + ADD DOCUMENT
            </button>
          </ElectricBorder>
        </div>

        {/* Doc type filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterType("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              !filterType ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"
            }`}
          >
            ALL ({documents.length})
          </button>
          {typeCounts.filter((t) => t.count > 0).map((t) => (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                filterType === t.value ? `${t.bg} ${t.color} border ${t.border}` : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Documents grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((doc) => {
            const dt = getDocTypeStyle(doc.doc_type);
            return (
              <AnimatedItem key={doc.id}>
                <Card>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-mono font-semibold text-foreground truncate">{doc.title}</h4>
                        {doc.version && (
                          <p className="text-[10px] font-mono text-muted mt-0.5">v{doc.version}</p>
                        )}
                      </div>
                      <span className={`shrink-0 ml-2 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${dt.color} ${dt.bg} border ${dt.border}`}>
                        {dt.label}
                      </span>
                    </div>
                    {doc.category && (
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-mono border"
                        style={{ color: getCategoryColor(doc.category), borderColor: `${getCategoryColor(doc.category)}30`, backgroundColor: `${getCategoryColor(doc.category)}10` }}
                      >
                        {doc.category}
                      </span>
                    )}
                    {doc.tags && (
                      <div className="flex flex-wrap gap-1">
                        {renderTagPills(doc.tags)}
                      </div>
                    )}
                    {doc.content_text && (
                      <p className="text-xs font-mono text-foreground/50 line-clamp-3 leading-relaxed">{doc.content_text}</p>
                    )}
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-neon-cyan/50 hover:text-neon-cyan truncate block">
                        {doc.url.startsWith("/uploads/") ? `📎 ${doc.url.split("/").pop()}` : doc.url}
                      </a>
                    )}
                    {doc.notes && <p className="text-xs font-mono text-foreground/60 line-clamp-2">{doc.notes}</p>}
                    <div className="flex gap-2 pt-2 border-t border-[rgba(0,245,255,0.08)]">
                      <button onClick={() => handleOpenModal(doc)} className="px-3 py-1 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] rounded text-xs font-mono text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)] transition-colors">
                        EDIT
                      </button>
                      <button onClick={() => handleDelete(doc.id)} className="px-3 py-1 bg-[rgba(255,45,85,0.05)] border border-[rgba(255,45,85,0.1)] rounded text-xs font-mono text-muted hover:text-neon-red hover:border-[rgba(255,45,85,0.2)] transition-colors">
                        DEL
                      </button>
                    </div>
                  </div>
                </Card>
              </AnimatedItem>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <Card hover={false}>
            <p className="text-sm font-mono text-muted text-center">
              {filterType ? `No ${filterType} documents` : "No documents yet. Add one to start building your library!"}
            </p>
          </Card>
        )}
      </AnimatedContainer>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDoc ? "EDIT DOCUMENT" : "ADD DOCUMENT"}>
        <div className="space-y-4">
          <FormField label="Title" name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Document Type</label>
            <div className="flex flex-wrap gap-2">
              {DOC_TYPES.map((dt) => (
                <button key={dt.value} type="button" onClick={() => setForm({ ...form, doc_type: dt.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${form.doc_type === dt.value ? `${dt.bg} ${dt.color} border ${dt.border}` : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"}`}>
                  {dt.label}
                </button>
              ))}
            </div>
          </div>
          <CategorySelector scope="documents" value={form.category} onChange={(cat) => setForm({ ...form, category: cat })} />
          <FormField label="URL" name="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
          <div>
            <label className="block text-xs font-mono text-muted mb-2">OR UPLOAD FILE (PDF / DOC)</label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-[rgba(0,245,255,0.2)] bg-[rgba(0,245,255,0.03)] cursor-pointer hover:border-neon-cyan/40 hover:bg-[rgba(0,245,255,0.06)] transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {uploading ? (
                  <span className="text-xs font-mono text-neon-cyan animate-pulse">UPLOADING...</span>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neon-cyan/60">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-xs font-mono text-muted">Choose PDF or DOC file</span>
                  </>
                )}
              </label>
            </div>
            {uploadError && <p className="text-[10px] font-mono text-neon-red mt-1">{uploadError}</p>}
            {form.url && form.url.startsWith("/uploads/") && (
              <p className="text-[10px] font-mono text-neon-green mt-1">File uploaded: {form.url.split("/").pop()}</p>
            )}
          </div>
          <FormField label="Version" name="version" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="1.0" />
          <FormField label="Tags" name="tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="comma, separated, tags" />
          <FormField label="Content" name="content_text" type="textarea" value={form.content_text} onChange={(e) => setForm({ ...form, content_text: e.target.value })} />
          <FormField label="Notes" name="notes" type="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">
              {editingDoc ? "UPDATE" : "CREATE"}
            </button>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground transition-colors">
              CANCEL
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
