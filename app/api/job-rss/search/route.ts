import { NextResponse } from "next/server";
import { getJobTitles, getDefaultModel, getConversationContext, getJobRssFeeds } from "@/lib/db";
import { callAIWithWebSearch } from "@/lib/ai";
import { getUserId } from "@/lib/auth-guard";

export async function GET() {
  try {
    const userId = await getUserId();
    const { getJobSearches } = await import("@/lib/db");
    return NextResponse.json(getJobSearches(userId));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function extractDomains(urls: string[]): string[] {
  const domains: string[] = [];
  for (const url of urls) {
    try { domains.push(new URL(url).hostname); } catch {}
  }
  return [...new Set(domains)];
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const { mode, searchTerms, targetRoleIds, feedUrls } = await request.json();

    // Get monitored feed URLs (use provided or fetch from DB)
    const feedUrlList: string[] = feedUrls?.length ? feedUrls : (getJobRssFeeds() as any[]).map((f: any) => f.url).filter(Boolean);
    const feedDomains = extractDomains(feedUrlList);

    let queries: string[] = [];
    let searchDescription = "";

    if (mode === "targets") {
      const allTitles = getJobTitles(userId) as any[];
      const selected = targetRoleIds ? allTitles.filter((t: any) => targetRoleIds.includes(t.id)) : allTitles;
      if (selected.length === 0) return NextResponse.json({ error: "No target roles found" }, { status: 400 });

      queries = selected.map((t: any) => {
        const parts = [t.title];
        if (t.company) parts.push(t.company);
        if (t.location) parts.push(t.location);
        return parts.join(" ");
      });
      searchDescription = `Targets: ${selected.map((t: any) => t.title).join(", ")}`;
    } else if (mode === "feeds") {
      // Feeds-only mode: use feed URLs as the search scope
      if (feedDomains.length === 0) return NextResponse.json({ error: "No monitored feeds found. Add RSS feeds first." }, { status: 400 });
      if (!searchTerms?.length) {
        // If no search terms, use target roles as queries
        const allTitles = getJobTitles(userId) as any[];
        queries = allTitles.map((t: any) => t.title).slice(0, 5);
      } else {
        queries = searchTerms;
      }
      searchDescription = `Feeds: ${feedDomains.join(", ")} — ${queries.join(", ")}`;
    } else {
      if (!searchTerms?.length) return NextResponse.json({ error: "No search terms provided" }, { status: 400 });
      queries = searchTerms;
      searchDescription = `Custom: ${searchTerms.join(", ")}`;
    }

    // Get user profile for context-aware scoring
    const context = getConversationContext(userId);
    const model = getDefaultModel() as any;

    const profileLines: string[] = [];
    if (context.techStack?.length) profileLines.push(`Skills: ${context.techStack.map((t: any) => t.name).join(", ")}`);
    if (context.jobTitles?.length) profileLines.push(`Target Roles: ${context.jobTitles.map((j: any) => j.title).join(", ")}`);
    if (context.certifications?.length) profileLines.push(`Certifications: ${context.certifications.map((c: any) => c.name).join(", ")}`);
    const bg = context.background as any;
    if (bg?.summary) profileLines.push(`Background: ${bg.summary}`);
    const userProfile = profileLines.join("\n") || "No profile data available.";

    // Build search scope instructions based on mode
    let scopeInstruction = "";
    if (mode === "feeds" && feedDomains.length > 0) {
      scopeInstruction = `\n\nSEARCH SCOPE: Search ONLY on these specific websites:\n${feedDomains.map((d) => `- site:${d}`).join("\n")}\nDo NOT return results from any other websites.`;
    } else if (feedDomains.length > 0) {
      scopeInstruction = `\n\nPRIORITY SITES: Prioritize results from these websites when possible:\n${feedDomains.map((d) => `- ${d}`).join("\n")}`;
    }

    const systemPrompt = `You are a job search assistant. Search the web for CURRENT, ACTIVE job listings matching the user's query.

CRITICAL RULES:
- ONLY return job listings that you found via your web search with REAL, VERIFIED URLs
- Do NOT fabricate, guess, or construct URLs — only use URLs you actually found in search results
- Every URL must be a direct link to an actual job posting page (not a homepage or search page)
- If a URL looks suspicious or you cannot confirm it is a real job posting, EXCLUDE the listing entirely
- Only include jobs posted within the last 30 days that are currently accepting applications
- VERIFY each URL exists by checking your search results before including it
${scopeInstruction}

For each result found, extract:
- title: Job title
- company: Company name
- location: Location (or "Remote")
- url: The actual URL link to the job posting (must be a real, working, current URL)
- summary: Brief description of the role and why it matches the user

User Profile:
${userProfile}

Return ONLY a valid JSON object (no markdown, no code blocks) with this structure:
{
  "listings": [
    { "title": "...", "company": "...", "location": "...", "url": "https://...", "matchScore": 85, "summary": "..." }
  ]
}

The matchScore (0-100) should reflect how well the job matches the user's profile.
Find 5-10 relevant ACTIVE job listings per search query.`;

    // Run AI web search for each query (limit to 3 to control costs)
    const allListings: any[] = [];
    const seen = new Set<string>();

    for (const query of queries.slice(0, 3)) {
      try {
        const prompt = mode === "feeds" && feedDomains.length > 0
          ? `Search ONLY these sites for current, active job listings: ${feedDomains.join(", ")}\n\nFind current active listings for: ${query}\n\nRemember: only return listings that are currently accepting applications.`
          : `Find current, active job listings for: ${query}\n\nRemember: only return listings that are currently accepting applications. Exclude any expired or filled positions.`;

        const result = await callAIWithWebSearch(prompt, systemPrompt, model ? {
          provider: model.provider,
          model_name: model.model_name,
          api_key: model.api_key,
          base_url: model.base_url,
          temperature: 0.3,
          max_tokens: 4000,
        } : undefined);

        // Parse JSON from response
        const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const listings = parsed.listings || [];
          for (const listing of listings) {
            const key = (listing.title || "").toLowerCase().trim();
            if (key && !seen.has(key)) {
              seen.add(key);
              allListings.push(listing);
            }
          }
        }
      } catch (err) {
        console.error(`Search failed for query "${query}":`, err);
      }
    }

    // Validate URLs — check each is a real accessible page
    const validListings: typeof allListings = [];
    for (const l of allListings) {
      if (!l.url) continue;
      try {
        const u = new URL(l.url);
        if (!["http:", "https:"].includes(u.protocol)) continue;
        if (u.hostname === "localhost" || u.hostname === "example.com" || /^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)) continue;
        if (/google\.com\/search|bing\.com\/search|duckduckgo\.com/i.test(l.url)) continue;

        // Verify the URL is accessible and not a soft 404
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          const check = await fetch(l.url, {
            method: "GET",
            signal: controller.signal,
            redirect: "follow",
            headers: { "User-Agent": "Mozilla/5.0 (compatible; CareerCMD/1.0)" },
          });
          clearTimeout(timeout);

          if (!check.ok) continue;

          // Check for soft 404 by looking at response body
          const contentType = check.headers.get("content-type") || "";
          if (contentType.includes("text/html")) {
            const body = await check.text();
            const lowerBody = body.toLowerCase();
            // Common soft 404 indicators
            const isSoft404 =
              lowerBody.includes("page not found") ||
              lowerBody.includes("404") && (lowerBody.includes("not found") || lowerBody.includes("doesn't exist") || lowerBody.includes("no longer available")) ||
              lowerBody.includes("this job is no longer available") ||
              lowerBody.includes("position has been filled") ||
              lowerBody.includes("job has expired") ||
              lowerBody.includes("this posting has expired") ||
              lowerBody.includes("sorry, this job") ||
              lowerBody.includes("the page you're looking for") ||
              lowerBody.includes("we can't find the page");
            if (isSoft404) continue;
          }

          // URL passed all checks — keep the listing
          validListings.push({ ...l, _verified: true });
        } catch {
          // Network/timeout error — skip this listing
        }
      } catch {
        continue;
      }
    }

    // Sort by match score descending
    validListings.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    // Save search to history
    try {
      const { createJobSearch, updateJobSearchResults } = await import("@/lib/db");
      const search = createJobSearch({
        name: searchDescription.substring(0, 100),
        search_mode: mode,
        search_terms: queries.join(", "),
      }, userId) as any;
      if (search?.lastInsertRowid) updateJobSearchResults(search.lastInsertRowid, JSON.stringify({ count: validListings.length }));
    } catch {}

    return NextResponse.json({ listings: validListings, queryCount: queries.length });
  } catch (e: any) {
    console.error("Job search error:", e);
    return NextResponse.json({ error: e.message || "Search failed" }, { status: 500 });
  }
}
