// Shared AI job scoring utility
import { callAIWithMessages } from "./ai";
import { getConversationContext, getDefaultModel } from "./db";

export interface ScoredJob {
  title: string;
  company: string;
  location: string;
  matchScore: number;
  summary: string;
  url: string;
}

export async function scoreJobsWithAI(
  jobs: Array<{ title: string; snippet: string; url: string }>,
  userId: string = "default"
): Promise<ScoredJob[]> {
  const context = getConversationContext(userId);
  const model = getDefaultModel() as any;

  const contextLines: string[] = [];
  if (context.jobTitles?.length) {
    contextLines.push("TARGET ROLES:");
    context.jobTitles.forEach((j: any) => contextLines.push(`- ${j.title} at ${j.company || "N/A"} (${j.location || "N/A"})`));
  }
  if (context.techStack?.length) {
    contextLines.push("SKILLS:");
    context.techStack.forEach((t: any) => contextLines.push(`- ${t.name} (${t.category})`));
  }

  const systemPrompt = `You are a job match analyzer. Given a list of job search results and the user's career profile, score each job's relevance.

USER PROFILE:
${contextLines.join("\n") || "No profile data available."}

For each job, provide:
- title: cleaned job title
- company: company name (extract from snippet if possible)
- location: location if available
- matchScore: 0-100 relevance score
- summary: one-line summary of why it matches (or doesn't)

Return ONLY valid JSON array: [{"title":"...","company":"...","location":"...","matchScore":85,"summary":"..."}]`;

  const jobList = jobs.map((j, i) => `${i + 1}. ${j.title}\n   ${j.snippet}\n   URL: ${j.url}`).join("\n\n");

  try {
    const response = await callAIWithMessages(
      [{ role: "user", content: `Score these job results:\n\n${jobList}` }],
      systemPrompt,
      model ? {
        provider: model.provider,
        model_name: model.model_name,
        api_key: model.api_key,
        base_url: model.base_url,
        temperature: 0.3,
        max_tokens: 2000,
      } : undefined
    );

    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const scored = JSON.parse(cleaned);

    return scored.map((s: any, i: number) => ({
      title: s.title || jobs[i]?.title || "",
      company: s.company || "",
      location: s.location || "",
      matchScore: s.matchScore || 0,
      summary: s.summary || "",
      url: jobs[i]?.url || "",
    }));
  } catch {
    // Fallback: return unscored results
    return jobs.map((j) => ({
      title: j.title,
      company: "",
      location: "",
      matchScore: 0,
      summary: j.snippet.substring(0, 100),
      url: j.url,
    }));
  }
}
