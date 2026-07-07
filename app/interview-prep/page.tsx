"use client";

import { useState, useEffect, useRef } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";
import { AnimatedContainer } from "@/components/AnimatedList";
import CountdownTimer from "@/components/CountdownTimer";

const INTERVIEW_QUESTIONS = [
  { q: "Tell me about yourself", category: "BEHAVIORAL", tip: "Focus on professional journey, 2 min max" },
  { q: "Why do you want to work here?", category: "BEHAVIORAL", tip: "Research the company, mention specific products/mission" },
  { q: "Describe a time you dealt with a difficult team member", category: "BEHAVIORAL", tip: "Use STAR method: Situation, Task, Action, Result" },
  { q: "What's your greatest weakness?", category: "BEHAVIORAL", tip: "Show self-awareness + how you're improving" },
  { q: "Where do you see yourself in 5 years?", category: "BEHAVIORAL", tip: "Show ambition but realistic growth within the company" },
  { q: "Explain a complex technical concept to a non-technical person", category: "TECHNICAL", tip: "Use analogies, avoid jargon, check understanding" },
  { q: "How would you design a URL shortener?", category: "SYSTEM DESIGN", tip: "Discuss scale, database choice, caching, analytics" },
  { q: "What happens when you type a URL in the browser?", category: "TECHNICAL", tip: "DNS, TCP, TLS, HTTP, rendering pipeline" },
  { q: "How do you handle disagreements with your manager?", category: "BEHAVIORAL", tip: "Show respect, data-driven approach, willingness to commit" },
  { q: "Describe a project you're proud of", category: "BEHAVIORAL", tip: "Quantify impact, mention challenges overcome" },
  { q: "How would you troubleshoot a production outage?", category: "TECHNICAL", tip: "Triage, communicate, mitigate, root cause, postmortem" },
  { q: "What's the difference between TCP and UDP?", category: "TECHNICAL", tip: "Reliability vs speed, use cases for each" },
  { q: "Explain Kubernetes to me", category: "TECHNICAL", tip: "Container orchestration, pods, services, scaling" },
  { q: "How do you stay current with technology?", category: "BEHAVIORAL", tip: "Blogs, conferences, hands-on projects, communities" },
  { q: "Design a rate limiter", category: "SYSTEM DESIGN", tip: "Token bucket, sliding window, distributed considerations" },
];

export default function InterviewPrepPage() {
  const [mode, setMode] = useState<"setup" | "active" | "review">("setup");
  const [duration, setDuration] = useState(5);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeUp, setTimeUp] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [questions, setQuestions] = useState(INTERVIEW_QUESTIONS);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const categories = [...new Set(INTERVIEW_QUESTIONS.map((q) => q.category))];
  const filtered = categoryFilter ? questions.filter((q) => q.category === categoryFilter) : questions;
  const currentQ = filtered[currentIdx];
  const progress = ((currentIdx + 1) / filtered.length) * 100;

  function startPrep() {
    setMode("active");
    setCurrentIdx(0);
    setAnswers([]);
    setCurrentAnswer("");
    setTimeUp(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  function nextQuestion() {
    setAnswers((prev) => [...prev, currentAnswer]);
    setCurrentAnswer("");
    if (currentIdx + 1 >= filtered.length) {
      setMode("review");
    } else {
      setCurrentIdx((i) => i + 1);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }

  function skipQuestion() {
    setAnswers((prev) => [...prev, ""]);
    setCurrentAnswer("");
    if (currentIdx + 1 >= filtered.length) {
      setMode("review");
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  if (mode === "setup") {
    return (
      <AnimatedContainer className="space-y-6">
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">INTERVIEW PREP MODE</GlowText>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card hover={false}>
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-4">CONFIGURATION</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-muted mb-2">TIME PER QUESTION (minutes)</label>
                <div className="flex gap-2">
                  {[2, 3, 5, 7, 10].map((m) => (
                    <button key={m} onClick={() => setDuration(m)}
                      className={`px-3 py-2 rounded-lg text-xs font-mono transition-all ${duration === m ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>{m}m</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-muted mb-2">CATEGORY FILTER</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setCategoryFilter("")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${!categoryFilter ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>ALL</button>
                  {categories.map((c) => (
                    <button key={c} onClick={() => setCategoryFilter(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${categoryFilter === c ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>{c}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-muted mb-2">INTERVIEW DATE (optional countdown)</label>
                <input type="datetime-local" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground" />
              </div>

              <button onClick={startPrep}
                className="w-full px-4 py-3 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">
                START PREP SESSION ({filtered.length} QUESTIONS)
              </button>
            </div>
          </Card>

          <Card hover={false}>
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-4">QUESTION BANK PREVIEW</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filtered.map((q, i) => (
                <div key={i} className="p-2 rounded-lg border border-[rgba(0,245,255,0.05)] hover:bg-[rgba(0,245,255,0.03)] transition-colors">
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-neon-purple/10 text-neon-purple border border-neon-purple/20">{q.category}</span>
                  <p className="text-xs font-mono text-foreground mt-1">{q.q}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {targetDate && (
          <Card hover={false}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted">TIME UNTIL INTERVIEW</span>
              <CountdownTimer target={new Date(targetDate)} color="#FF2D55" />
            </div>
          </Card>
        )}
      </AnimatedContainer>
    );
  }

  if (mode === "active" && currentQ) {
    return (
      <AnimatedContainer className="space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">
            QUESTION {currentIdx + 1} / {filtered.length}
          </GlowText>
          <div className="flex items-center gap-4">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neon-purple/10 text-neon-purple border border-neon-purple/20">{currentQ.category}</span>
            <CountdownTimer target={new Date(Date.now() + duration * 60000)} color={timeUp ? "#FF2D55" : "#00F5FF"} />
          </div>
        </div>

        <div className="w-full h-1 bg-[rgba(0,245,255,0.08)] rounded-full overflow-hidden">
          <div className="h-full bg-neon-cyan/50 transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>

        {/* Question */}
        <Card hover={false} className="border-neon-cyan/20">
          <h3 className="text-lg font-mono font-bold text-foreground mb-2">{currentQ.q}</h3>
          <p className="text-xs font-mono text-muted">TIP: {currentQ.tip}</p>
        </Card>

        {/* Answer area */}
        <Card hover={false}>
          <textarea
            ref={textareaRef}
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here... Practice speaking it out loud too."
            className="w-full h-48 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted/30 resize-none outline-none focus:border-neon-cyan/30 transition-colors"
          />
          <div className="flex gap-3 mt-3">
            <button onClick={nextQuestion}
              className="flex-1 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">
              {currentIdx + 1 >= filtered.length ? "FINISH SESSION" : "NEXT QUESTION →"}
            </button>
            <button onClick={skipQuestion}
              className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground transition-colors">SKIP</button>
          </div>
        </Card>
      </AnimatedContainer>
    );
  }

  // Review mode
  return (
    <AnimatedContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">SESSION REVIEW</GlowText>
        <button onClick={() => setMode("setup")}
          className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-xs text-neon-cyan hover:bg-neon-cyan/30 transition-colors">NEW SESSION</button>
      </div>

      <div className="space-y-3">
        {filtered.map((q, i) => (
          <Card key={i} hover={false}>
            <div className="flex items-start justify-between mb-2">
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-neon-purple/10 text-neon-purple border border-neon-purple/20">{q.category}</span>
              <span className={`text-[10px] font-mono ${answers[i] ? "text-neon-green" : "text-neon-red"}`}>{answers[i] ? "ANSWERED" : "SKIPPED"}</span>
            </div>
            <p className="text-sm font-mono font-semibold text-foreground mb-1">{q.q}</p>
            {answers[i] ? (
              <p className="text-xs font-mono text-foreground/60 mt-2 p-2 rounded bg-[rgba(0,245,255,0.03)] border border-[rgba(0,245,255,0.05)]">{answers[i]}</p>
            ) : (
              <p className="text-xs font-mono text-muted italic mt-2">TIP: {q.tip}</p>
            )}
          </Card>
        ))}
      </div>
    </AnimatedContainer>
  );
}
