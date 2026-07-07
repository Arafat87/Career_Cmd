import { NextResponse } from "next/server";
import { callAIWithMessages } from "@/lib/ai";
import { getUserId } from "@/lib/auth-guard";
import {
  getApplications, getCertifications, getProjects, getTechStack,
  getJobTitles, getInterviews, getModelConfigs
} from "@/lib/db";

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { type, prompt, extra, modelId } = body;

    // Resolve model: use specified modelId or fall back to default
    let modelOverride = undefined;
    if (modelId) {
      const configs = getModelConfigs() as any[];
      modelOverride = configs.find((c: any) => c.id === modelId) || undefined;
    }

    // Gather user context from their data
    const safe = <T>(fn: () => T): T => { try { return fn(); } catch { return [] as unknown as T; } };
    const apps = safe(() => getApplications(userId));
    const certs = safe(() => getCertifications(userId));
    const projects = safe(() => getProjects(userId));
    const tech = safe(() => getTechStack(userId));
    const jobTitles = safe(() => getJobTitles(userId));
    const interviews = safe(() => getInterviews(userId));

    const userContext = `
USER'S CAREER DATA:
- Certifications: ${(certs as any[]).map((c: any) => c.name).join(", ") || "None"}
- Tech Stack: ${(tech as any[]).map((t: any) => `${t.name} (${t.proficiency_goal || "intermediate"})`).join(", ") || "None"}
- Projects: ${(projects as any[]).map((p: any) => `${p.name} - ${p.description || p.technologies || ""} [${p.status}]`).join("; ") || "None"}
- Target Job Titles: ${(jobTitles as any[]).map((j: any) => `${j.title} @ ${j.company || "N/A"}`).join(", ") || "None"}
- Applications: ${(apps as any[]).length} total, statuses: ${[...new Set((apps as any[]).map((a: any) => a.status))].join(", ")}
- Interviews: ${(interviews as any[]).length} completed
- Skills: ${(tech as any[]).map((t: any) => t.name).join(", ") || "None"}
`.trim();

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "cover-letter":
        systemPrompt = `You are a professional career writer. Write compelling cover letters tailored to specific jobs. Use the candidate's actual experience, skills, and projects. Be specific and use metrics where possible. Write in a professional but personable tone.`;
        userPrompt = `${userContext}

${extra?.jobDescription ? `JOB DESCRIPTION:\n${extra.jobDescription}\n\n` : ""}
${extra?.companyName ? `COMPANY: ${extra.companyName}\n` : ""}${extra?.position ? `POSITION: ${extra.position}\n` : ""}
${extra?.template ? `TEMPLATE STYLE: ${extra.template}\n` : ""}

${prompt || "Write a cover letter for this position based on my experience and skills."}`;
        break;

      case "email":
        systemPrompt = `You are a professional email writer for job seekers. Write clear, concise, professional emails. Use the candidate's actual background when relevant. Keep emails focused and actionable.`;
        userPrompt = `${userContext}

EMAIL TYPE: ${extra?.emailType || "general"}
${extra?.companyName ? `COMPANY: ${extra.companyName}\n` : ""}${extra?.position ? `POSITION: ${extra.position}\n` : ""}${extra?.interviewerName ? `CONTACT: ${extra.interviewerName}\n` : ""}

${prompt || "Write a professional email for this job search scenario."}`;
        break;

      case "resume":
        systemPrompt = `You are a professional resume writer. Create impactful resume content using action verbs, quantified achievements, and ATS-friendly language. Use the candidate's actual data. Format in clean markdown.`;
        userPrompt = `${userContext}

${extra?.targetRole ? `TARGET ROLE: ${extra.targetRole}\n` : ""}
${extra?.section ? `SECTION TO IMPROVE: ${extra.section}\n` : ""}

${prompt || "Improve my resume content based on my actual experience, skills, and projects. Make it ATS-optimized with strong action verbs and quantified achievements."}`;
        break;

      case "company-research":
        systemPrompt = `You are a tech industry analyst. Research companies and provide structured information about their culture, tech stack, hiring practices, salary ranges, and interview processes. Be factual and specific.`;
        userPrompt = `${userContext}

${extra?.companyName ? `COMPANY: ${extra.companyName}\n` : ""}
${extra?.industry ? `INDUSTRY: ${extra.industry}\n` : ""}

${prompt || "Research this company and provide: culture overview, tech stack, interview process, salary ranges, pros/cons, and whether it's a good fit for my background."}`;
        break;

      case "company-suggestions":
        systemPrompt = `You are a career advisor specializing in tech infrastructure, DevOps, cloud, and AI roles. Suggest companies that would be good fits based on the candidate's skills and experience. Provide structured recommendations.`;
        userPrompt = `${userContext}

${extra?.preferences ? `PREFERENCES: ${extra.preferences}\n` : ""}

Suggest 10 companies that would be good fits for my background. For each, provide:
- Company name
- Why it's a good fit (reference my specific skills)
- Estimated salary range
- Tech stack they use
- Culture notes

Format as JSON array: [{"name": "", "reason": "", "salary": "", "techStack": "", "culture": "", "industry": ""}]`;
        break;

      case "company-discover":
        systemPrompt = `You are a career advisor specializing in tech infrastructure, DevOps, cloud, AI, and cybersecurity roles. Discover companies that match the candidate's skills, tech stack, and career goals. Focus on companies actively hiring in these domains.`;
        userPrompt = `${userContext}

${prompt || "Suggest companies that would be a good fit for me."}

Provide 8-10 companies. For each include:
- name: Company name
- industry: Industry/sector
- reason: Why it's a good fit (reference my specific skills and tech stack)
- website: Company careers or main website URL

Format strictly as JSON array: [{"name": "", "industry": "", "reason": "", "website": ""}]`;
        break;

      case "job-score":
        systemPrompt = `You are a job matching algorithm. Score how well a candidate matches a job posting. Be specific about what matches and what's missing.`;
        userPrompt = `${userContext}

${extra?.jobDescription ? `JOB DESCRIPTION:\n${extra.jobDescription}\n` : ""}
${extra?.jobTitle ? `JOB TITLE: ${extra.jobTitle}\n` : ""}${extra?.company ? `COMPANY: ${extra.company}\n` : ""}

Score this job match (0-100) and provide:
- Match score
- Matching skills/experience
- Missing requirements
- Recommendations to improve match

Format as JSON: {"score": 0, "matches": [], "gaps": [], "recommendations": []}`;
        break;

      default:
        systemPrompt = `You are CAREER CMD AI, a career assistant for infrastructure, DevOps, cloud, and AI professionals. Use the user's actual career data to provide personalized advice.`;
        userPrompt = `${userContext}\n\n${prompt}`;
    }

    const result = await callAIWithMessages(
      [{ role: "user", content: userPrompt }],
      systemPrompt,
      modelOverride
    );

    return NextResponse.json({ result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
