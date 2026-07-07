export interface Certification {
  id: number;
  name: string;
  category: string;
  image_url: string;
  price: number;
  expiration_date: string;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  status: "TODO" | "IN PROGRESS" | "DONE";
  technologies: string;
  category: string;
  deadline: string;
  created_at: string;
}

export interface TechStack {
  id: number;
  name: string;
  category: string;
  proficiency_goal: string;
  created_at: string;
}

export interface JobTitle {
  id: number;
  title: string;
  company: string;
  category: string;
  location: string;
  salary_min: number;
  salary_max: number;
  description: string;
  created_at: string;
}

export interface AssistantSession {
  id: number;
  type: "project_gen" | "resume_scan" | "skill_detect";
  input_text: string;
  result_json: string;
  score: number | null;
  model_used: string;
  created_at: string;
}

export interface ModelConfig {
  id: number;
  provider: "openai" | "anthropic" | "google" | "groq" | "custom";
  model_name: string;
  api_key: string;
  base_url: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  is_default: number;
  created_at: string;
}

export interface ProjectIdea {
  name: string;
  description: string;
  technologies: string[];
  category: string;
  estimated_timeline: string;
}

export interface ResumeAnalysis {
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  partial_matches: string[];
  feedback: string;
}

export interface SkillDetection {
  detected_skills: Array<{
    name: string;
    category: string;
    proficiency: string;
  }>;
  gap_analysis: {
    covered: string[];
    missing: string[];
  };
}

export interface ChatConversation {
  id: number;
  title: string;
  model_used: string;
  context_snapshot: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  attachments: string;
  message_type: "text" | "voice" | "search_result";
  model_used: string;
  created_at: string;
}

export interface ChatAttachment {
  type: "image" | "file";
  name: string;
  url: string;
  size: number;
}

export interface Application {
  id: number;
  company: string;
  position: string;
  status: "APPLIED" | "PHONE SCREEN" | "INTERVIEW" | "OFFER" | "REJECTED" | "WITHDRAWN";
  date_applied: string;
  location: string;
  salary_min: number;
  salary_max: number;
  notes: string;
  url: string;
  category: string;
  interview_date: string;
  created_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  color: string;
  pinned: number;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  date: string;
  title: string;
  source: "certification" | "project" | "reminder" | "application";
  color: string;
  sourceId: number;
}

export interface AnalyticsData {
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  totalCertifications: number;
  certsByStatus: Record<string, number>;
  totalProjects: number;
  projectsByStatus: Record<string, number>;
  totalSkills: number;
  totalJobTargets: number;
  salaryRanges: Array<{ title: string; min: number; max: number }>;
  skillsCoverage: Array<{ skill: string; category: string; demand: number }>;
}

export interface InterviewQuestion {
  question: string;
  type: "technical" | "behavioral";
  difficulty: "easy" | "medium" | "hard";
}

export interface CoverLetterResult {
  coverLetter: string;
  highlights: string[];
}

export interface JobMatchResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  salaryAlignment: string;
  recommendation: string;
}

export interface CompanyResearch {
  overview: string;
  techStack: string[];
  culture: string;
  interviewProcess: string;
  salaryRanges: string;
  recentNews: string[];
}

export interface CertRoadmapItem {
  name: string;
  priority: "high" | "medium" | "low";
  timeline: string;
  reason: string;
  category: string;
}

export interface WeeklyReport {
  summary: string;
  newApplications: number;
  certProgress: string;
  projectUpdates: string;
  skillsAdded: string[];
  focusAreas: string[];
}

export interface SavedJob {
  id: number;
  title: string;
  company: string;
  url: string;
  location: string;
  salary_min: number;
  salary_max: number;
  description: string;
  category: string;
  match_score: number;
  status: string;
  date_saved: string;
  notes: string;
  created_at: string;
}

export interface Referral {
  id: number;
  contact_name: string;
  contact_email: string;
  company: string;
  position: string;
  status: string;
  date_referred: string;
  notes: string;
  referral_url: string;
  created_at: string;
}

export interface NetworkingContact {
  id: number;
  name: string;
  email: string;
  company: string;
  role: string;
  linkedin_url: string;
  category: string;
  last_contact_date: string;
  next_follow_up: string;
  notes: string;
  status: string;
  created_at: string;
}

export interface Interview {
  id: number;
  company: string;
  position: string;
  round_type: string;
  date: string;
  time: string;
  location: string;
  interviewer_name: string;
  feedback: string;
  status: string;
  prep_notes: string;
  created_at: string;
}

export interface Question {
  id: number;
  question: string;
  answer: string;
  category: string;
  difficulty: string;
  company: string;
  tags: string;
  times_practiced: number;
  created_at: string;
}

export interface LearningPath {
  id: number;
  title: string;
  url: string;
  resource_type: string;
  skill_category: string;
  status: string;
  progress_pct: number;
  notes: string;
  priority: number;
  created_at: string;
}

export interface Document {
  id: number;
  title: string;
  doc_type: string;
  url: string;
  content_text: string;
  tags: string;
  version: string;
  notes: string;
  created_at: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  tech_stack: string;
  repo_url: string;
  live_url: string;
  image_url: string;
  category: string;
  featured: number;
  created_at: string;
}

export interface SystemDesignResult {
  problem: string;
  requirements: string[];
  hints: string[];
}

export interface SystemDesignCritique {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  feedback: string;
}

export interface CareerGoalsResult {
  quarterlyMilestones: Array<{ quarter: string; goals: string[] }>;
  currentAssessment: string;
  actionItems: string[];
}

export interface PitchBuilderResult {
  elevatorPitch: string;
  brandStatement: string;
  linkedinSummary: string;
}

export interface JobBoardScanResult {
  listings: Array<{
    title: string;
    company: string;
    location: string;
    matchScore: number;
    summary: string;
  }>;
  topPicks: string[];
}

export interface WeeklyGoalsResult {
  goals: Array<{ goal: string; priority: "high" | "medium" | "low"; category: string }>;
  focusAreas: string[];
  motivation: string;
}

export interface DailyBriefing {
  upcomingDeadlines: Array<{ title: string; date: string; type: string }>;
  suggestedActions: string[];
  topPriorities: string[];
  motivation: string;
}
