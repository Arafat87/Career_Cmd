"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";
import { AnimatedContainer } from "@/components/AnimatedList";
import ElectricBorder from "@/components/ElectricBorder";

interface Flashcard {
  id: number;
  front: string;
  back: string;
  category: string;
  difficulty: string;
  ease: number;
  interval: number;
  nextReview: number;
  timesReviewed: number;
}

function getInitialCards(): Flashcard[] {
  return [
    { id: 1, front: "What is the CAP theorem?", back: "Consistency, Availability, Partition tolerance — you can only guarantee 2 of 3 in a distributed system.", category: "SYSTEM DESIGN", difficulty: "MEDIUM", ease: 2.5, interval: 1, nextReview: Date.now(), timesReviewed: 0 },
    { id: 2, front: "Difference between TCP and UDP?", back: "TCP: reliable, ordered, connection-oriented (HTTP, SSH). UDP: fast, connectionless, no guarantee (DNS, video streaming, gaming).", category: "NETWORKING", difficulty: "EASY", ease: 2.5, interval: 1, nextReview: Date.now(), timesReviewed: 0 },
    { id: 3, front: "What is a reverse proxy?", back: "A server that sits between clients and backend servers, forwarding requests. Provides load balancing, SSL termination, caching, and security (e.g., Nginx, HAProxy).", category: "NETWORKING", difficulty: "MEDIUM", ease: 2.5, interval: 1, nextReview: Date.now(), timesReviewed: 0 },
    { id: 4, front: "Explain Kubernetes pods", back: "Smallest deployable unit in K8s. A pod wraps one or more containers that share networking and storage. Pods are ephemeral and scheduled on nodes.", category: "DEVOPS", difficulty: "MEDIUM", ease: 2.5, interval: 1, nextReview: Date.now(), timesReviewed: 0 },
    { id: 5, front: "What is Infrastructure as Code?", back: "Managing infrastructure through machine-readable config files instead of manual processes. Tools: Terraform, CloudFormation, Pulumi. Enables versioning, reproducibility, automation.", category: "DEVOPS", difficulty: "EASY", ease: 2.5, interval: 1, nextReview: Date.now(), timesReviewed: 0 },
    { id: 6, front: "What is a VPC?", back: "Virtual Private Cloud — isolated network in a cloud provider. You control IP ranges, subnets, route tables, gateways, and security groups. Foundational for cloud networking.", category: "CLOUD", difficulty: "EASY", ease: 2.5, interval: 1, nextReview: Date.now(), timesReviewed: 0 },
    { id: 7, front: "Explain the STAR method", back: "Situation: set the context. Task: what was your responsibility. Action: what you specifically did. Result: the outcome with metrics. Used for behavioral interview answers.", category: "BEHAVIORAL", difficulty: "EASY", ease: 2.5, interval: 1, nextReview: Date.now(), timesReviewed: 0 },
    { id: 8, front: "What is eventual consistency?", back: "A consistency model where all replicas converge to the same value over time, but reads may return stale data temporarily. Used in distributed systems for higher availability.", category: "SYSTEM DESIGN", difficulty: "HARD", ease: 2.5, interval: 1, nextReview: Date.now(), timesReviewed: 0 },
    { id: 9, front: "What is a load balancer?", back: "Distributes incoming traffic across multiple servers. Algorithms: round-robin, least connections, IP hash. Types: L4 (TCP) and L7 (HTTP). Examples: ALB, Nginx, HAProxy.", category: "NETWORKING", difficulty: "EASY", ease: 2.5, interval: 1, nextReview: Date.now(), timesReviewed: 0 },
    { id: 10, front: "Difference between CI and CD?", back: "CI: Continuous Integration — automatically build and test code on every push. CD: Continuous Delivery/Deployment — automatically deploy tested code to production.", category: "DEVOPS", difficulty: "EASY", ease: 2.5, interval: 1, nextReview: Date.now(), timesReviewed: 0 },
  ];
}

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<"study" | "manage">("study");
  const [filterCategory, setFilterCategory] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ front: "", back: "", category: "TECHNICAL", difficulty: "MEDIUM" });

  useEffect(() => {
    const saved = localStorage.getItem("hireops_flashcards");
    if (saved) {
      setCards(JSON.parse(saved));
    } else {
      setCards(getInitialCards());
    }
  }, []);

  useEffect(() => {
    if (cards.length > 0) localStorage.setItem("hireops_flashcards", JSON.stringify(cards));
  }, [cards]);

  const dueCards = filterCategory
    ? cards.filter((c) => c.category === filterCategory && c.nextReview <= Date.now())
    : cards.filter((c) => c.nextReview <= Date.now());

  const categories = [...new Set(cards.map((c) => c.category))];
  const currentCard = dueCards[currentIdx];

  function rateCard(quality: number) {
    if (!currentCard) return;
    // SM-2 algorithm
    const q = quality;
    let ease = currentCard.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (ease < 1.3) ease = 1.3;
    let interval = currentCard.interval;
    if (q < 3) {
      interval = 1;
    } else if (currentCard.timesReviewed === 0) {
      interval = 1;
    } else if (currentCard.timesReviewed === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease);
    }

    setCards((prev) => prev.map((c) => c.id === currentCard.id ? {
      ...c, ease, interval, timesReviewed: c.timesReviewed + 1,
      nextReview: Date.now() + interval * 86400000,
    } : c));

    setFlipped(false);
    if (currentIdx >= dueCards.length - 1) {
      setCurrentIdx(0);
    }
  }

  function addCard() {
    if (!form.front.trim() || !form.back.trim()) return;
    const id = Math.max(...cards.map((c) => c.id), 0) + 1;
    setCards((prev) => [...prev, { ...form, id, ease: 2.5, interval: 1, nextReview: Date.now(), timesReviewed: 0 }]);
    setForm({ front: "", back: "", category: "TECHNICAL", difficulty: "MEDIUM" });
    setShowAdd(false);
  }

  function deleteCard(id: number) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  if (mode === "manage") {
    return (
      <AnimatedContainer className="space-y-6">
        <div className="flex items-center justify-between">
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">FLASHCARD DECK ({cards.length} cards)</GlowText>
          <div className="flex gap-2">
            <ElectricBorder color="#BF00FF" speed={1} chaos={0.12} borderRadius={10}>
              <button onClick={() => setShowAdd(true)} className="px-3 py-1.5 bg-neon-purple/20 border border-neon-purple/30 rounded-lg font-mono text-xs text-neon-purple hover:bg-neon-purple/30">+ ADD CARD</button>
            </ElectricBorder>
            <button onClick={() => setMode("study")} className="px-3 py-1.5 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-xs text-neon-cyan hover:bg-neon-cyan/30">STUDY MODE</button>
          </div>
        </div>

        {showAdd && (
          <Card hover={false}>
            <h3 className="text-xs font-mono text-muted mb-3">NEW CARD</h3>
            <div className="space-y-3">
              <textarea value={form.front} onChange={(e) => setForm({ ...form, front: e.target.value })} placeholder="Front (question)..."
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground resize-none h-20" />
              <textarea value={form.back} onChange={(e) => setForm({ ...form, back: e.target.value })} placeholder="Back (answer)..."
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground resize-none h-20" />
              <div className="flex gap-3">
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category"
                  className="flex-1 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground" />
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground">
                  <option>EASY</option><option>MEDIUM</option><option>HARD</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={addCard} className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-xs text-neon-cyan">CREATE</button>
                <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-xs text-muted">CANCEL</button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cards.map((c) => (
            <Card key={c.id} hover={false}>
              <div className="flex items-start justify-between mb-2">
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-neon-purple/10 text-neon-purple border border-neon-purple/20">{c.category}</span>
                <button onClick={() => deleteCard(c.id)} className="text-muted hover:text-neon-red text-xs">✕</button>
              </div>
              <p className="text-xs font-mono text-foreground font-semibold mb-1">{c.front}</p>
              <p className="text-[10px] font-mono text-muted">{c.back}</p>
              <div className="flex items-center gap-3 mt-2 text-[9px] font-mono text-muted/50">
                <span>Reviewed: {c.timesReviewed}x</span>
                <span>Ease: {c.ease.toFixed(1)}</span>
                <span>Next: {new Date(c.nextReview).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      </AnimatedContainer>
    );
  }

  // Study mode
  if (dueCards.length === 0) {
    return (
      <AnimatedContainer className="space-y-6">
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">FLASHCARDS</GlowText>
        <Card hover={false} className="text-center py-12">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-sm font-mono text-foreground">No cards due for review!</p>
          <p className="text-xs font-mono text-muted mt-1">{cards.length} cards total — {categories.length} categories</p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={() => setMode("manage")} className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-xs text-neon-cyan">MANAGE DECK</button>
            <button onClick={() => { setCards((prev) => prev.map((c) => ({ ...c, nextReview: Date.now() }))); }}
              className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-xs text-muted">RESET ALL</button>
          </div>
        </Card>
      </AnimatedContainer>
    );
  }

  return (
    <AnimatedContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">
          {dueCards.length} CARD{dueCards.length !== 1 ? "S" : ""} DUE
        </GlowText>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {categories.map((c) => (
              <button key={c} onClick={() => setFilterCategory(filterCategory === c ? "" : c)}
                className={`px-2 py-1 rounded text-[9px] font-mono ${filterCategory === c ? "bg-neon-purple/10 text-neon-purple border border-neon-purple/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>{c}</button>
            ))}
          </div>
          <button onClick={() => setMode("manage")} className="px-3 py-1.5 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-xs text-muted">MANAGE</button>
        </div>
      </div>

      {/* Flashcard */}
      {currentCard && (
        <div className="flex justify-center">
          <div onClick={() => setFlipped(!flipped)}
            className="w-full max-w-xl cursor-pointer perspective-1000"
            style={{ perspective: "1000px" }}>
            <div className={`relative transition-transform duration-500`} style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
              {/* Front */}
              <Card hover={false} className="min-h-[250px] flex flex-col justify-center items-center text-center p-8"
                style={{ backfaceVisibility: "hidden" }}>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-neon-purple/10 text-neon-purple border border-neon-purple/20 mb-4">{currentCard.category}</span>
                <p className="text-lg font-mono font-bold text-foreground">{currentCard.front}</p>
                <p className="text-[10px] font-mono text-muted mt-4">Click to reveal answer</p>
              </Card>
              {/* Back */}
              <Card hover={false} className="min-h-[250px] flex flex-col justify-center p-8 absolute inset-0"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-neon-green/10 text-neon-green border border-neon-green/20 mb-4 self-start">ANSWER</span>
                <p className="text-sm font-mono text-foreground/80 leading-relaxed">{currentCard.back}</p>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Rating buttons */}
      {flipped && (
        <div className="flex justify-center gap-3">
          {[
            { label: "AGAIN", quality: 1, color: "#FF2D55", desc: "Forgot completely" },
            { label: "HARD", quality: 3, color: "#FFD700", desc: "Struggled" },
            { label: "GOOD", quality: 4, color: "#00F5FF", desc: "Recalled" },
            { label: "EASY", quality: 5, color: "#00FF88", desc: "Instant recall" },
          ].map((r) => (
            <button key={r.label} onClick={() => rateCard(r.quality)}
              className="px-6 py-3 rounded-lg font-mono text-sm transition-all hover:scale-105"
              style={{ backgroundColor: `${r.color}15`, border: `1px solid ${r.color}30`, color: r.color }}>
              {r.label}
              <span className="block text-[8px] opacity-60 mt-0.5">{r.desc}</span>
            </button>
          ))}
        </div>
      )}

      <p className="text-center text-[10px] font-mono text-muted">
        Card {currentIdx + 1} of {dueCards.length} • Spaced repetition (SM-2)
      </p>
    </AnimatedContainer>
  );
}
