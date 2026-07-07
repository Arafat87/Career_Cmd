"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";
import ScoreRing from "@/components/ScoreRing";
import ThinkingIndicator from "@/components/ThinkingIndicator";
import SkillTag from "@/components/SkillTag";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import ChatWindow from "@/components/ChatWindow";
import { fetchArray } from "@/lib/fetch-helpers";

type Tab = "projects" | "resume" | "skills" | "chat" | "interview" | "cover_letter" | "job_match" | "company" | "cert_roadmap" | "weekly_report" | "system_design" | "career_goals" | "pitch_builder" | "job_board_scan" | "weekly_goals" | "mcp";

interface ProjectIdea {
  name: string;
  description: string;
  technologies: string[];
  category: string;
  estimated_timeline: string;
  selected?: boolean;
}

interface ResumeAnalysis {
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  partial_matches: string[];
  feedback: string;
}

interface DetectedSkill {
  name: string;
  category: string;
  proficiency: string;
}

interface Project {
  id: number;
  name: string;
  status: string;
  technologies: string;
  category: string;
}

export default function AssistantPage() {
  const [activeTab, setActiveTab] = useState<Tab>("projects");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Project Generator state
  const [jobDescription, setJobDescription] = useState("");
  const [projectIdeas, setProjectIdeas] = useState<ProjectIdea[]>([]);

  // Resume Scanner state
  const [resumeText, setResumeText] = useState("");
  const [resumeJD, setResumeJD] = useState("");
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);

  // Skill Detector state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [targetJobs, setTargetJobs] = useState("");
  const [detectedSkills, setDetectedSkills] = useState<DetectedSkill[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<{ covered: string[]; missing: string[] } | null>(null);

  // Interview Prep state
  const [interviewJobTitle, setInterviewJobTitle] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [answerRating, setAnswerRating] = useState<any>(null);
  const [jobTitlesList, setJobTitlesList] = useState<any[]>([]);

  // Cover Letter state
  const [coverLetterJD, setCoverLetterJD] = useState("");
  const [coverLetterResume, setCoverLetterResume] = useState("");
  const [coverLetterResult, setCoverLetterResult] = useState<any>(null);

  // Job Match state
  const [jobMatchPosting, setJobMatchPosting] = useState("");
  const [jobMatchResult, setJobMatchResult] = useState<any>(null);

  // Company Research state
  const [companyName, setCompanyName] = useState("");
  const [companyResult, setCompanyResult] = useState<any>(null);

  // Cert Roadmap state
  const [careerGoals, setCareerGoals] = useState("");
  const [roadmapItems, setRoadmapItems] = useState<any[]>([]);

  // Weekly Report state
  const [reportData, setReportData] = useState<any>(null);

  // System Design state
  const [systemDesignProblem, setSystemDesignProblem] = useState<any>(null);
  const [systemDesignAnswer, setSystemDesignAnswer] = useState("");
  const [systemDesignCritique, setSystemDesignCritique] = useState<any>(null);

  // Career Goals state
  const [careerGoalsInput, setCareerGoalsInput] = useState("");
  const [careerGoalsResult, setCareerGoalsResult] = useState<any>(null);

  // Pitch Builder state
  const [pitchResume, setPitchResume] = useState("");
  const [pitchResult, setPitchResult] = useState<any>(null);

  // Job Board Scanner state
  const [jobBoardText, setJobBoardText] = useState("");
  const [jobBoardResults, setJobBoardResults] = useState<any>(null);

  // Weekly Goals state
  const [weeklyGoalsResult, setWeeklyGoalsResult] = useState<any>(null);

  // MCP state
  const [mcpQuery, setMcpQuery] = useState("");
  const [mcpResult, setMcpResult] = useState<any>(null);

  useEffect(() => {
    fetchArray("/api/projects")
      .then((data) => setProjects(data as Project[]));
    fetchArray("/api/jobtitles")
      .then((data) => setJobTitlesList(data));
  }, []);

  async function handleGenerateProjects() {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setError("");
    setProjectIdeas([]);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_projects", payload: { jobDescription } }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProjectIdeas(data.projects.map((p: ProjectIdea) => ({ ...p, selected: false })));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleScanResume() {
    if (!resumeText.trim() || !resumeJD.trim()) return;
    setLoading(true);
    setError("");
    setResumeAnalysis(null);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scan_resume", payload: { resume: resumeText, jobDescription: resumeJD } }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResumeAnalysis(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDetectSkills() {
    if (selectedProjectIds.length === 0) return;
    setLoading(true);
    setError("");
    setDetectedSkills([]);
    setGapAnalysis(null);

    const selectedProjects = projects.filter((p) => selectedProjectIds.includes(p.id));

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "detect_skills", payload: { projects: selectedProjects, targetJobs } }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDetectedSkills(data.detected_skills);
      setGapAnalysis(data.gap_analysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleProjectSelection(index: number) {
    setProjectIdeas((prev) =>
      prev.map((p, i) => (i === index ? { ...p, selected: !p.selected } : p))
    );
  }

  async function handleAddSelectedProjects() {
    const selected = projectIdeas.filter((p) => p.selected);
    if (selected.length === 0) return;

    for (const idea of selected) {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: idea.name,
          status: "TODO",
          technologies: idea.technologies.join(", "),
          category: idea.category,
          deadline: "",
        }),
      });

      // Also add technologies to tech stack
      for (const tech of idea.technologies) {
        await fetch("/api/techstack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: tech,
            category: idea.category,
            proficiency_goal: "Intermediate",
          }),
        });
      }
    }

    setProjectIdeas((prev) => prev.filter((p) => !p.selected));
    alert(`Added ${selected.length} project(s) and their technologies!`);
  }

  async function handleAddDetectedSkills() {
    if (detectedSkills.length === 0) return;

    for (const skill of detectedSkills) {
      await fetch("/api/techstack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: skill.name,
          category: skill.category,
          proficiency_goal: skill.proficiency,
        }),
      });
    }

    alert(`Added ${detectedSkills.length} skill(s) to your tech stack!`);
  }

  const tabGroups = [
    {
      label: "GENERATOR",
      tabs: [
        { id: "projects" as Tab, label: "PROJECTS", icon: "◇" },
        { id: "resume" as Tab, label: "RESUME", icon: "◈" },
        { id: "skills" as Tab, label: "SKILLS", icon: "▣" },
        { id: "chat" as Tab, label: "CHAT", icon: "◉" },
      ],
    },
    {
      label: "JOB SEARCH",
      tabs: [
        { id: "job_match" as Tab, label: "MATCH", icon: "◎" },
        { id: "job_board_scan" as Tab, label: "SCANNER", icon: "🔍" },
        { id: "company" as Tab, label: "COMPANY", icon: "🏢" },
        { id: "cover_letter" as Tab, label: "COVER", icon: "✉" },
      ],
    },
    {
      label: "INTERVIEW",
      tabs: [
        { id: "interview" as Tab, label: "PREP", icon: "⚡" },
        { id: "system_design" as Tab, label: "SYS DESIGN", icon: "🏗" },
      ],
    },
    {
      label: "CAREER",
      tabs: [
        { id: "career_goals" as Tab, label: "GOALS", icon: "🎯" },
        { id: "cert_roadmap" as Tab, label: "CERTS", icon: "◈" },
        { id: "pitch_builder" as Tab, label: "PITCH", icon: "📢" },
      ],
    },
    {
      label: "REPORTS",
      tabs: [
        { id: "weekly_report" as Tab, label: "WEEKLY", icon: "📊" },
        { id: "weekly_goals" as Tab, label: "GOALS", icon: "📋" },
      ],
    },
    {
      label: "AUTOMATION",
      tabs: [
        { id: "mcp" as Tab, label: "MCP", icon: "⚡" },
      ],
    },
  ];

  return (
    <AnimatedContainer className="space-y-6">
      {/* Tab Navigation - Grouped Sidebar */}
      <div className="flex gap-2 flex-wrap">
        {tabGroups.map((group) => (
          <div key={group.label} className="flex items-center gap-1">
            <span className="text-[9px] font-mono text-muted/50 uppercase tracking-widest px-1.5">{group.label}</span>
            {group.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1.5 rounded-md font-mono text-[11px] transition-all ${
                  activeTab === tab.id
                    ? "bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan shadow-[0_0_8px_rgba(0,245,255,0.1)]"
                    : "border border-[rgba(0,245,255,0.08)] text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.15)]"
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
            <span className="w-px h-4 bg-[rgba(0,245,255,0.08)] mx-1" />
          </div>
        ))}
      </div>

      {error && (
        <Card hover={false} className="border-neon-red/20">
          <p className="text-sm font-mono text-neon-red">{error}</p>
        </Card>
      )}

      {/* Project Generator */}
      {activeTab === "projects" && (
        <AnimatedItem>
          <div className="space-y-4">
            <Card hover={false}>
              <h3 className="text-sm font-mono text-muted uppercase tracking-wider mb-3">
                GENERATE PROJECT IDEAS FROM JOB DESCRIPTION
              </h3>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste a job description here..."
                rows={6}
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted focus:border-neon-cyan/50 transition-colors"
              />
              <button
                onClick={handleGenerateProjects}
                disabled={loading || !jobDescription.trim()}
                className="mt-3 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "GENERATING..." : "GENERATE IDEAS"}
              </button>
            </Card>

            {loading && <ThinkingIndicator />}

            {projectIdeas.length > 0 && (
              <Card hover={false}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-mono text-muted uppercase tracking-wider">
                    GENERATED PROJECTS
                  </h3>
                  <button
                    onClick={handleAddSelectedProjects}
                    disabled={!projectIdeas.some((p) => p.selected)}
                    className="px-4 py-2 bg-neon-green/20 border border-neon-green/30 rounded-lg font-mono text-sm text-neon-green hover:bg-neon-green/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ADD SELECTED TO PROJECTS
                  </button>
                </div>
                <div className="space-y-3">
                  {projectIdeas.map((idea, i) => (
                    <div
                      key={i}
                      onClick={() => toggleProjectSelection(i)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        idea.selected
                          ? "bg-neon-cyan/10 border-neon-cyan/30"
                          : "bg-[rgba(0,245,255,0.02)] border-[rgba(0,245,255,0.08)] hover:border-[rgba(0,245,255,0.15)]"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-mono font-semibold text-foreground">
                            {idea.name}
                          </h4>
                          <p className="text-xs text-muted mt-1">{idea.description}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {idea.technologies.map((tech) => (
                              <SkillTag key={tech} name={tech} />
                            ))}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-neon-purple bg-[rgba(191,0,255,0.1)] border border-neon-purple/20">
                            {idea.category}
                          </span>
                          <p className="text-xs font-mono text-muted mt-1">
                            {idea.estimated_timeline}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </AnimatedItem>
      )}

      {/* Resume Scanner */}
      {activeTab === "resume" && (
        <AnimatedItem>
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card hover={false}>
                <h3 className="text-sm font-mono text-muted uppercase tracking-wider mb-3">
                  YOUR RESUME
                </h3>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  rows={10}
                  className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted focus:border-neon-cyan/50 transition-colors"
                />
              </Card>
              <Card hover={false}>
                <h3 className="text-sm font-mono text-muted uppercase tracking-wider mb-3">
                  JOB DESCRIPTION
                </h3>
                <textarea
                  value={resumeJD}
                  onChange={(e) => setResumeJD(e.target.value)}
                  placeholder="Paste the job description here..."
                  rows={10}
                  className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted focus:border-neon-cyan/50 transition-colors"
                />
              </Card>
            </div>
            <button
              onClick={handleScanResume}
              disabled={loading || !resumeText.trim() || !resumeJD.trim()}
              className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "SCANNING..." : "ANALYZE MATCH"}
            </button>

            {loading && <ThinkingIndicator />}

            {resumeAnalysis && (
              <Card hover={false}>
                <div className="flex items-start gap-8">
                  <div className="flex-shrink-0">
                    <ScoreRing score={resumeAnalysis.score} />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-xs font-mono text-muted uppercase tracking-wider mb-2">
                        MATCHED SKILLS
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {resumeAnalysis.matched_skills.map((skill) => (
                          <SkillTag key={skill} name={skill} category="Frontend" />
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-mono text-muted uppercase tracking-wider mb-2">
                        MISSING SKILLS
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {resumeAnalysis.missing_skills.map((skill) => (
                          <SkillTag key={skill} name={skill} category="Security" />
                        ))}
                      </div>
                    </div>
                    {resumeAnalysis.partial_matches.length > 0 && (
                      <div>
                        <h4 className="text-xs font-mono text-muted uppercase tracking-wider mb-2">
                          PARTIAL MATCHES
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeAnalysis.partial_matches.map((skill) => (
                            <SkillTag key={skill} name={skill} category="Backend" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[rgba(0,245,255,0.08)]">
                  <h4 className="text-xs font-mono text-muted uppercase tracking-wider mb-2">
                    FEEDBACK
                  </h4>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {resumeAnalysis.feedback}
                  </p>
                </div>
              </Card>
            )}
          </div>
        </AnimatedItem>
      )}

      {/* Chat */}
      {activeTab === "chat" && (
        <AnimatedItem>
          <ChatWindow />
        </AnimatedItem>
      )}

      {/* Interview Prep */}
      {activeTab === "interview" && (
        <AnimatedItem>
          <div className="space-y-4">
            {interviewQuestions.length === 0 ? (
              <Card hover={false}>
                <h3 className="text-sm font-mono text-neon-cyan/70 mb-4">SELECT A JOB TITLE</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {jobTitlesList.map((jt: any) => (
                    <button key={jt.id} onClick={() => setInterviewJobTitle(jt.title)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${interviewJobTitle === jt.title ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"}`}>
                      {jt.title}
                    </button>
                  ))}
                </div>
                <input value={interviewJobTitle} onChange={(e) => setInterviewJobTitle(e.target.value)} placeholder="Or type a custom job title..."
                  className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted mb-4" />
                <button onClick={async () => {
                  if (!interviewJobTitle.trim()) return;
                  setLoading(true); setError("");
                  try {
                    const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "interview_prep", payload: { jobTitle: interviewJobTitle } }) });
                    const data = await res.json();
                    if (data.error) throw new Error(data.error);
                    setInterviewQuestions(data.questions || []);
                    setCurrentQuestionIdx(0);
                  } catch (e: any) { setError(e.message); } finally { setLoading(false); }
                }} disabled={loading || !interviewJobTitle.trim()}
                  className="px-6 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50">
                  {loading ? "GENERATING..." : "GENERATE QUESTIONS"}
                </button>
              </Card>
            ) : (
              <Card hover={false}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-mono text-neon-cyan/70">QUESTION {currentQuestionIdx + 1}/{interviewQuestions.length}</h3>
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${interviewQuestions[currentQuestionIdx]?.type === "technical" ? "bg-neon-purple/10 text-neon-purple" : "bg-neon-yellow/10 text-neon-yellow"}`}>
                      {interviewQuestions[currentQuestionIdx]?.type}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[rgba(0,245,255,0.05)] text-muted">
                      {interviewQuestions[currentQuestionIdx]?.difficulty}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-mono text-foreground mb-4">{interviewQuestions[currentQuestionIdx]?.question}</p>
                <textarea value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Type your answer..." rows={4}
                  className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted mb-4" />
                <div className="flex gap-3">
                  <button onClick={async () => {
                    if (!userAnswer.trim()) return;
                    setLoading(true); setError("");
                    try {
                      const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "rate_answer", payload: { question: interviewQuestions[currentQuestionIdx]?.question, answer: userAnswer } }) });
                      const data = await res.json();
                      if (data.error) throw new Error(data.error);
                      setAnswerRating(data);
                    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
                  }} disabled={loading || !userAnswer.trim()}
                    className="px-6 py-2 bg-neon-green/20 border border-neon-green/30 rounded-lg font-mono text-sm text-neon-green hover:bg-neon-green/30 transition-colors disabled:opacity-50">
                    {loading ? "RATING..." : "SUBMIT ANSWER"}
                  </button>
                  <button onClick={() => { setCurrentQuestionIdx((i) => Math.min(i + 1, interviewQuestions.length - 1)); setUserAnswer(""); setAnswerRating(null); }}
                    className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground transition-colors">
                    NEXT →
                  </button>
                  <button onClick={() => { setInterviewQuestions([]); setAnswerRating(null); setUserAnswer(""); }}
                    className="px-4 py-2 border border-[rgba(255,45,85,0.1)] rounded-lg font-mono text-sm text-muted hover:text-neon-red transition-colors">
                    RESET
                  </button>
                </div>
                {answerRating && (
                  <div className="mt-4 p-4 rounded-lg bg-[rgba(0,255,136,0.03)] border border-[rgba(0,255,136,0.1)]">
                    <div className="flex items-center gap-3 mb-2">
                      <ScoreRing score={answerRating.score} />
                      <span className="text-sm font-mono text-neon-green">Score: {answerRating.score}/100</span>
                    </div>
                    <p className="text-xs font-mono text-foreground/70 whitespace-pre-wrap">{answerRating.feedback}</p>
                  </div>
                )}
              </Card>
            )}
            {error && <Card hover={false}><p className="text-sm font-mono text-neon-red">{error}</p></Card>}
          </div>
        </AnimatedItem>
      )}

      {/* Cover Letter */}
      {activeTab === "cover_letter" && (
        <AnimatedItem>
          <div className="space-y-4">
            <Card hover={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-mono text-muted mb-2">JOB DESCRIPTION</label>
                  <textarea value={coverLetterJD} onChange={(e) => setCoverLetterJD(e.target.value)} placeholder="Paste the job description..." rows={8}
                    className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted mb-2">YOUR RESUME</label>
                  <textarea value={coverLetterResume} onChange={(e) => setCoverLetterResume(e.target.value)} placeholder="Paste your resume text..." rows={8}
                    className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
                </div>
              </div>
              <button onClick={async () => {
                if (!coverLetterJD.trim() || !coverLetterResume.trim()) return;
                setLoading(true); setError(""); setCoverLetterResult(null);
                try {
                  const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cover_letter", payload: { jobDescription: coverLetterJD, resumeText: coverLetterResume } }) });
                  const data = await res.json();
                  if (data.error) throw new Error(data.error);
                  setCoverLetterResult(data);
                } catch (e: any) { setError(e.message); } finally { setLoading(false); }
              }} disabled={loading || !coverLetterJD.trim() || !coverLetterResume.trim()}
                className="px-6 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50">
                {loading ? "GENERATING..." : "GENERATE COVER LETTER"}
              </button>
            </Card>
            {coverLetterResult && (
              <Card hover={false}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-mono text-neon-cyan/70">COVER LETTER</h3>
                  <button onClick={() => navigator.clipboard.writeText(coverLetterResult.coverLetter)}
                    className="px-3 py-1 bg-neon-green/10 border border-neon-green/20 rounded text-xs font-mono text-neon-green hover:bg-neon-green/20 transition-colors">
                    COPY
                  </button>
                </div>
                <p className="text-xs font-mono text-foreground/80 whitespace-pre-wrap mb-4">{coverLetterResult.coverLetter}</p>
                {coverLetterResult.highlights?.length > 0 && (
                  <div>
                    <p className="text-xs font-mono text-muted mb-2">KEY HIGHLIGHTS:</p>
                    <ul className="space-y-1">
                      {coverLetterResult.highlights.map((h: string, i: number) => (
                        <li key={i} className="text-xs font-mono text-foreground/60">◇ {h}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}
            {error && <Card hover={false}><p className="text-sm font-mono text-neon-red">{error}</p></Card>}
          </div>
        </AnimatedItem>
      )}

      {/* Job Match */}
      {activeTab === "job_match" && (
        <AnimatedItem>
          <div className="space-y-4">
            <Card hover={false}>
              <label className="block text-xs font-mono text-muted mb-2">JOB POSTING</label>
              <textarea value={jobMatchPosting} onChange={(e) => setJobMatchPosting(e.target.value)} placeholder="Paste a job posting to score your match..." rows={6}
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted mb-4" />
              <button onClick={async () => {
                if (!jobMatchPosting.trim()) return;
                setLoading(true); setError(""); setJobMatchResult(null);
                try {
                  const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "job_match", payload: { jobPosting: jobMatchPosting } }) });
                  const data = await res.json();
                  if (data.error) throw new Error(data.error);
                  setJobMatchResult(data);
                } catch (e: any) { setError(e.message); } finally { setLoading(false); }
              }} disabled={loading || !jobMatchPosting.trim()}
                className="px-6 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50">
                {loading ? "SCORING..." : "SCORE MATCH"}
              </button>
            </Card>
            {jobMatchResult && (
              <Card hover={false}>
                <div className="flex items-center gap-4 mb-4">
                  <ScoreRing score={jobMatchResult.score} />
                  <div>
                    <h3 className="text-sm font-mono text-neon-cyan/70">MATCH SCORE</h3>
                    <p className="text-xs font-mono text-muted">Based on your profile</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-mono text-muted mb-2">MATCHED SKILLS</p>
                    <div className="flex flex-wrap gap-1">{jobMatchResult.matchedSkills?.map((s: string, i: number) => <SkillTag key={i} name={s} category="Frontend" />)}</div>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-muted mb-2">MISSING SKILLS</p>
                    <div className="flex flex-wrap gap-1">{jobMatchResult.missingSkills?.map((s: string, i: number) => <SkillTag key={i} name={s} category="Security" />)}</div>
                  </div>
                </div>
                <p className="text-xs font-mono text-foreground/70 mb-2"><span className="text-muted">SALARY:</span> {jobMatchResult.salaryAlignment}</p>
                <p className="text-xs font-mono text-foreground/70 whitespace-pre-wrap">{jobMatchResult.recommendation}</p>
              </Card>
            )}
            {error && <Card hover={false}><p className="text-sm font-mono text-neon-red">{error}</p></Card>}
          </div>
        </AnimatedItem>
      )}

      {/* Company Research */}
      {activeTab === "company" && (
        <AnimatedItem>
          <div className="space-y-4">
            <Card hover={false}>
              <div className="flex gap-3">
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Enter company name..." onKeyDown={(e) => e.key === "Enter" && document.getElementById("company-research-btn")?.click()}
                  className="flex-1 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
                <button id="company-research-btn" onClick={async () => {
                  if (!companyName.trim()) return;
                  setLoading(true); setError(""); setCompanyResult(null);
                  try {
                    const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "company_research", payload: { companyName } }) });
                    const data = await res.json();
                    if (data.error) throw new Error(data.error);
                    setCompanyResult(data);
                  } catch (e: any) { setError(e.message); } finally { setLoading(false); }
                }} disabled={loading || !companyName.trim()}
                  className="px-6 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50">
                  {loading ? "RESEARCHING..." : "RESEARCH"}
                </button>
              </div>
            </Card>
            {companyResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card hover={false}><h4 className="text-xs font-mono text-neon-cyan/70 mb-2">OVERVIEW</h4><p className="text-xs font-mono text-foreground/70 whitespace-pre-wrap">{companyResult.overview}</p></Card>
                <Card hover={false}><h4 className="text-xs font-mono text-neon-cyan/70 mb-2">TECH STACK</h4><div className="flex flex-wrap gap-1">{companyResult.techStack?.map((t: string, i: number) => <SkillTag key={i} name={t} category="Backend" />)}</div></Card>
                <Card hover={false}><h4 className="text-xs font-mono text-neon-cyan/70 mb-2">CULTURE</h4><p className="text-xs font-mono text-foreground/70 whitespace-pre-wrap">{companyResult.culture}</p></Card>
                <Card hover={false}><h4 className="text-xs font-mono text-neon-cyan/70 mb-2">INTERVIEW PROCESS</h4><p className="text-xs font-mono text-foreground/70 whitespace-pre-wrap">{companyResult.interviewProcess}</p></Card>
                <Card hover={false}><h4 className="text-xs font-mono text-neon-cyan/70 mb-2">SALARY RANGES</h4><p className="text-xs font-mono text-foreground/70 whitespace-pre-wrap">{companyResult.salaryRanges}</p></Card>
                <Card hover={false}><h4 className="text-xs font-mono text-neon-cyan/70 mb-2">RECENT NEWS</h4><ul className="space-y-1">{companyResult.recentNews?.map((n: string, i: number) => <li key={i} className="text-xs font-mono text-foreground/60">◇ {n}</li>)}</ul></Card>
              </div>
            )}
            {error && <Card hover={false}><p className="text-sm font-mono text-neon-red">{error}</p></Card>}
          </div>
        </AnimatedItem>
      )}

      {/* Cert Roadmap */}
      {activeTab === "cert_roadmap" && (
        <AnimatedItem>
          <div className="space-y-4">
            <Card hover={false}>
              <label className="block text-xs font-mono text-muted mb-2">YOUR CAREER GOALS</label>
              <textarea value={careerGoals} onChange={(e) => setCareerGoals(e.target.value)} placeholder="Describe your career goals (e.g., become a cloud architect, specialize in AI infrastructure)..." rows={4}
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted mb-4" />
              <button onClick={async () => {
                if (!careerGoals.trim()) return;
                setLoading(true); setError(""); setRoadmapItems([]);
                try {
                  const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cert_roadmap", payload: { careerGoals } }) });
                  const data = await res.json();
                  if (data.error) throw new Error(data.error);
                  setRoadmapItems(data.roadmap || []);
                } catch (e: any) { setError(e.message); } finally { setLoading(false); }
              }} disabled={loading || !careerGoals.trim()}
                className="px-6 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50">
                {loading ? "GENERATING..." : "GENERATE ROADMAP"}
              </button>
            </Card>
            {roadmapItems.length > 0 && (
              <div className="space-y-3">
                {roadmapItems.map((item, i) => {
                  const prioColor = item.priority === "high" ? "#FF2D55" : item.priority === "medium" ? "#FFD700" : "#00FF88";
                  return (
                    <Card key={i} hover={false}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-mono font-semibold text-foreground">{item.name}</h4>
                          <p className="text-[10px] font-mono text-muted">{item.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase" style={{ color: prioColor, backgroundColor: `${prioColor}15`, border: `1px solid ${prioColor}30` }}>
                            {item.priority}
                          </span>
                          <span className="text-[10px] font-mono text-muted">{item.timeline}</span>
                        </div>
                      </div>
                      <p className="text-xs font-mono text-foreground/70 mb-3">{item.reason}</p>
                      <button onClick={async () => {
                        await fetch("/api/certifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: item.name, category: item.category, status: "PLANNING" }) });
                        alert(`Added "${item.name}" to certifications!`);
                      }} className="px-3 py-1 bg-neon-green/10 border border-neon-green/20 rounded text-xs font-mono text-neon-green hover:bg-neon-green/20 transition-colors">
                        + ADD TO CERTIFICATIONS
                      </button>
                    </Card>
                  );
                })}
              </div>
            )}
            {error && <Card hover={false}><p className="text-sm font-mono text-neon-red">{error}</p></Card>}
          </div>
        </AnimatedItem>
      )}

      {/* Weekly Report */}
      {activeTab === "weekly_report" && (
        <AnimatedItem>
          <div className="space-y-4">
            <Card hover={false}>
              <button onClick={async () => {
                setLoading(true); setError(""); setReportData(null);
                try {
                  const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "weekly_report", payload: {} }) });
                  const data = await res.json();
                  if (data.error) throw new Error(data.error);
                  setReportData(data);
                } catch (e: any) { setError(e.message); } finally { setLoading(false); }
              }} disabled={loading}
                className="px-6 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50">
                {loading ? "GENERATING..." : "GENERATE REPORT"}
              </button>
            </Card>
            {reportData && (
              <div className="space-y-4">
                <Card hover={false}>
                  <h3 className="text-sm font-mono text-neon-cyan/70 mb-3">SUMMARY</h3>
                  <p className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">{reportData.summary}</p>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card hover={false}>
                    <p className="text-xs font-mono text-muted">NEW APPLICATIONS</p>
                    <p className="text-2xl font-mono font-bold text-neon-cyan mt-1">{reportData.newApplications || 0}</p>
                  </Card>
                  <Card hover={false}>
                    <p className="text-xs font-mono text-muted">CERT PROGRESS</p>
                    <p className="text-xs font-mono text-foreground/70 mt-1">{reportData.certProgress}</p>
                  </Card>
                  <Card hover={false}>
                    <p className="text-xs font-mono text-muted">PROJECT UPDATES</p>
                    <p className="text-xs font-mono text-foreground/70 mt-1">{reportData.projectUpdates}</p>
                  </Card>
                </div>
                {reportData.skillsAdded?.length > 0 && (
                  <Card hover={false}>
                    <h3 className="text-sm font-mono text-neon-cyan/70 mb-3">SKILLS ADDED</h3>
                    <div className="flex flex-wrap gap-1">{reportData.skillsAdded.map((s: string, i: number) => <SkillTag key={i} name={s} category="Backend" />)}</div>
                  </Card>
                )}
                {reportData.focusAreas?.length > 0 && (
                  <Card hover={false}>
                    <h3 className="text-sm font-mono text-neon-cyan/70 mb-3">FOCUS AREAS</h3>
                    <ol className="space-y-2">{reportData.focusAreas.map((f: string, i: number) => <li key={i} className="text-xs font-mono text-foreground/70"><span className="text-neon-cyan mr-2">{i + 1}.</span>{f}</li>)}</ol>
                  </Card>
                )}
              </div>
            )}
            {error && <Card hover={false}><p className="text-sm font-mono text-neon-red">{error}</p></Card>}
          </div>
        </AnimatedItem>
      )}

      {/* System Design */}
      {activeTab === "system_design" && (
        <AnimatedItem>
          <div className="space-y-4">
            {!systemDesignProblem ? (
              <Card hover={false}>
                <h3 className="text-sm font-mono text-neon-cyan/70 mb-4">MOCK SYSTEM DESIGN</h3>
                <div className="flex gap-3 mb-4">
                  <select onChange={(e) => setSystemDesignProblem({ _difficulty: e.target.value })} className="bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground">
                    <option value="medium">Medium Difficulty</option><option value="hard">Hard Difficulty</option><option value="easy">Easy Difficulty</option>
                  </select>
                </div>
                <button onClick={async () => {
                  setLoading(true); setError(""); setSystemDesignProblem(null); setSystemDesignCritique(null);
                  try {
                    const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "mock_system_design", payload: { difficulty: systemDesignProblem?._difficulty || "medium", focus: "cloud infrastructure" } }) });
                    const data = await res.json(); if (data.error) throw new Error(data.error); setSystemDesignProblem(data);
                  } catch (e: any) { setError(e.message); } finally { setLoading(false); }
                }} disabled={loading} className="px-6 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50">{loading ? "GENERATING..." : "GENERATE PROBLEM"}</button>
              </Card>
            ) : (
              <Card hover={false}>
                <h3 className="text-sm font-mono text-neon-cyan/70 mb-3">SYSTEM DESIGN PROBLEM</h3>
                <p className="text-sm font-mono text-foreground mb-3">{systemDesignProblem.problem}</p>
                {systemDesignProblem.requirements && (
                  <div className="mb-3"><p className="text-xs font-mono text-muted mb-1">REQUIREMENTS:</p><ul className="space-y-1">{systemDesignProblem.requirements.map((r: string, i: number) => <li key={i} className="text-xs font-mono text-foreground/60">• {r}</li>)}</ul></div>
                )}
                <textarea value={systemDesignAnswer} onChange={(e) => setSystemDesignAnswer(e.target.value)} placeholder="Describe your solution..." rows={6}
                  className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted mb-4" />
                <div className="flex gap-3">
                  <button onClick={async () => {
                    if (!systemDesignAnswer.trim()) return; setLoading(true); setError(""); setSystemDesignCritique(null);
                    try {
                      const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "mock_system_design", payload: { problem: systemDesignProblem.problem, solution: systemDesignAnswer } }) });
                      const data = await res.json(); if (data.error) throw new Error(data.error); setSystemDesignCritique(data);
                    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
                  }} disabled={loading || !systemDesignAnswer.trim()} className="px-6 py-2 bg-neon-green/20 border border-neon-green/30 rounded-lg font-mono text-sm text-neon-green hover:bg-neon-green/30 transition-colors disabled:opacity-50">{loading ? "EVALUATING..." : "SUBMIT SOLUTION"}</button>
                  <button onClick={() => { setSystemDesignProblem(null); setSystemDesignAnswer(""); setSystemDesignCritique(null); }} className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground">NEW PROBLEM</button>
                </div>
                {systemDesignCritique && (
                  <div className="mt-4 p-4 rounded-lg bg-[rgba(0,255,136,0.03)] border border-[rgba(0,255,136,0.1)]">
                    <div className="flex items-center gap-3 mb-3"><ScoreRing score={systemDesignCritique.score} /><span className="text-sm font-mono text-neon-green">Score: {systemDesignCritique.score}/100</span></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div><p className="text-xs font-mono text-neon-green mb-1">STRENGTHS</p><ul className="space-y-1">{systemDesignCritique.strengths?.map((s: string, i: number) => <li key={i} className="text-xs font-mono text-foreground/60">✓ {s}</li>)}</ul></div>
                      <div><p className="text-xs font-mono text-neon-red mb-1">WEAKNESSES</p><ul className="space-y-1">{systemDesignCritique.weaknesses?.map((w: string, i: number) => <li key={i} className="text-xs font-mono text-foreground/60">✗ {w}</li>)}</ul></div>
                    </div>
                    <p className="text-xs font-mono text-foreground/70 whitespace-pre-wrap">{systemDesignCritique.feedback}</p>
                  </div>
                )}
              </Card>
            )}
            {error && <Card hover={false}><p className="text-sm font-mono text-neon-red">{error}</p></Card>}
          </div>
        </AnimatedItem>
      )}

      {/* Career Goals */}
      {activeTab === "career_goals" && (
        <AnimatedItem>
          <div className="space-y-4">
            <Card hover={false}>
              <label className="block text-xs font-mono text-muted mb-2">YOUR CAREER GOALS</label>
              <textarea value={careerGoalsInput} onChange={(e) => setCareerGoalsInput(e.target.value)} placeholder="Describe your career goals (e.g., become a cloud architect, transition to AI infrastructure, get AWS certification)..." rows={4}
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted mb-4" />
              <button onClick={async () => {
                if (!careerGoalsInput.trim()) return; setLoading(true); setError(""); setCareerGoalsResult(null);
                try {
                  const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "career_goals", payload: { goals: careerGoalsInput } }) });
                  const data = await res.json(); if (data.error) throw new Error(data.error); setCareerGoalsResult(data);
                } catch (e: any) { setError(e.message); } finally { setLoading(false); }
              }} disabled={loading || !careerGoalsInput.trim()} className="px-6 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50">{loading ? "ANALYZING..." : "ANALYZE GOALS"}</button>
            </Card>
            {careerGoalsResult && (
              <div className="space-y-4">
                <Card hover={false}><h3 className="text-sm font-mono text-neon-cyan/70 mb-3">CURRENT ASSESSMENT</h3><p className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">{careerGoalsResult.currentAssessment}</p></Card>
                {careerGoalsResult.quarterlyMilestones?.length > 0 && (
                  <Card hover={false}><h3 className="text-sm font-mono text-neon-cyan/70 mb-3">QUARTERLY MILESTONES</h3>
                    <div className="space-y-3">{careerGoalsResult.quarterlyMilestones.map((m: any, i: number) => (
                      <div key={i}><p className="text-xs font-mono text-neon-purple mb-1">{m.quarter}</p><ul className="space-y-1">{m.goals?.map((g: string, j: number) => <li key={j} className="text-xs font-mono text-foreground/60">◇ {g}</li>)}</ul></div>
                    ))}</div>
                  </Card>
                )}
                {careerGoalsResult.actionItems?.length > 0 && (
                  <Card hover={false}><h3 className="text-sm font-mono text-neon-cyan/70 mb-3">ACTION ITEMS</h3><ol className="space-y-2">{careerGoalsResult.actionItems.map((a: string, i: number) => <li key={i} className="text-xs font-mono text-foreground/70"><span className="text-neon-cyan mr-2">{i + 1}.</span>{a}</li>)}</ol></Card>
                )}
              </div>
            )}
            {error && <Card hover={false}><p className="text-sm font-mono text-neon-red">{error}</p></Card>}
          </div>
        </AnimatedItem>
      )}

      {/* Pitch Builder */}
      {activeTab === "pitch_builder" && (
        <AnimatedItem>
          <div className="space-y-4">
            <Card hover={false}>
              <label className="block text-xs font-mono text-muted mb-2">YOUR BACKGROUND / RESUME</label>
              <textarea value={pitchResume} onChange={(e) => setPitchResume(e.target.value)} placeholder="Paste your resume or describe your background, skills, and experience..." rows={6}
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted mb-4" />
              <button onClick={async () => {
                if (!pitchResume.trim()) return; setLoading(true); setError(""); setPitchResult(null);
                try {
                  const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "pitch_builder", payload: { resume: pitchResume } }) });
                  const data = await res.json(); if (data.error) throw new Error(data.error); setPitchResult(data);
                } catch (e: any) { setError(e.message); } finally { setLoading(false); }
              }} disabled={loading || !pitchResume.trim()} className="px-6 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50">{loading ? "BUILDING..." : "BUILD PITCHES"}</button>
            </Card>
            {pitchResult && (
              <div className="space-y-4">
                <Card hover={false}>
                  <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-mono text-neon-cyan/70">ELEVATOR PITCH</h3>
                    <button onClick={() => navigator.clipboard.writeText(pitchResult.elevatorPitch)} className="px-3 py-1 bg-neon-green/10 border border-neon-green/20 rounded text-xs font-mono text-neon-green hover:bg-neon-green/20">COPY</button></div>
                  <p className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">{pitchResult.elevatorPitch}</p>
                </Card>
                <Card hover={false}>
                  <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-mono text-neon-cyan/70">BRAND STATEMENT</h3>
                    <button onClick={() => navigator.clipboard.writeText(pitchResult.brandStatement)} className="px-3 py-1 bg-neon-green/10 border border-neon-green/20 rounded text-xs font-mono text-neon-green hover:bg-neon-green/20">COPY</button></div>
                  <p className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">{pitchResult.brandStatement}</p>
                </Card>
                <Card hover={false}>
                  <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-mono text-neon-cyan/70">LINKEDIN SUMMARY</h3>
                    <button onClick={() => navigator.clipboard.writeText(pitchResult.linkedinSummary)} className="px-3 py-1 bg-neon-green/10 border border-neon-green/20 rounded text-xs font-mono text-neon-green hover:bg-neon-green/20">COPY</button></div>
                  <p className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">{pitchResult.linkedinSummary}</p>
                </Card>
              </div>
            )}
            {error && <Card hover={false}><p className="text-sm font-mono text-neon-red">{error}</p></Card>}
          </div>
        </AnimatedItem>
      )}

      {/* Job Board Scanner */}
      {activeTab === "job_board_scan" && (
        <AnimatedItem>
          <div className="space-y-4">
            <Card hover={false}>
              <label className="block text-xs font-mono text-muted mb-2">PASTE JOB LISTINGS</label>
              <textarea value={jobBoardText} onChange={(e) => setJobBoardText(e.target.value)} placeholder="Paste job board content here..." rows={8}
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted mb-4" />
              <button onClick={async () => {
                if (!jobBoardText.trim()) return; setLoading(true); setError(""); setJobBoardResults(null);
                try {
                  const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "job_board_scan", payload: { text: jobBoardText } }) });
                  const data = await res.json(); if (data.error) throw new Error(data.error); setJobBoardResults(data);
                } catch (e: any) { setError(e.message); } finally { setLoading(false); }
              }} disabled={loading || !jobBoardText.trim()} className="px-6 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50">{loading ? "SCANNING..." : "SCAN LISTINGS"}</button>
            </Card>
            {jobBoardResults && (
              <div className="space-y-4">
                {jobBoardResults.topPicks?.length > 0 && (
                  <Card hover={false}><h3 className="text-sm font-mono text-neon-cyan/70 mb-3">TOP PICKS</h3><ul className="space-y-1">{jobBoardResults.topPicks.map((p: string, i: number) => <li key={i} className="text-xs font-mono text-foreground/70">★ {p}</li>)}</ul></Card>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobBoardResults.listings?.map((l: any, i: number) => (
                    <Card key={i} hover={false}>
                      <div className="flex items-start justify-between mb-2">
                        <div><h4 className="text-sm font-mono font-semibold text-foreground">{l.title}</h4><p className="text-xs font-mono text-muted">{l.company} • {l.location}</p></div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${l.matchScore >= 70 ? "text-neon-green bg-neon-green/10" : l.matchScore >= 40 ? "text-neon-cyan bg-neon-cyan/10" : "text-neon-red bg-neon-red/10"}`}>{l.matchScore}%</span>
                      </div>
                      <p className="text-xs font-mono text-foreground/60 mb-3">{l.summary}</p>
                      <button onClick={async () => {
                        await fetch("/api/saved-jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: l.title, company: l.company, location: l.location, match_score: l.matchScore, description: l.summary, status: "BOOKMARKED" }) });
                      }} className="px-3 py-1 bg-neon-green/10 border border-neon-green/20 rounded text-xs font-mono text-neon-green hover:bg-neon-green/20">SAVE JOB</button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {error && <Card hover={false}><p className="text-sm font-mono text-neon-red">{error}</p></Card>}
          </div>
        </AnimatedItem>
      )}

      {/* Weekly Goals */}
      {activeTab === "weekly_goals" && (
        <AnimatedItem>
          <div className="space-y-4">
            <Card hover={false}>
              <button onClick={async () => {
                setLoading(true); setError(""); setWeeklyGoalsResult(null);
                try {
                  const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "weekly_goals", payload: {} }) });
                  const data = await res.json(); if (data.error) throw new Error(data.error); setWeeklyGoalsResult(data);
                } catch (e: any) { setError(e.message); } finally { setLoading(false); }
              }} disabled={loading} className="px-6 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50">{loading ? "GENERATING..." : "GENERATE WEEKLY GOALS"}</button>
            </Card>
            {weeklyGoalsResult && (
              <div className="space-y-4">
                <Card hover={false}><h3 className="text-sm font-mono text-neon-cyan/70 mb-3">THIS WEEK&apos;S GOALS</h3>
                  <div className="space-y-2">{weeklyGoalsResult.goals?.map((g: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-[rgba(0,245,255,0.02)] border border-[rgba(0,245,255,0.08)]">
                      <input type="checkbox" className="accent-neon-cyan" />
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${g.priority === "high" ? "text-neon-red bg-neon-red/10" : g.priority === "medium" ? "text-neon-yellow bg-neon-yellow/10" : "text-neon-green bg-neon-green/10"}`}>{g.priority}</span>
                      <span className="text-xs font-mono text-foreground/80 flex-1">{g.goal}</span>
                      <span className="text-[10px] font-mono text-muted">{g.category}</span>
                    </div>
                  ))}</div>
                </Card>
                {weeklyGoalsResult.focusAreas?.length > 0 && (
                  <Card hover={false}><h3 className="text-sm font-mono text-neon-cyan/70 mb-3">FOCUS AREAS</h3><ul className="space-y-1">{weeklyGoalsResult.focusAreas.map((f: string, i: number) => <li key={i} className="text-xs font-mono text-foreground/70">◇ {f}</li>)}</ul></Card>
                )}
                {weeklyGoalsResult.motivation && (
                  <Card hover={false}><p className="text-xs font-mono text-neon-green/70 italic">{weeklyGoalsResult.motivation}</p></Card>
                )}
              </div>
            )}
            {error && <Card hover={false}><p className="text-sm font-mono text-neon-red">{error}</p></Card>}
          </div>
        </AnimatedItem>
      )}

      {/* Skill Detector */}
      {activeTab === "skills" && (
        <AnimatedItem>
          <div className="space-y-4">
            <Card hover={false}>
              <h3 className="text-sm font-mono text-muted uppercase tracking-wider mb-3">
                SELECT PROJECTS TO ANALYZE
              </h3>
              {projects.length === 0 ? (
                <p className="text-sm font-mono text-muted py-4">
                  No projects found. Add projects first.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => {
                        setSelectedProjectIds((prev) =>
                          prev.includes(project.id)
                            ? prev.filter((id) => id !== project.id)
                            : [...prev, project.id]
                        );
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedProjectIds.includes(project.id)
                          ? "bg-neon-cyan/10 border-neon-cyan/30"
                          : "bg-[rgba(0,245,255,0.02)] border-[rgba(0,245,255,0.08)] hover:border-[rgba(0,245,255,0.15)]"
                      }`}
                    >
                      <p className="text-sm font-mono text-foreground">{project.name}</p>
                      <p className="text-xs font-mono text-muted">{project.category}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card hover={false}>
              <h3 className="text-sm font-mono text-muted uppercase tracking-wider mb-3">
                TARGET JOB TITLES (OPTIONAL)
              </h3>
              <input
                value={targetJobs}
                onChange={(e) => setTargetJobs(e.target.value)}
                placeholder="Senior Cloud Engineer, DevOps Lead..."
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted focus:border-neon-cyan/50 transition-colors"
              />
            </Card>

            <button
              onClick={handleDetectSkills}
              disabled={loading || selectedProjectIds.length === 0}
              className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "DETECTING..." : "DETECT SKILLS"}
            </button>

            {loading && <ThinkingIndicator />}

            {detectedSkills.length > 0 && (
              <Card hover={false}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-mono text-muted uppercase tracking-wider">
                    DETECTED SKILLS
                  </h3>
                  <button
                    onClick={handleAddDetectedSkills}
                    className="px-4 py-2 bg-neon-green/20 border border-neon-green/30 rounded-lg font-mono text-sm text-neon-green hover:bg-neon-green/30 transition-colors"
                  >
                    ADD ALL TO TECH STACK
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {detectedSkills.map((skill, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[rgba(0,245,255,0.02)] border border-[rgba(0,245,255,0.08)] rounded-lg"
                    >
                      <p className="text-sm font-mono font-semibold text-foreground">
                        {skill.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-muted">{skill.category}</span>
                        <span className="text-[10px] font-mono text-neon-cyan">{skill.proficiency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {gapAnalysis && (
              <Card hover={false}>
                <h3 className="text-sm font-mono text-muted uppercase tracking-wider mb-4">
                  GAP ANALYSIS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-mono text-neon-green mb-2">COVERED SKILLS</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {gapAnalysis.covered.map((skill) => (
                        <SkillTag key={skill} name={skill} category="Frontend" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-mono text-neon-red mb-2">MISSING SKILLS</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {gapAnalysis.missing.map((skill) => (
                        <SkillTag key={skill} name={skill} category="Security" />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </AnimatedItem>
      )}
      {/* MCP Tools */}
      {activeTab === "mcp" && (
        <AnimatedItem>
          <div className="space-y-4">
            <Card hover={false}>
              <p className="text-xs font-mono text-muted/70 mb-2">Describe what you want to do and the AI will call the right MCP tools automatically.</p>
              <textarea
                value={mcpQuery}
                onChange={(e) => setMcpQuery(e.target.value)}
                placeholder="e.g., Find remote DevOps jobs, research Google, show my career summary..."
                rows={3}
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted mb-4"
              />
              <button
                onClick={async () => {
                  if (!mcpQuery.trim()) return;
                  setLoading(true); setError(""); setMcpResult(null);
                  try {
                    const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "mcp_call", payload: { query: mcpQuery } }) });
                    const data = await res.json();
                    if (data.error) throw new Error(data.error);
                    setMcpResult(data);
                  } catch (e: any) { setError(e.message); } finally { setLoading(false); }
                }}
                disabled={loading || !mcpQuery.trim()}
                className="px-6 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50"
              >
                {loading ? "EXECUTING..." : "▶ RUN MCP"}
              </button>
            </Card>
            {mcpResult && (
              <Card hover={false}>
                <h3 className="text-xs font-mono text-neon-cyan/70 uppercase tracking-widest mb-3">MCP RESULT</h3>
                <pre className="text-xs font-mono text-foreground/70 bg-black/60 border border-[rgba(0,245,255,0.08)] rounded p-4 overflow-auto max-h-96 whitespace-pre-wrap break-all">
                  {JSON.stringify(mcpResult, null, 2)}
                </pre>
              </Card>
            )}
            {error && <Card hover={false}><p className="text-sm font-mono text-neon-red">{error}</p></Card>}
          </div>
        </AnimatedItem>
      )}
    </AnimatedContainer>
  );
}
