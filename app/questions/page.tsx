"use client";

import { useEffect, useState, useRef } from "react";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import ScoreRing from "@/components/ScoreRing";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import ElectricBorder from "@/components/ElectricBorder";

interface Question {
  id: number; question: string; answer: string; category: string; difficulty: string; company: string; tags: string; role_id: number; times_practiced: number;
}

interface ModelConfig {
  id: number; provider: string; model_name: string; is_default: number;
}

interface InterviewRole {
  id: number; name: string; company: string; description: string; color: string;
}

const CATEGORIES = ["TECHNICAL", "BEHAVIORAL", "SYSTEM DESIGN", "ALGORITHMS"];
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];
const CAT_COLORS: Record<string, string> = { TECHNICAL: "#00F5FF", BEHAVIORAL: "#BF00FF", "SYSTEM DESIGN": "#FFD700", ALGORITHMS: "#00FF88" };
const DIFF_COLORS: Record<string, string> = { EASY: "#00FF88", MEDIUM: "#FFD700", HARD: "#FF2D55" };

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterRole, setFilterRole] = useState<number | null>(null);
  const [roles, setRoles] = useState<InterviewRole[]>([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: "", company: "", description: "", color: "#00F5FF" });
  const [mode, setMode] = useState<"list" | "quiz">("list");
  const [quizQuestion, setQuizQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [answerRating, setAnswerRating] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ question: "", answer: "", category: "TECHNICAL", difficulty: "MEDIUM", company: "", tags: "", role_id: 0 });

  // AI Model state
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  // Voice recording state
  const [recordingField, setRecordingField] = useState<"question" | "answer" | null>(null);
  const recognitionRef = useRef<any>(null);

  // AI generate state
  const [generateTopic, setGenerateTopic] = useState("");
  const [generateCategory, setGenerateCategory] = useState("TECHNICAL");
  const [generateDifficulty, setGenerateDifficulty] = useState("MEDIUM");
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [showGeneratePanel, setShowGeneratePanel] = useState(false);

  useEffect(() => {
    fetchQuestions();
    fetchRoles();
    fetch("/api/settings").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setModels(data);
    });
  }, [filterRole]);

  async function fetchQuestions() {
    const url = filterRole ? `/api/questions?role_id=${filterRole}` : "/api/questions";
    const res = await fetch(url); const data = await res.json(); setQuestions(Array.isArray(data) ? data : []);
  }

  async function fetchRoles() {
    const res = await fetch("/api/interview-roles"); const data = await res.json(); if (Array.isArray(data)) setRoles(data);
  }

  async function handleAddRole() {
    if (!roleForm.name.trim()) return;
    await fetch("/api/interview-roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(roleForm) });
    setRoleForm({ name: "", company: "", description: "", color: "#00F5FF" });
    setShowRoleModal(false);
    fetchRoles();
  }

  async function handleDeleteRole(id: number) {
    if (!confirm("Delete this role? Questions linked to it will keep their data.")) return;
    await fetch(`/api/interview-roles?id=${id}`, { method: "DELETE" });
    if (filterRole === id) setFilterRole(null);
    fetchRoles();
  }

  function getModelParam() {
    if (!selectedModel) return undefined;
    const [provider, ...parts] = selectedModel.split("/");
    const modelName = parts.join("/");
    const config = models.find((m) => m.provider === provider && m.model_name === modelName);
    return config ? { provider: config.provider, model_name: config.model_name } : undefined;
  }

  // Voice recognition
  function startVoice(field: "question" | "answer") {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech recognition not supported in this browser"); return; }

    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
    };

    recognition.onend = () => {
      setRecordingField(null);
      if (finalTranscript.trim()) {
        if (field === "question") {
          setForm((prev) => ({ ...prev, question: prev.question ? `${prev.question} ${finalTranscript.trim()}` : finalTranscript.trim() }));
        } else {
          if (mode === "quiz") {
            setUserAnswer((prev) => prev ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim());
          } else {
            setForm((prev) => ({ ...prev, answer: prev.answer ? `${prev.answer} ${finalTranscript.trim()}` : finalTranscript.trim() }));
          }
        }
      }
    };

    recognition.onerror = () => setRecordingField(null);
    recognitionRef.current = recognition;
    recognition.start();
    setRecordingField(field);
  }

  function stopVoice() {
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    setRecordingField(null);
  }

  // AI Generate Answer for a question
  async function generateAnswer(questionText: string): Promise<string> {
    setAiGenerating(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_question_answer",
          payload: { question: questionText, model: getModelParam() },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.answer || "";
    } catch (e: any) {
      setError(e.message);
      return "";
    } finally {
      setAiGenerating(false);
    }
  }

  // AI Generate Questions from topic
  async function handleGenerateQuestions() {
    if (!generateTopic.trim()) return;
    setAiGenerating(true); setError(""); setGeneratedQuestions([]);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_questions",
          payload: {
            topic: generateTopic,
            category: generateCategory,
            difficulty: generateDifficulty,
            count: 5,
            model: getModelParam(),
          },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedQuestions(data.questions || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAiGenerating(false);
    }
  }

  // Save a generated question to the bank
  async function saveGeneratedQuestion(q: any) {
    await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: q.question,
        answer: q.answer || "",
        category: q.category || generateCategory,
        difficulty: q.difficulty || generateDifficulty,
        company: "",
        tags: generateTopic,
        times_practiced: 0,
      }),
    });
    fetchQuestions();
  }

  function handleOpenModal(q?: Question) {
    if (q) {
      setEditingQ(q); setForm({ question: q.question, answer: q.answer, category: q.category, difficulty: q.difficulty, company: q.company, tags: q.tags, role_id: q.role_id || 0 });
    } else {
      setEditingQ(null); setForm({ question: "", answer: "", category: "TECHNICAL", difficulty: "MEDIUM", company: "", tags: "", role_id: filterRole || 0 });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!form.question.trim()) return;
    if (editingQ) {
      await fetch("/api/questions", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingQ.id, ...form, times_practiced: editingQ.times_practiced }) });
    } else {
      await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, times_practiced: 0 }) });
    }
    setIsModalOpen(false); fetchQuestions();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this question?")) return;
    await fetch(`/api/questions?id=${id}`, { method: "DELETE" }); fetchQuestions();
  }

  function startQuiz() {
    const least = [...questions].sort((a, b) => a.times_practiced - b.times_practiced);
    const pick = least[Math.floor(Math.random() * Math.min(5, least.length))];
    setQuizQuestion(pick || null); setUserAnswer(""); setAnswerRating(null); setMode("quiz");
  }

  async function submitQuizAnswer() {
    if (!quizQuestion || !userAnswer.trim()) return;
    setLoading(true); setError(""); setAnswerRating(null);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rate_answer",
          payload: { question: quizQuestion.question, answer: userAnswer, model: getModelParam() },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnswerRating(data);
      await fetch(`/api/questions?id=${quizQuestion.id}`, { method: "PATCH" });
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  const filtered = filterCategory ? questions.filter((q) => q.category === filterCategory) : questions;
  const roleName = filterRole ? roles.find(r => r.id === filterRole)?.name : null;

  // Voice button component
  function VoiceButton({ field }: { field: "question" | "answer" }) {
    const isRecording = recordingField === field;
    return (
      <button
        onClick={isRecording ? stopVoice : () => startVoice(field)}
        className={`p-1.5 rounded transition-colors ${isRecording ? "bg-neon-red/20 border border-neon-red/30 text-neon-red" : "text-muted hover:text-foreground hover:bg-[rgba(0,245,255,0.05)]"}`}
        title={isRecording ? "Stop recording" : "Voice input"}
      >
        {isRecording ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
        )}
      </button>
    );
  }

  return (
    <>
      <AnimatedContainer>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">
              {roleName ? `${roleName} — ${questions.length} QUESTION${questions.length !== 1 ? "S" : ""}` : `${questions.length} QUESTION${questions.length !== 1 ? "S" : ""}`}
            </GlowText>
            {filterRole && (
              <button onClick={() => setFilterRole(null)} className="px-2 py-0.5 rounded text-[10px] font-mono text-muted hover:text-foreground border border-[rgba(0,245,255,0.1)]">CLEAR FILTER</button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-2 py-1.5 text-[11px] font-mono text-foreground focus:border-neon-cyan/50 transition-colors cursor-pointer">
              <option value="">Default Model</option>
              {models.map((m) => (
                <option key={m.id} value={`${m.provider}/${m.model_name}`}>{m.provider}/{m.model_name}</option>
              ))}
            </select>
            <button onClick={() => setShowRoleModal(true)} className="px-3 py-1.5 bg-neon-green/10 border border-neon-green/20 rounded-lg font-mono text-xs text-neon-green hover:bg-neon-green/20 transition-colors">MANAGE ROLES</button>
            <button onClick={() => setShowGeneratePanel(!showGeneratePanel)} className="px-3 py-1.5 bg-neon-purple/20 border border-neon-purple/30 rounded-lg font-mono text-xs text-neon-purple hover:bg-neon-purple/30 transition-colors">AI GENERATE</button>
            <button onClick={startQuiz} disabled={questions.length === 0} className="px-3 py-1.5 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-xs text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50">QUIZ</button>
            <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
              <button onClick={() => handleOpenModal()} className="px-3 py-1.5 bg-[rgba(0,245,255,0.1)] border border-[rgba(0,245,255,0.2)] rounded-lg font-mono text-xs text-neon-cyan hover:bg-[rgba(0,245,255,0.15)] transition-colors">+ ADD</button>
            </ElectricBorder>
          </div>
        </div>

        {/* AI Generate Panel */}
        {showGeneratePanel && (
          <Card hover={false} className="mb-4 border-neon-purple/20">
            <h3 className="text-sm font-mono text-neon-purple/70 mb-3">AI QUESTION GENERATOR</h3>
            <div className="flex gap-3 mb-3">
              <input value={generateTopic} onChange={(e) => setGenerateTopic(e.target.value)} placeholder="Topic (e.g., AWS networking, Kubernetes, Python)..."
                className="flex-1 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" onKeyDown={(e) => e.key === "Enter" && handleGenerateQuestions()} />
              <select value={generateCategory} onChange={(e) => setGenerateCategory(e.target.value)}
                className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-2 py-2 text-xs font-mono text-foreground">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={generateDifficulty} onChange={(e) => setGenerateDifficulty(e.target.value)}
                className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-2 py-2 text-xs font-mono text-foreground">
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <button onClick={handleGenerateQuestions} disabled={aiGenerating || !generateTopic.trim()}
                className="px-4 py-2 bg-neon-purple/20 border border-neon-purple/30 rounded-lg font-mono text-sm text-neon-purple hover:bg-neon-purple/30 transition-colors disabled:opacity-50">
                {aiGenerating ? "GENERATING..." : "GENERATE"}
              </button>
            </div>

            {generatedQuestions.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-xs font-mono text-muted">Generated {generatedQuestions.length} questions — click SAVE to add to your bank:</p>
                {generatedQuestions.map((q, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(0,245,255,0.02)] border border-[rgba(0,245,255,0.08)]">
                    <div className="flex-1">
                      <p className="text-sm font-mono text-foreground">{q.question}</p>
                      {q.answer && <p className="text-xs font-mono text-foreground/50 mt-1">A: {q.answer}</p>}
                    </div>
                    <button onClick={() => saveGeneratedQuestion(q)}
                      className="px-3 py-1 bg-neon-green/10 border border-neon-green/20 rounded text-xs font-mono text-neon-green hover:bg-neon-green/20 flex-shrink-0">SAVE</button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Quiz Mode */}
        {mode === "quiz" && quizQuestion && (
          <Card hover={false} className="mb-6 border-neon-purple/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-mono text-neon-purple/70">QUIZ MODE</h3>
              <div className="flex items-center gap-3">
                <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded px-2 py-1 text-[10px] font-mono text-foreground cursor-pointer">
                  <option value="">Default</option>
                  {models.map((m) => <option key={m.id} value={`${m.provider}/${m.model_name}`}>{m.provider}/{m.model_name}</option>)}
                </select>
                <button onClick={() => setMode("list")} className="text-xs font-mono text-muted hover:text-foreground">EXIT</button>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ color: CAT_COLORS[quizQuestion.category], backgroundColor: `${CAT_COLORS[quizQuestion.category]}15`, border: `1px solid ${CAT_COLORS[quizQuestion.category]}30` }}>{quizQuestion.category}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ color: DIFF_COLORS[quizQuestion.difficulty], backgroundColor: `${DIFF_COLORS[quizQuestion.difficulty]}15`, border: `1px solid ${DIFF_COLORS[quizQuestion.difficulty]}30` }}>{quizQuestion.difficulty}</span>
              {quizQuestion.company && <span className="text-[10px] font-mono text-muted">{quizQuestion.company}</span>}
            </div>
            <p className="text-sm font-mono text-foreground mb-4">{quizQuestion.question}</p>

            {/* Answer input with voice */}
            <div className="relative mb-4">
              <textarea value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Type your answer or use voice..." rows={4}
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 pr-10 text-sm font-mono text-foreground placeholder:text-muted" />
              <div className="absolute top-2 right-2">
                <VoiceButton field="answer" />
              </div>
            </div>

            {recordingField === "answer" && (
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-neon-red animate-pulse" />
                <span className="text-[11px] font-mono text-neon-red">Recording... speak your answer</span>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={submitQuizAnswer} disabled={loading || !userAnswer.trim()} className="px-6 py-2 bg-neon-green/20 border border-neon-green/30 rounded-lg font-mono text-sm text-neon-green hover:bg-neon-green/30 transition-colors disabled:opacity-50">{loading ? "RATING..." : "SUBMIT"}</button>
              <button onClick={startQuiz} className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground">NEXT →</button>
              <button onClick={async () => {
                const answer = await generateAnswer(quizQuestion.question);
                if (answer) setUserAnswer(answer);
              }} disabled={aiGenerating} className="px-4 py-2 bg-neon-purple/10 border border-neon-purple/20 rounded-lg font-mono text-sm text-neon-purple hover:bg-neon-purple/20 transition-colors disabled:opacity-50">
                {aiGenerating ? "..." : "AI ANSWER"}
              </button>
            </div>

            {answerRating && (
              <div className="mt-4 p-4 rounded-lg bg-[rgba(0,255,136,0.03)] border border-[rgba(0,255,136,0.1)]">
                <div className="flex items-center gap-3 mb-2"><ScoreRing score={answerRating.score} /><span className="text-sm font-mono text-neon-green">Score: {answerRating.score}/100</span></div>
                <p className="text-xs font-mono text-foreground/70 whitespace-pre-wrap">{answerRating.feedback}</p>
              </div>
            )}
            {error && <p className="text-sm font-mono text-neon-red mt-2">{error}</p>}
          </Card>
        )}

        {/* Filter + List */}
        {mode === "list" && (
          <>
            {/* Role filter */}
            {roles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => setFilterRole(null)} className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${!filterRole ? "bg-neon-green/10 text-neon-green border border-neon-green/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>ALL ROLES</button>
                {roles.map((r) => (
                  <button key={r.id} onClick={() => setFilterRole(r.id)} className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${filterRole === r.id ? "border border-opacity-30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}
                    style={filterRole === r.id ? { color: r.color, backgroundColor: `${r.color}15`, borderColor: `${r.color}30` } : {}}>
                    {r.name}{r.company ? ` @ ${r.company}` : ""}
                  </button>
                ))}
              </div>
            )}

            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={() => setFilterCategory("")} className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${!filterCategory ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>ALL</button>
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setFilterCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${filterCategory === c ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>{c}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((q) => (
                <AnimatedItem key={q.id}>
                  <Card>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ color: CAT_COLORS[q.category], backgroundColor: `${CAT_COLORS[q.category]}15`, border: `1px solid ${CAT_COLORS[q.category]}30` }}>{q.category}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ color: DIFF_COLORS[q.difficulty], backgroundColor: `${DIFF_COLORS[q.difficulty]}15`, border: `1px solid ${DIFF_COLORS[q.difficulty]}30` }}>{q.difficulty}</span>
                        {q.role_id > 0 && roles.find(r => r.id === q.role_id) && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ color: roles.find(r => r.id === q.role_id)!.color, backgroundColor: `${roles.find(r => r.id === q.role_id)!.color}15`, border: `1px solid ${roles.find(r => r.id === q.role_id)!.color}30` }}>
                            {roles.find(r => r.id === q.role_id)!.name}
                          </span>
                        )}
                        {q.company && <span className="text-[10px] font-mono text-muted">{q.company}</span>}
                      </div>
                      <p className="text-sm font-mono text-foreground line-clamp-2">{q.question}</p>
                      {q.answer && <p className="text-xs font-mono text-foreground/50 line-clamp-1">A: {q.answer}</p>}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-muted">Practiced: {q.times_practiced}x</span>
                        <div className="flex gap-2">
                          <button onClick={async () => {
                            const answer = await generateAnswer(q.question);
                            if (answer) {
                              await fetch("/api/questions", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: q.id, question: q.question, answer, category: q.category, difficulty: q.difficulty, company: q.company, tags: q.tags, times_practiced: q.times_practiced }) });
                              fetchQuestions();
                            }
                          }} disabled={aiGenerating} className="px-2 py-1 bg-neon-purple/10 border border-neon-purple/20 rounded text-[10px] font-mono text-neon-purple hover:bg-neon-purple/20 transition-colors disabled:opacity-50">AI</button>
                          <button onClick={() => handleOpenModal(q)} className="px-2 py-1 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] rounded text-[10px] font-mono text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)] transition-colors">EDIT</button>
                          <button onClick={() => handleDelete(q.id)} className="px-2 py-1 bg-[rgba(255,45,85,0.05)] border border-[rgba(255,45,85,0.1)] rounded text-[10px] font-mono text-muted hover:text-neon-red hover:border-[rgba(255,45,85,0.2)] transition-colors">DEL</button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </AnimatedItem>
              ))}
            </div>
            {filtered.length === 0 && <Card hover={false}><p className="text-sm font-mono text-muted text-center">No questions yet</p></Card>}
          </>
        )}
      </AnimatedContainer>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingQ ? "EDIT QUESTION" : "ADD QUESTION"}>
        <div className="space-y-4">
          {/* Question with voice + AI */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono text-muted">Question</label>
              <div className="flex items-center gap-1">
                <VoiceButton field="question" />
                <button onClick={async () => {
                  const answer = await generateAnswer(form.question);
                  if (answer) setForm({ ...form, answer });
                }} disabled={aiGenerating || !form.question.trim()} className="p-1.5 rounded text-neon-purple hover:bg-neon-purple/10 transition-colors disabled:opacity-50" title="AI generate answer">
                  <span className="text-[10px] font-mono">AI</span>
                </button>
              </div>
            </div>
            <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} rows={3}
              className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
          </div>

          {/* Answer with voice */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono text-muted">Answer / Expected Answer</label>
              <VoiceButton field="answer" />
            </div>
            <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={3}
              className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
          </div>

          {recordingField && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-red animate-pulse" />
              <span className="text-[11px] font-mono text-neon-red">Recording {recordingField}...</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-muted mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, category: c })}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
                  style={form.category === c ? { color: CAT_COLORS[c], backgroundColor: `${CAT_COLORS[c]}15`, border: `1px solid ${CAT_COLORS[c]}30` } : { border: "1px solid rgba(0,245,255,0.08)", color: "#4A6274" }}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Difficulty</label>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((d) => (
                <button key={d} type="button" onClick={() => setForm({ ...form, difficulty: d })}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
                  style={form.difficulty === d ? { color: DIFF_COLORS[d], backgroundColor: `${DIFF_COLORS[d]}15`, border: `1px solid ${DIFF_COLORS[d]}30` } : { border: "1px solid rgba(0,245,255,0.08)", color: "#4A6274" }}>{d}</button>
              ))}
            </div>
          </div>
          {roles.length > 0 && (
            <div>
              <label className="block text-xs font-mono text-muted mb-2">Interview Role (optional)</label>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setForm({ ...form, role_id: 0 })}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
                  style={form.role_id === 0 ? { color: "#00F5FF", backgroundColor: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.3)" } : { border: "1px solid rgba(0,245,255,0.08)", color: "#4A6274" }}>NONE</button>
                {roles.map((r) => (
                  <button key={r.id} type="button" onClick={() => setForm({ ...form, role_id: r.id })}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
                    style={form.role_id === r.id ? { color: r.color, backgroundColor: `${r.color}15`, border: `1px solid ${r.color}30` } : { border: "1px solid rgba(0,245,255,0.08)", color: "#4A6274" }}>
                    {r.name}{r.company ? ` @ ${r.company}` : ""}
                  </button>
                ))}
              </div>
            </div>
          )}
          <FormField label="Company (optional)" name="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <FormField label="Tags (comma-separated)" name="tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="aws, networking, linux" />
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">{editingQ ? "UPDATE" : "CREATE"}</button>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground transition-colors">CANCEL</button>
          </div>
        </div>
      </Modal>

      {/* Role Management Modal */}
      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title="INTERVIEW ROLES">
        <div className="space-y-4">
          <p className="text-xs font-mono text-muted">Add the jobs you're interviewing for. Link questions to roles to filter them later.</p>

          {/* Existing roles */}
          {roles.length > 0 && (
            <div className="space-y-2">
              {roles.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-[rgba(0,245,255,0.1)]">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                    <div>
                      <p className="text-sm font-mono text-foreground">{r.name}</p>
                      {r.company && <p className="text-[10px] font-mono text-muted">{r.company}</p>}
                      {r.description && <p className="text-[10px] font-mono text-muted">{r.description}</p>}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteRole(r.id)} className="p-1.5 rounded text-muted hover:text-neon-red hover:bg-[rgba(255,45,85,0.1)] transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add role form */}
          <div className="space-y-3 pt-2 border-t border-[rgba(0,245,255,0.1)]">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-mono text-muted mb-1">Role Name</label>
                <input value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} placeholder="e.g. ML Infrastructure Engineer"
                  className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
              </div>
              <div className="w-32">
                <label className="block text-xs font-mono text-muted mb-1">Company</label>
                <input value={roleForm.company} onChange={(e) => setRoleForm({ ...roleForm, company: e.target.value })} placeholder="Google..."
                  className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
              </div>
              <div className="w-20">
                <label className="block text-xs font-mono text-muted mb-1">Color</label>
                <input type="color" value={roleForm.color} onChange={(e) => setRoleForm({ ...roleForm, color: e.target.value })}
                  className="w-full h-[38px] bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-1">Description (optional)</label>
              <input value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} placeholder="Brief description..."
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
            </div>
            <ElectricBorder color="#00FF88" speed={1} chaos={0.12} borderRadius={10}>
              <button onClick={handleAddRole} disabled={!roleForm.name.trim()}
                className="w-full px-4 py-2 bg-neon-green/10 border border-neon-green/20 rounded-lg font-mono text-sm text-neon-green hover:bg-neon-green/20 transition-colors disabled:opacity-50">+ ADD ROLE</button>
            </ElectricBorder>
          </div>
        </div>
      </Modal>
    </>
  );
}
