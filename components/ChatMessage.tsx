"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ChatAttachment from "@/components/ChatAttachment";

interface MessageData {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  attachments: string;
  message_type: string;
  model_used: string;
  created_at: string;
}

export default function ChatMessage({ message, isNew = false }: { message: MessageData; isNew?: boolean }) {
  const isUser = message.role === "user";
  const [displayedText, setDisplayedText] = useState(isNew && !isUser ? "" : message.content);
  const [typingDone, setTypingDone] = useState(!isNew || isUser);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isNew || isUser) {
      setDisplayedText(message.content);
      setTypingDone(true);
      return;
    }

    // Typing effect for new assistant messages
    let idx = 0;
    const speed = 15; // ms per character
    intervalRef.current = setInterval(() => {
      idx += 3; // reveal 3 chars at a time for speed
      if (idx >= message.content.length) {
        setDisplayedText(message.content);
        setTypingDone(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setDisplayedText(message.content.substring(0, idx));
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [message.content, isNew, isUser]);

  let attachments: any[] = [];
  try {
    attachments = JSON.parse(message.attachments || "[]");
  } catch {}

  const time = message.created_at
    ? new Date(message.created_at + "Z").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-[rgba(0,245,255,0.08)] border border-[rgba(0,245,255,0.15)]"
            : "bg-[rgba(191,0,255,0.05)] border border-[rgba(191,0,255,0.12)]"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[10px] font-mono uppercase tracking-wider ${
              isUser ? "text-neon-cyan/70" : "text-neon-purple/70"
            }`}
          >
            {isUser ? "YOU" : "AI"}
          </span>
          <span className="text-[10px] font-mono text-muted">{time}</span>
        </div>
        <p className="text-sm font-mono text-foreground whitespace-pre-wrap leading-relaxed">
          {displayedText}
          {!typingDone && <span className="animate-pulse text-neon-cyan">▊</span>}
        </p>
        {attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {attachments.map((att: any, i: number) => (
              <ChatAttachment key={i} attachment={att} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
