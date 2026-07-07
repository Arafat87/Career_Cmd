"use client";

import { motion } from "framer-motion";

interface ChatAttachmentData {
  type: "image" | "file";
  name: string;
  url: string;
  size: number;
}

export default function ChatAttachment({ attachment }: { attachment: ChatAttachmentData }) {
  if (attachment.type === "image") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-2 max-w-xs"
      >
        <img
          src={attachment.url}
          alt={attachment.name}
          className="rounded-lg border border-[rgba(0,245,255,0.15)] max-h-48 object-cover"
        />
        <p className="text-[10px] font-mono text-muted mt-1">{attachment.name}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2"
    >
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.2)] transition-colors"
      >
        <span className="text-neon-cyan text-sm">📎</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-foreground truncate">{attachment.name}</p>
          <p className="text-[10px] font-mono text-muted">
            {attachment.size > 1024 * 1024
              ? `${(attachment.size / (1024 * 1024)).toFixed(1)} MB`
              : `${(attachment.size / 1024).toFixed(0)} KB`}
          </p>
        </div>
      </a>
    </motion.div>
  );
}
