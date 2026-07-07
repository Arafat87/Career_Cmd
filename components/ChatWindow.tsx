"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import ChatConversationList from "@/components/ChatConversationList";
import ChatGreeting from "@/components/ChatGreeting";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import ChatModelSelector from "@/components/ChatModelSelector";
import WebSearchPanel from "@/components/WebSearchPanel";
import ThinkingIndicator from "@/components/ThinkingIndicator";

interface Conversation {
  id: number;
  title: string;
  model_used: string;
  created_at: string;
  updated_at: string;
}

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

export default function ChatWindow() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeId) {
      loadMessages(activeId);
    } else {
      setMessages([]);
    }
  }, [activeId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversations() {
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
        // Auto-select first conversation if none active
        if (!activeId && data.length > 0) {
          setActiveId(data[0].id);
        }
      }
    } catch {
      // Failed to load
    }
  }

  async function loadMessages(conversationId: number) {
    try {
      const res = await fetch(`/api/chat?conversationId=${conversationId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch {
      // Failed to load
    }
  }

  async function handleNewConversation() {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_conversation" }),
      });
      const data = await res.json();
      if (data.id) {
        setConversations((prev) => [data, ...prev]);
        setActiveId(data.id);
      }
    } catch {
      // Failed to create
    }
  }

  async function handleDeleteConversation(id: number) {
    try {
      await fetch(`/api/chat?id=${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        setActiveId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch {
      // Failed to delete
    }
  }

  async function handleSend(content: string, attachments?: any[], messageType?: string) {
    if (!activeId || loading) return;

    // If web search is enabled, search first and prepend results as context
    let finalContent = content;
    if (webSearchEnabled) {
      try {
        const searchRes = await fetch("/api/web-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: content }),
        });
        const searchData = await searchRes.json();
        if (searchData.results?.length > 0) {
          const context = searchData.results
            .map((r: any, i: number) => `[${i + 1}] ${r.title}\n${r.snippet}\n${r.url}`)
            .join("\n\n");
          finalContent = `Web search results for "${content}":\n\n${context}\n\n---\nUser question: ${content}`;
        }
      } catch {
        // Search failed, proceed without context
      }
    }

    // If no conversation exists, create one first
    let conversationId = activeId;
    if (!conversationId) {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create_conversation" }),
        });
        const data = await res.json();
        if (data.id) {
          conversationId = data.id;
          setActiveId(data.id);
          setConversations((prev) => [data, ...prev]);
        } else {
          return;
        }
      } catch {
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          payload: {
            conversationId,
            content: finalContent,
            attachments: attachments || [],
            message_type: messageType || "text",
          },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Append both messages
      setMessages((prev) => [...prev, data.userMessage, data.assistantMessage]);

      // Update conversation title in list if it changed
      if (data.assistantMessage) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, title: content.length > 50 ? content.substring(0, 50) + "..." : content, updated_at: new Date().toISOString() }
              : c
          )
        );
      }
    } catch (err: any) {
      // Add error as system message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          conversation_id: conversationId,
          role: "assistant",
          content: `Error: ${err.message || "Failed to send message"}`,
          attachments: "[]",
          message_type: "text",
          model_used: "",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchInsert(text: string) {
    // Insert search result text as context note into next message
    setShowSearch(false);
    // We'll just close the panel; the user can paste the text manually
    // or we could set it as a pending context
  }

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <div className="flex gap-4 h-[calc(100vh-220px)]">
      {/* Conversation List */}
      <ChatConversationList
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[rgba(0,245,255,0.08)]">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-mono text-neon-cyan/70 tracking-wider">
              {activeConversation?.title || "NEW CHAT"}
            </h3>
          </div>
          {activeId && (
            <ChatModelSelector
              conversationId={activeId}
              currentModel={activeConversation?.model_used || ""}
              onModelChange={(model) => {
                setConversations((prev) =>
                  prev.map((c) => (c.id === activeId ? { ...c, model_used: model } : c))
                );
              }}
            />
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
          {messages.length === 0 && !loading && <ChatGreeting />}
          <AnimatePresence>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-lg bg-[rgba(191,0,255,0.05)] border border-[rgba(191,0,255,0.12)]">
                <ThinkingIndicator />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Search Panel */}
        {showSearch && (
          <div className="mb-3">
            <WebSearchPanel
              onInsertContext={handleSearchInsert}
              onClose={() => setShowSearch(false)}
            />
          </div>
        )}

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onToggleSearch={() => setShowSearch((s) => !s)}
          loading={loading}
          searchActive={showSearch}
          webSearchEnabled={webSearchEnabled}
          onToggleWebSearch={() => setWebSearchEnabled((s) => !s)}
        />
      </div>
    </div>
  );
}
