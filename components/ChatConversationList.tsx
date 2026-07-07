"use client";

import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/Card";

interface Conversation {
  id: number;
  title: string;
  model_used: string;
  created_at: string;
  updated_at: string;
}

export default function ChatConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
  onDelete: (id: number) => void;
}) {
  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr + "Z");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${day}/${month}/${year} ${time}`;
  }

  return (
    <div className="w-60 flex-shrink-0 flex flex-col h-full">
      <button
        onClick={onNew}
        className="w-full mb-3 px-3 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
      >
        + NEW CHAT
      </button>
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        <AnimatePresence mode="popLayout">
          {conversations.map((conv) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              layout
            >
              <div
                onClick={() => onSelect(conv.id)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                  activeId === conv.id
                    ? "bg-neon-cyan/10 border border-neon-cyan/30"
                    : "border border-transparent hover:bg-[rgba(0,245,255,0.03)] hover:border-[rgba(0,245,255,0.08)]"
                }`}
              >
                <p className="text-xs font-mono text-foreground truncate pr-6">
                  {conv.title}
                </p>
                <p className="text-[10px] font-mono text-muted mt-1">
                  {formatDate(conv.updated_at)}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded text-muted hover:text-neon-red transition-all"
                  title="Delete conversation"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {conversations.length === 0 && (
          <p className="text-xs font-mono text-muted text-center py-8">
            No conversations yet
          </p>
        )}
      </div>
    </div>
  );
}
