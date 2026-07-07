import { NextResponse } from "next/server";
import { getDefaultModel, getModelConfigs, createAssistantSession, getConversationContext, getApplications } from "@/lib/db";
import { callAIWithMessages } from "@/lib/ai";
import { getUserId } from "@/lib/auth-guard";
import { withPersonality } from "@/lib/ai-personality";
import "@/lib/mcp/init";
import { listTools, callTool } from "@/lib/mcp/registry";

function resolveModel(modelOverride?: { provider: string; model_name: string }) {
  if (!modelOverride) return undefined;
  const configs = getModelConfigs() as any[];
  const config = configs.find((c: any) => c.provider === modelOverride.provider && c.model_name === modelOverride.model_name);
  if (!config) return undefined;
  return {
    provider: config.provider,
    model_name: config.model_name,
    api_key: config.api_key,
    base_url: config.base_url,
    temperature: config.temperature,
    max_tokens: config.max_tokens,
  };
}

async function callAI(prompt: string, systemPrompt: string, modelOverride?: { provider: string; model_name: string }) {
  const resolved = resolveModel(modelOverride);
  return callAIWithMessages([{ role: "user", content: prompt }], systemPrompt, resolved);
}

const JSON_ONLY = `\nReturn ONLY valid JSON (no markdown, no code blocks).`;

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const { action, payload } = await request.json();
    const model = getDefaultModel() as any;
    const modelUsed = model ? `${model.provider}/${model.model_name}` : "none";

    switch (action) {
      case "generate_projects": {
        const systemPrompt = withPersonality(`Generate project ideas based on job descriptions. If the job description is generic or boilerplate, call that out — then suggest projects that would actually make a candidate stand out. No cookie-cutter todo apps or CRUD projects.${JSON_ONLY}
{
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["tech1", "tech2"],
      "category": "One of: AI Infrastructure, Data Center, Cybersecurity, Cloud, Networking, DevOps, Frontend, Backend, Full Stack, Mobile, Data Engineering",
      "estimated_timeline": "2-3 weeks",
      "standout_factor": "Why this project would impress a hiring manager"
    }
  ]
}
Generate 3-5 projects. Each must be portfolio-worthy, not tutorial-level.`);

        const result = await callAI(`Generate project ideas for this job description:\n\n${payload.jobDescription}`, systemPrompt);
        const parsed = JSON.parse(result);
        createAssistantSession({ type: "project_gen", input_text: payload.jobDescription, result_json: JSON.stringify(parsed), score: null, model_used: modelUsed }, userId);
        return NextResponse.json(parsed);
      }

      case "scan_resume": {
        const systemPrompt = withPersonality(`Compare a resume against a job description. Score honestly — a 75 means there are real gaps. Don't inflate scores to be nice. If the resume is weak, say exactly why and what it costs the candidate.${JSON_ONLY}
{
  "score": 75,
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill3", "skill4"],
  "partial_matches": ["skill5"],
  "red_flags": ["Any concerns about the resume"],
  "feedback": "Direct, specific feedback on how to improve. No fluff."
}
Score 0-100. Explain what each missing point costs them.`);

        const result = await callAI(`Resume:\n${payload.resume}\n\nJob Description:\n${payload.jobDescription}`, systemPrompt);
        const parsed = JSON.parse(result);
        createAssistantSession({ type: "resume_scan", input_text: `Resume: ${payload.resume.substring(0, 200)}... | JD: ${payload.jobDescription.substring(0, 200)}...`, result_json: JSON.stringify(parsed), score: parsed.score, model_used: modelUsed }, userId);
        return NextResponse.json(parsed);
      }

      case "detect_skills": {
        const systemPrompt = withPersonality(`Analyze projects and detect skills/technologies gained. Distinguish between real proficiency and surface-level exposure. If someone listed React on a project that's just a landing page, call it out — that's not React proficiency.${JSON_ONLY}
{
  "detected_skills": [
    { "name": "Skill Name", "category": "One of: Frontend, Backend, DevOps, Database, Cloud, Security, AI/ML, Mobile", "proficiency": "Beginner|Intermediate|Advanced", "evidence": "What in the project proves this skill" }
  ],
  "gap_analysis": { "covered": ["skill1"], "missing": ["skill2"] },
  "skill_inflation": ["Skills that look inflated based on the evidence"]
}`);

        const result = await callAI(`Analyze these projects and detect skills:\n\n${JSON.stringify(payload.projects, null, 2)}\n\nTarget job titles: ${payload.targetJobs || "General software engineering"}`, systemPrompt);
        const parsed = JSON.parse(result);
        createAssistantSession({ type: "skill_detect", input_text: JSON.stringify(payload.projects), result_json: JSON.stringify(parsed), score: null, model_used: modelUsed }, userId);
        return NextResponse.json(parsed);
      }

      case "interview_prep": {
        const systemPrompt = withPersonality(`Generate interview questions for the given job title. These should be REAL interview questions — the kind that trip people up, not textbook definitions. Include questions that test depth, not just surface knowledge. If a candidate can't answer these, they're not ready for the role.${JSON_ONLY}
{
  "questions": [
    { "question": "The interview question text", "type": "technical" or "behavioral", "difficulty": "easy", "medium", or "hard", "what_good_answer_includes": "Brief note on what a strong answer covers" }
  ]
}
Generate 10 questions: 6 technical and 4 behavioral. At least 3 should be genuinely hard.`);

        const result = await callAI(`Generate interview questions for this job title: ${payload.jobTitle}`, systemPrompt);
        const parsed = JSON.parse(result);
        createAssistantSession({ type: "interview_prep", input_text: payload.jobTitle, result_json: JSON.stringify(parsed), score: null, model_used: modelUsed }, userId);
        return NextResponse.json(parsed);
      }

      case "rate_answer": {
        const systemPrompt = withPersonality(`Rate the user's answer to an interview question like a tough interviewer. If the answer is mediocre, say so directly. Don't sugarcoat. A 50 means "you'd likely get rejected." A 75 means "solid but room to improve." 90+ means "genuinely impressive."${JSON_ONLY}
{
  "score": 75,
  "verdict": "pass|borderline|fail",
  "strengths": ["What was good about the answer"],
  "weaknesses": ["What was missing or wrong"],
  "improved_answer": "A model answer that would score 90+",
  "feedback": "Direct feedback. If it's bad, say it's bad and why."
}
Score 0-100.`);

        const result = await callAI(`Question: ${payload.question}\n\nUser's Answer: ${payload.answer}`, systemPrompt);
        const parsed = JSON.parse(result);
        createAssistantSession({ type: "rate_answer", input_text: `Q: ${payload.question.substring(0, 100)}... A: ${payload.answer.substring(0, 100)}...`, result_json: JSON.stringify(parsed), score: parsed.score, model_used: modelUsed }, userId);
        return NextResponse.json(parsed);
      }

      case "cover_letter": {
        const systemPrompt = withPersonality(`Generate a cover letter. No corporate buzzwords, no "I am a passionate team player" garbage. Make it sharp, specific, and human. If the job description is generic, write a cover letter that stands out despite that. Cut every sentence that doesn't add value.${JSON_ONLY}
{
  "coverLetter": "The full cover letter text — direct, no fluff, specific to this role",
  "highlights": ["Key highlight 1", "Key highlight 2", "Key highlight 3"],
  "cut_suggestion": "One thing the user should remove from their resume/cover letter approach"
}`);

        const result = await callAI(`Job Description:\n${payload.jobDescription}\n\nResume:\n${payload.resumeText}`, systemPrompt);
        const parsed = JSON.parse(result);
        createAssistantSession({ type: "cover_letter", input_text: payload.jobDescription.substring(0, 200), result_json: JSON.stringify(parsed), score: null, model_used: modelUsed }, userId);
        return NextResponse.json(parsed);
      }

      case "job_match": {
        const context = getConversationContext(userId);
        const systemPrompt = withPersonality(`Score how well the user matches a job posting. Be honest — if they're underqualified, say it. Don't inflate the score to make them feel good. A 60 means "stretch role, significant gaps." A 40 means "not ready."${JSON_ONLY}
{
  "score": 75,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "salaryAlignment": "Honest assessment — are they asking too much or selling themselves short?",
  "honest_take": "The direct truth about their candidacy for this role",
  "recommendation": "Apply|Skip|Stretch — and what they'd need to do to be a strong candidate"
}
Score 0-100. Explain what the missing points actually mean for their chances.`);

        const profileSummary = `User Profile:\nSkills: ${context.techStack.map((t: any) => t.name).join(", ")}\nCertifications: ${context.certifications.map((c: any) => c.name).join(", ")}\nTarget Roles: ${context.jobTitles.map((j: any) => `${j.title} at ${j.company}`).join(", ")}`;
        const result = await callAI(`Job Posting:\n${payload.jobPosting}\n\n${profileSummary}`, systemPrompt);
        const parsed = JSON.parse(result);
        createAssistantSession({ type: "job_match", input_text: payload.jobPosting.substring(0, 200), result_json: JSON.stringify(parsed), score: parsed.score, model_used: modelUsed }, userId);
        return NextResponse.json(parsed);
      }

      case "company_research": {
        const systemPrompt = withPersonality(`Research a company. Include red flags, not just positives. If the company has layoffs, bad reviews, or questionable practices, mention them. Don't be a PR brochure — be an honest analyst.${JSON_ONLY}
{
  "overview": "Brief, factual overview",
  "techStack": ["tech1", "tech2"],
  "culture": "Honest culture assessment — including any red flags",
  "interviewProcess": "What to actually expect",
  "salaryRanges": "Real ranges, not the 'up to' fantasy numbers",
  "redFlags": ["Any concerns — layoffs, turnover, bad reviews"],
  "recentNews": ["news1", "news2"],
  "should_apply": "Honest assessment: is this a good company to target?"
}`);

        const result = await callAI(`Research this company: ${payload.companyName}`, systemPrompt);
        const parsed = JSON.parse(result);
        createAssistantSession({ type: "company_research", input_text: payload.companyName, result_json: JSON.stringify(parsed), score: null, model_used: modelUsed }, userId);
        return NextResponse.json(parsed);
      }

      case "cert_roadmap": {
        const context = getConversationContext(userId);
        const currentCerts = context.certifications.map((c: any) => `${c.name} (${c.status || "PLANNING"})`).join(", ") || "None";
        const systemPrompt = withPersonality(`Suggest certifications based on career goals. Cut vanity certs — prioritize by ROI. If a cert won't actually help them get hired, say so. If they're collecting certs instead of building real skills, call that out.${JSON_ONLY}
{
  "roadmap": [
    { "name": "Certification Name", "priority": "high|medium|low", "timeline": "2-3 months", "reason": "Why — and what it actually does for their career", "roi": "What this cert is worth in salary/hiring advantage", "category": "Cert category" }
  ],
  "honest_assessment": "Are they cert-chasing or building real skills? What should they prioritize instead?"
}
Generate 5-8 suggestions. Prioritize by career impact, not prestige.`);

        const result = await callAI(`Career Goals: ${payload.careerGoals}\n\nCurrent Certifications: ${currentCerts}\n\nCurrent Skills: ${context.techStack.map((t: any) => `${t.name} (${t.category})`).join(", ")}`, systemPrompt);
        const parsed = JSON.parse(result);
        createAssistantSession({ type: "cert_roadmap", input_text: payload.careerGoals, result_json: JSON.stringify(parsed), score: null, model_used: modelUsed }, userId);
        return NextResponse.json(parsed);
      }

      case "weekly_report": {
        const context = getConversationContext(userId);
        const applications = getApplications(userId) as any[];
        const recentApps = applications.slice(0, 10).map((a: any) => `${a.position} at ${a.company} [${a.status}]`).join(", ") || "None";
        const systemPrompt = withPersonality(`Generate a weekly career report. Highlight what's NOT done, not just celebrate wins. If progress stalled, say it. If they're behind on targets, call it out. No participation trophies.${JSON_ONLY}
{
  "summary": "Direct, honest summary — what went well AND what didn't",
  "newApplications": 5,
  "rejections": 0,
  "certProgress": "Honest cert progress — are they on track or falling behind?",
  "projectUpdates": "Are projects moving forward or stalling?",
  "skillsAdded": ["skill1"],
  "problems": ["What's not working"],
  "focusAreas": ["What to fix this week — be specific, not vague"]
}`);

        const result = await callAI(`Generate a weekly career report.\n\nTarget Roles: ${context.jobTitles.map((j: any) => `${j.title} at ${j.company}`).join(", ")}\n\nRecent Applications: ${recentApps}\n\nProjects: ${context.projects.map((p: any) => `${p.name} [${p.status}]`).join(", ")}\n\nCertifications: ${context.certifications.map((c: any) => `${c.name} [${c.status || "PLANNING"}]`).join(", ")}\n\nSkills: ${context.techStack.map((t: any) => t.name).join(", ")}`, systemPrompt);
        const parsed = JSON.parse(result);
        createAssistantSession({ type: "weekly_report", input_text: "Weekly report", result_json: JSON.stringify(parsed), score: null, model_used: modelUsed }, userId);
        return NextResponse.json(parsed);
      }

      case "mock_system_design": {
        if (!payload.solution) {
          const systemPrompt = withPersonality(`Generate a system design problem for an infrastructure/cloud/cybersecurity engineer. This should be a REAL problem — the kind that separates senior engineers from juniors. Not "design a URL shortener." Think: multi-region failover, zero-trust networking, large-scale data pipeline security.${JSON_ONLY}
{
  "problem": "Detailed problem description",
  "constraints": ["Real-world constraints that make this hard"],
  "requirements": ["Requirement 1", "Requirement 2"],
  "what_separates_great_from_good": "What would a Staff-level answer include that a mid-level wouldn't think of?"
}`);
          const result = await callAI(`Generate a system design problem. Difficulty: ${payload.difficulty || "medium"}. Focus area: ${payload.focus || "cloud infrastructure"}.`, systemPrompt);
          const parsed = JSON.parse(result);
          createAssistantSession({ type: "system_design", input_text: payload.focus || "system design", result_json: JSON.stringify(parsed), score: null, model_used: modelUsed }, userId);
          return NextResponse.json(parsed);
        } else {
          const systemPrompt = withPersonality(`Critique the candidate's system design solution like a tough interviewer. If the design has flaws, call them out directly. "This design would fail in production because..." is a valid response. Don't sugarcoat architectural mistakes.${JSON_ONLY}
{
  "score": 75,
  "verdict": "hire|no_hire|borderline",
  "strengths": ["What was genuinely good"],
  "critical_flaws": ["What would break in production"],
  "missing_considerations": ["What they didn't think about"],
  "suggestions": ["Specific improvements"],
  "feedback": "Direct, honest feedback as if telling the candidate to their face"
}`);
          const result = await callAI(`Problem: ${payload.problem}\n\nCandidate's Solution: ${payload.solution}`, systemPrompt);
          const parsed = JSON.parse(result);
          createAssistantSession({ type: "system_design_critique", input_text: payload.solution.substring(0, 200), result_json: JSON.stringify(parsed), score: parsed.score, model_used: modelUsed }, userId);
          return NextResponse.json(parsed);
        }
      }

      case "career_goals": {
        const context = getConversationContext(userId);
        const systemPrompt = withPersonality(`Analyze the user's career goals. If they're vague or unrealistic, challenge them. "I want to work at Google" isn't a plan — it's a wish. Push for specificity, timelines, and actionable steps. If their goals don't match their current trajectory, say so.${JSON_ONLY}
{
  "quarterlyMilestones": [
    { "quarter": "Q1 2026", "goals": ["Specific, measurable goal"], "accountability_check": "How to verify this was done" }
  ],
  "currentAssessment": "Honest assessment — where are they ACTUALLY vs where they think they are",
  "reality_check": "What they need to hear but probably don't want to",
  "actionItems": ["Action 1 — specific, with deadline", "Action 2", "Action 3"]
}`);
        const profileSummary = `Current Skills: ${context.techStack.map((t: any) => t.name).join(", ") || "None"}\nCertifications: ${context.certifications.map((c: any) => `${c.name} [${c.status || "PLANNING"}]`).join(", ") || "None"}\nProjects: ${context.projects.map((p: any) => `${p.name} [${p.status}]`).join(", ") || "None"}\nTarget Roles: ${context.jobTitles.map((j: any) => `${j.title} at ${j.company}`).join(", ") || "None"}`;
        const result = await callAI(`Career Goals: ${payload.goals}\n\n${profileSummary}`, systemPrompt);
        const parsed = JSON.parse(result);
        createAssistantSession({ type: "career_goals", input_text: payload.goals, result_json: JSON.stringify(parsed), score: null, model_used: modelUsed }, userId);
        return NextResponse.json(parsed);
      }

      case "pitch_builder": {
        const systemPrompt = withPersonality(`Create professional pitches. Cut corporate buzzwords. "Passionate team player with excellent communication skills" is meaningless filler. Make every word earn its place. If the person's background is thin, write a pitch that's honest about where they are while showing potential — don't oversell.${JSON_ONLY}
{
  "elevatorPitch": "30-second pitch — direct, no filler, memorable",
  "brandStatement": "One sentence that captures who they are professionally",
  "linkedinSummary": "LinkedIn summary that doesn't sound like every other LinkedIn profile",
  "weakness_to_address": "One thing about their pitch/profile that needs work"
}`);
        const result = await callAI(`Create professional pitches for this person:\n${payload.resume}`, systemPrompt);
        const parsed = JSON.parse(result);
        createAssistantSession({ type: "pitch_builder", input_text: payload.resume.substring(0, 200), result_json: JSON.stringify(parsed), score: null, model_used: modelUsed }, userId);
        return NextResponse.json(parsed);
      }

      case "job_board_scan": {
        const context = getConversationContext(userId);
        const systemPrompt = withPersonality(`Extract and score job listings from the provided text. Score honestly — if a listing is a bad match, give it a low score. Don't inflate scores to make the user feel like they have options. A 40 match score means "don't waste your time."${JSON_ONLY}
{
  "listings": [
    { "title": "Job Title", "company": "Company", "location": "Location", "matchScore": 85, "honest_take": "Why this is or isn't a good fit", "summary": "Brief description" }
  ],
  "topPicks": ["Why this is a top match — be specific about fit"],
  "skipThese": ["Listings that look appealing but are actually bad matches — explain why"]
}`);
        const profileSummary = `Skills: ${context.techStack.map((t: any) => t.name).join(", ")}\nTarget Roles: ${context.jobTitles.map((j: any) => j.title).join(", ")}`;
        const result = await callAI(`Job Board Content:\n${payload.text}\n\nUser Profile:\n${profileSummary}`, systemPrompt);
        const parsed = JSON.parse(result);
        createAssistantSession({ type: "job_board_scan", input_text: payload.text.substring(0, 200), result_json: JSON.stringify(parsed), score: null, model_used: modelUsed }, userId);
        return NextResponse.json(parsed);
      }

      case "weekly_goals": {
        const context = getConversationContext(userId);
        const applications = getApplications(userId) as any[];
        const systemPrompt = withPersonality(`Suggest weekly goals. Hold the user accountable — if they had goals last week and didn't complete them, mention it. Don't set soft goals. "Apply to 2 jobs" is not ambitious if they have 0 interviews. Match goals to where they actually are in their pipeline.${JSON_ONLY}
{
  "goals": [
    { "goal": "Specific, measurable goal", "priority": "high", "category": "Applications|Skills|Projects|Certs", "why": "Why this matters THIS week" }
  ],
  "focusAreas": ["Focus area 1", "Focus area 2"],
  "reality_check": "What they should have done last week but probably didn't"
}`);
        const pipelineSummary = `Active Applications: ${applications.filter((a: any) => ["APPLIED", "PHONE SCREEN", "INTERVIEW"].includes(a.status)).length}\nPending Certifications: ${context.certifications.filter((c: any) => c.status !== "PASSED").length}\nActive Projects: ${context.projects.filter((p: any) => p.status !== "DONE").length}\nSkills: ${context.techStack.length}\nTarget Roles: ${context.jobTitles.length}`;
        const result = await callAI(`Suggest weekly goals for this job seeker.\n\n${pipelineSummary}`, systemPrompt);
        const parsed = JSON.parse(result);
        createAssistantSession({ type: "weekly_goals", input_text: "Weekly goals", result_json: JSON.stringify(parsed), score: null, model_used: modelUsed }, userId);
        return NextResponse.json(parsed);
      }

      case "generate_question_answer": {
        const systemPrompt = withPersonality(`Generate a comprehensive answer for the given interview question. This should be an answer that would actually impress a tough interviewer — not a textbook definition. Include specific examples, trade-offs, and real-world considerations.${JSON_ONLY}
{
  "answer": "A detailed, technically accurate answer that demonstrates real understanding",
  "key_points": ["The 3-4 things a strong answer MUST include"],
  "common_mistakes": ["What most candidates get wrong on this question"]
}`);
        const result = await callAI(`Generate a comprehensive answer for this interview question:\n\n${payload.question}`, systemPrompt, payload.model);
        const parsed = JSON.parse(result);
        createAssistantSession({ type: "generate_answer", input_text: payload.question.substring(0, 200), result_json: JSON.stringify(parsed), score: null, model_used: modelUsed }, userId);
        return NextResponse.json(parsed);
      }

      case "generate_questions": {
        const systemPrompt = withPersonality(`Generate interview questions based on the given topic. These should be questions that actually test depth of knowledge, not trivia. Include questions where the "obvious" answer is incomplete or wrong.${JSON_ONLY}
{
  "questions": [
    { "question": "The interview question text", "answer": "A comprehensive answer", "tricky_part": "What makes this question hard — the trap most candidates fall into", "category": "${payload.category || "TECHNICAL"}", "difficulty": "${payload.difficulty || "MEDIUM"}" }
  ]
}
Generate ${payload.count || 5} questions. Make them the kind that separate good from great candidates.`);
        const result = await callAI(`Generate interview questions about: ${payload.topic}\nCategory: ${payload.category || "TECHNICAL"}\nDifficulty: ${payload.difficulty || "MEDIUM"}\nCount: ${payload.count || 5}`, systemPrompt, payload.model);
        const parsed = JSON.parse(result);
        createAssistantSession({ type: "generate_questions", input_text: payload.topic, result_json: JSON.stringify(parsed), score: null, model_used: modelUsed }, userId);
        return NextResponse.json(parsed);
      }

      case "generate_roadmap": {
        const context = getConversationContext(userId);
        const hasTarget = payload.jobTitle?.trim();
        const mode = payload.mode || "target";

        const baseGuidelines = `- Create 3-5 phases that build on each other progressively
- Each phase should have 2-4 skills, 1-2 certs, 1-2 projects, and 2-3 milestones
- Skills and certs should be specific and industry-relevant — no generic "learn Python" goals
- Project ideas should be practical and portfolio-worthy
- Milestones should be measurable achievements with specific dates
- Tailor the plan to the user's existing skills — skip what they already know
- Focus on infrastructure, DevOps, cloud, cybersecurity, and AI roles
- If the timeline is unrealistic, say so. "Get AWS SA Pro in 2 weeks" is not a plan.
- If they're spreading too thin across too many paths, call it out`;

        let systemPrompt: string;

        if (mode === "progression") {
          systemPrompt = withPersonality(`Create a detailed career progression roadmap showing how to advance from the user's current level to senior/leadership roles, WITH realistic salary/income projections at each stage. Be honest about timelines — getting from mid to senior takes years, not months.${JSON_ONLY}
{
  "target_role": "Career Progression Path",
  "total_timeline": "3-5 years",
  "current_level": "Current estimated level",
  "phases": [
    {
      "name": "Phase Name",
      "timeline": "Year 1-2",
      "description": "What this stage looks like and what distinguishes it",
      "salary_range": "$80,000 - $120,000",
      "salary_note": "What affects salary at this level",
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "certifications": ["Cert Name 1", "Cert Name 2"],
      "projects": ["Project idea 1", "Project idea 2"],
      "milestones": ["Milestone 1", "Milestone 2"]
    }
  ]
}
Guidelines:
${baseGuidelines}
- Salary ranges should be realistic for the US market
- Show clear career progression — each phase is a real promotion
- Include salary negotiation tips`);
        } else if (hasTarget) {
          systemPrompt = withPersonality(`Create a detailed, phased career plan for the target role. Be realistic about timelines. If the gap between current skills and target role is large, say so — don't promise a 6-month plan for a 2-year journey.${JSON_ONLY}
{
  "target_role": "The target role",
  "total_timeline": "12-18 months",
  "suggested_paths": null,
  "honest_gap_assessment": "How far they actually are from this role",
  "phases": [
    {
      "name": "Phase Name",
      "timeline": "0-3 months",
      "description": "Detailed focus for this phase",
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "certifications": ["Cert Name 1", "Cert Name 2"],
      "projects": ["Project idea 1", "Project idea 2"],
      "milestones": ["Milestone 1", "Milestone 2"]
    }
  ]
}
Guidelines:
${baseGuidelines}`);
        } else {
          systemPrompt = withPersonality(`Analyze the user's current skills, certs, projects, and target roles to SUGGEST the best career paths. Be honest about which paths are realistic and which are aspirational. If their skills don't clearly point to any path, say so.${JSON_ONLY}
{
  "target_role": "Suggested best-fit role based on actual profile",
  "total_timeline": "12-18 months",
  "suggested_paths": ["Alternative path 1", "Alternative path 2"],
  "honest_assessment": "What their profile actually qualifies them for vs what they're targeting",
  "phases": [
    {
      "name": "Phase Name",
      "timeline": "0-3 months",
      "description": "Detailed focus",
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "certifications": ["Cert Name 1", "Cert Name 2"],
      "projects": ["Project idea 1", "Project idea 2"],
      "milestones": ["Milestone 1", "Milestone 2"]
    }
  ]
}
Guidelines:
${baseGuidelines}
- Be specific about why each suggested path fits their profile`);
        }

        const bg = context.background as any;
        const backgroundInfo = bg && bg.current_role ? `\nBackground: Current role: ${bg.current_role}, Employment: ${bg.employment_status}, Experience: ${bg.years_experience} years, Education: ${bg.education_level || "N/A"}, Industry: ${bg.industry_focus || "N/A"}, Location: ${bg.location || "N/A"}, Desired salary: $${bg.desired_salary_min || 0}-$${bg.desired_salary_max || 0}${bg.bio ? `, Bio: ${bg.bio}` : ""}` : "";
        const profileSummary = `Current Skills: ${context.techStack.map((t: any) => `${t.name} [${t.proficiency_goal || "learning"}]`).join(", ") || "None"}\nCertifications: ${context.certifications.map((c: any) => `${c.name} [${c.status || "PLANNING"}]`).join(", ") || "None"}\nProjects: ${context.projects.map((p: any) => `${p.name} [${p.status}]`).join(", ") || "None"}\nTarget Roles: ${context.jobTitles.map((j: any) => `${j.title} at ${j.company}`).join(", ") || "None"}${backgroundInfo}`;

        let prompt: string;
        if (mode === "progression") {
          const src = payload.progressionSource || "job_title";
          if (src === "background" && bg?.current_role) {
            prompt = `Generate a career progression roadmap based on my ACTUAL background:\n- Current role: ${bg.current_role}\n- Employment: ${bg.employment_status}\n- Experience: ${bg.years_experience} years\n- Education: ${bg.education_level || "N/A"}\n- Industry focus: ${bg.industry_focus || "N/A"}\n- Location: ${bg.location || "N/A"}\n- Desired salary: $${bg.desired_salary_min || 0}-$${bg.desired_salary_max || 0}\n${bg.bio ? `- Bio: ${bg.bio}\n` : ""}\nFull Profile:\n${profileSummary}`;
          } else if (src === "current_role" && bg?.current_role) {
            prompt = `Generate a career progression roadmap starting from my current role: "${bg.current_role}" with ${bg.years_experience || 0} years experience. Show how I can advance to senior roles with salary projections.\n\nProfile:\n${profileSummary}`;
          } else if (src === "target_roles" && hasTarget) {
            prompt = `Generate a career progression roadmap toward the target role: "${payload.jobTitle}". Show the path from entry level to this role with salary projections at each stage.\n\nProfile:\n${profileSummary}`;
          } else if (src === "job_title" && hasTarget) {
            prompt = `Generate a career progression roadmap for someone starting FROM SCRATCH in the "${payload.jobTitle}" career path. Assume no prior experience. Show the full progression from entry to senior/leadership with salary projections.\n\nThis is NOT based on the user's current profile — generate it as if starting fresh.`;
          } else {
            prompt = `Generate a career progression roadmap for someone starting FROM SCRATCH in the "${payload.jobTitle || "tech"}" career path. Assume no prior experience. Show progression from entry to senior with salary projections.\n\nStarting fresh, not based on user profile.`;
          }
        } else {
          prompt = hasTarget
            ? `Generate a career roadmap for: ${payload.jobTitle}\n\nCurrent Profile:\n${profileSummary}`
            : `Analyze my current profile and generate a suggested career roadmap. Find the best role that fits my skills and experience.\n\nCurrent Profile:\n${profileSummary}`;
        }

        const result = await callAI(prompt, systemPrompt);
        const parsed = JSON.parse(result);
        createAssistantSession({ type: "generate_roadmap", input_text: `${mode}: ${payload.jobTitle || "auto-suggest"}`, result_json: JSON.stringify(parsed), score: null, model_used: modelUsed }, userId);
        return NextResponse.json(parsed);
      }

      case "mcp_call": {
        const query = payload.query;
        if (!query?.trim()) return NextResponse.json({ error: "Query required" }, { status: 400 });

        const tools = listTools();
        const toolDescriptions = tools.map((t) => `- ${t.name}: ${t.description} (params: ${t.params.map((p) => `${p.name}:${p.type}${p.required ? "*" : ""}`).join(", ")})`).join("\n");

        const systemPrompt = withPersonality(`You have access to MCP tools. Based on the user's query, decide which tools to call. Be direct in your analysis — don't call tools unnecessarily. If you can answer directly, do it.${JSON_ONLY}
{
  "analysis": "Brief explanation of what you'll do",
  "tool_calls": [
    { "tool": "tool_name", "params": { "param1": "value1" } }
  ],
  "response": "Direct answer or summary"
}
If no tools are needed, return { "analysis": "...", "tool_calls": [], "response": "Your direct answer" }`);

        const aiResult = await callAI(query, systemPrompt);
        let parsed = JSON.parse(aiResult);

        const toolResults: Array<{ tool: string; success: boolean; data: unknown; error?: string }> = [];
        if (parsed.tool_calls?.length > 0) {
          for (const tc of parsed.tool_calls) {
            const result = await callTool(tc.tool, tc.params || {}, userId);
            toolResults.push({ tool: tc.tool, success: result.success, data: result.data, error: result.error });
          }
        }

        const response = {
          analysis: parsed.analysis,
          tool_calls: parsed.tool_calls || [],
          tool_results: toolResults,
          response: parsed.response,
        };

        createAssistantSession({ type: "mcp_call", input_text: query.substring(0, 200), result_json: JSON.stringify(response), score: null, model_used: modelUsed }, userId);
        return NextResponse.json(response);
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Assistant error:", error);
    return NextResponse.json(
      { error: error.message || "AI request failed" },
      { status: 500 }
    );
  }
}
