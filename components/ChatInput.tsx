"use client";

import { useState, useRef } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";

export default function ChatInput({
  onSend,
  onToggleSearch,
  loading,
  searchActive,
  webSearchEnabled,
  onToggleWebSearch,
}: {
  onSend: (content: string, attachments?: any[], messageType?: string) => void;
  onToggleSearch: () => void;
  loading: boolean;
  searchActive: boolean;
  webSearchEnabled: boolean;
  onToggleWebSearch: () => void;
}) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSend() {
    if (!text.trim() || loading) return;
    onSend(text.trim());
    setText("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedAttachments: any[] = [];

    const extractedTexts: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/chat/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          uploadedAttachments.push({
            type: data.type,
            name: data.name,
            url: data.url,
            size: data.size,
          });
          if (data.extractedText) {
            extractedTexts.push(`[Content of ${data.name}]:\n${data.extractedText}`);
          }
        }
      } catch {
        // Upload failed for this file
      }
    }

    setUploading(false);

    if (uploadedAttachments.length > 0) {
      const attachmentText = uploadedAttachments
        .map((a) => `[Attached: ${a.name}]`)
        .join("\n");
      const fullContent = [text, attachmentText, ...extractedTexts].filter(Boolean).join("\n\n");
      onSend(fullContent, uploadedAttachments);
      setText("");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleVoiceTranscript(transcript: string) {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 pr-12 text-sm font-mono text-foreground placeholder:text-muted focus:border-neon-cyan/50 transition-colors resize-none min-h-[40px] max-h-[120px]"
            style={{ height: "auto" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 120) + "px";
            }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={loading || !text.trim()}
          className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-[40px]"
        >
          {loading ? "..." : "SEND"}
        </button>
      </div>
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-1.5 rounded text-muted hover:text-foreground hover:bg-[rgba(0,245,255,0.05)] transition-colors disabled:opacity-50"
          title="Attach file"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        <button
          onClick={onToggleSearch}
          className={`p-1.5 rounded transition-colors ${
            searchActive
              ? "bg-neon-purple/20 border border-neon-purple/30 text-neon-purple"
              : "text-muted hover:text-foreground hover:bg-[rgba(0,245,255,0.05)]"
          }`}
          title="Web search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        <button
          onClick={onToggleWebSearch}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono transition-colors ${
            webSearchEnabled
              ? "bg-neon-green/20 border border-neon-green/30 text-neon-green"
              : "text-muted hover:text-foreground hover:bg-[rgba(0,245,255,0.05)] border border-transparent"
          }`}
          title={webSearchEnabled ? "Web search ON — results will be included as context" : "Web search OFF — toggle to include live web results"}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          {webSearchEnabled ? "WEB ON" : "WEB"}
        </button>
        <VoiceRecorder onTranscript={handleVoiceTranscript} />
        {uploading && (
          <span className="text-[10px] font-mono text-muted">Uploading...</span>
        )}
      </div>
    </div>
  );
}
