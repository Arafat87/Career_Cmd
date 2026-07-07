import { McpServer, McpToolResult } from "../types";
import { registerServer } from "../registry";

const browserServer: McpServer = {
  name: "browser",
  description: "Browser tools — web scraping, URL validation, job board search, content extraction",
  icon: "BR",
  color: "#FF8C00",
  tools: [
    {
      name: "browser_fetch_page",
      description: "Fetch a web page and extract its text content (strips HTML tags)",
      serverName: "browser",
      params: [
        { name: "url", type: "string", description: "URL to fetch", required: true },
        { name: "max_length", type: "number", description: "Max characters to return", default: 5000 },
      ],
      handler: async (params): Promise<McpToolResult> => {
        const url = params.url as string;
        try { new URL(url); } catch { return { success: false, data: null, error: "Invalid URL", toolName: "browser_fetch_page", duration: 0 }; }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        try {
          const res = await fetch(url, {
            signal: controller.signal,
            redirect: "follow",
            headers: { "User-Agent": "Mozilla/5.0 (compatible; CareerCMD/1.0)" },
          });
          clearTimeout(timeout);
          if (!res.ok) return { success: false, data: null, error: `HTTP ${res.status}`, toolName: "browser_fetch_page", duration: 0 };

          const html = await res.text();
          const maxLen = Number(params.max_length) || 5000;
          // Strip HTML tags, scripts, styles
          let text = html
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, maxLen);

          return { success: true, toolName: "browser_fetch_page", duration: 0, data: { url, content: text, length: text.length } };
        } catch (e: any) {
          clearTimeout(timeout);
          return { success: false, data: null, error: e.message || "Fetch failed", toolName: "browser_fetch_page", duration: 0 };
        }
      },
    },
    {
      name: "browser_validate_url",
      description: "Check if a URL is accessible and not a soft 404 (fetches body and checks for error phrases)",
      serverName: "browser",
      params: [{ name: "url", type: "string", description: "URL to validate", required: true }],
      handler: async (params): Promise<McpToolResult> => {
        const url = params.url as string;
        try { new URL(url); } catch { return { success: true, data: { valid: false, reason: "Invalid URL format" }, toolName: "browser_validate_url", duration: 0 }; }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        try {
          const res = await fetch(url, {
            method: "GET",
            signal: controller.signal,
            redirect: "follow",
            headers: { "User-Agent": "Mozilla/5.0 (compatible; CareerCMD/1.0)" },
          });
          clearTimeout(timeout);

          if (!res.ok) return { success: true, data: { valid: false, reason: `HTTP ${res.status}` }, toolName: "browser_validate_url", duration: 0 };

          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("text/html")) {
            const body = (await res.text()).toLowerCase();
            const soft404 =
              body.includes("page not found") ||
              (body.includes("404") && (body.includes("not found") || body.includes("doesn't exist"))) ||
              body.includes("this job is no longer available") ||
              body.includes("position has been filled") ||
              body.includes("job has expired") ||
              body.includes("this posting has expired") ||
              body.includes("we can't find the page");
            if (soft404) return { success: true, data: { valid: false, reason: "Soft 404 detected" }, toolName: "browser_validate_url", duration: 0 };
          }

          return { success: true, data: { valid: true, status: res.status }, toolName: "browser_validate_url", duration: 0 };
        } catch (e: any) {
          clearTimeout(timeout);
          return { success: true, data: { valid: false, reason: e.message }, toolName: "browser_validate_url", duration: 0 };
        }
      },
    },
    {
      name: "browser_search_jobs",
      description: "Search job boards via DuckDuckGo — returns titles, URLs, and snippets",
      serverName: "browser",
      params: [
        { name: "query", type: "string", description: "Job search query", required: true },
        { name: "site", type: "string", description: "Site to search on", enum: ["linkedin.com/jobs", "indeed.com", "glassdoor.com", "dice.com", "builtin.com", "remoteok.com"], default: "linkedin.com/jobs" },
        { name: "max_results", type: "number", description: "Max results to return", default: 8 },
      ],
      handler: async (params): Promise<McpToolResult> => {
        const query = params.query as string;
        const site = (params.site as string) || "linkedin.com/jobs";
        const maxResults = Math.min(Number(params.max_results) || 8, 15);
        const searchQuery = `${query} site:${site}`;

        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
          const res = await fetch(searchUrl, {
            signal: controller.signal,
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
          });
          clearTimeout(timeout);
          if (!res.ok) throw new Error(`Search failed: ${res.status}`);

          const html = await res.text();
          const results: Array<{ title: string; url: string; snippet: string }> = [];
          const blocks = html.split(/class="result\s/);
          for (let i = 1; i < blocks.length && results.length < maxResults; i++) {
            const block = blocks[i];
            const titleMatch = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/);
            const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
            const urlMatch = block.match(/class="result__a"[^>]*href="([^"]+)"/);
            let url = urlMatch ? urlMatch[1] : "";
            if (url.includes("uddg=")) { try { url = decodeURIComponent(url.match(/uddg=([^&]+)/)?.[1] || url); } catch {} }
            const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
            const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, "").trim() : "";
            if (title && url) results.push({ title, url, snippet });
          }

          return { success: true, toolName: "browser_search_jobs", duration: 0, data: { query, site, results } };
        } catch (e: any) {
          clearTimeout(timeout);
          return { success: false, data: null, error: e.message, toolName: "browser_search_jobs", duration: 0 };
        }
      },
    },
    {
      name: "browser_extract_listing",
      description: "Fetch a job listing URL and extract structured data (title, company, location, description) using AI",
      serverName: "browser",
      params: [{ name: "url", type: "string", description: "Job listing URL", required: true }],
      handler: async (params): Promise<McpToolResult> => {
        const url = params.url as string;
        try { new URL(url); } catch { return { success: false, data: null, error: "Invalid URL", toolName: "browser_extract_listing", duration: 0 }; }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
          const res = await fetch(url, {
            signal: controller.signal,
            redirect: "follow",
            headers: { "User-Agent": "Mozilla/5.0 (compatible; CareerCMD/1.0)" },
          });
          clearTimeout(timeout);
          if (!res.ok) return { success: false, data: null, error: `HTTP ${res.status}`, toolName: "browser_extract_listing", duration: 0 };

          const html = await res.text();
          // Extract text content
          const text = html
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 3000);

          // Use AI to parse if available, otherwise return raw text
          try {
            const { callAIWithMessages } = await import("@/lib/ai");
            const systemPrompt = `Extract job listing details from the text. Return ONLY valid JSON:
{
  "title": "Job Title",
  "company": "Company Name",
  "location": "Location",
  "salary": "Salary range if mentioned",
  "type": "Full-time/Part-time/Contract/Remote",
  "description": "Brief job description (2-3 sentences)",
  "requirements": ["req1", "req2"],
  "url": "${url}"
}`;
            const result = await callAIWithMessages([{ role: "user", content: text }], systemPrompt);
            return { success: true, toolName: "browser_extract_listing", duration: 0, data: JSON.parse(result) };
          } catch {
            // Fallback to raw text if AI unavailable
            return { success: true, toolName: "browser_extract_listing", duration: 0, data: { url, raw_text: text.substring(0, 2000) } };
          }
        } catch (e: any) {
          clearTimeout(timeout);
          return { success: false, data: null, error: e.message, toolName: "browser_extract_listing", duration: 0 };
        }
      },
    },
    {
      name: "browser_company_info",
      description: "Scrape a company website's about page and extract key information",
      serverName: "browser",
      params: [
        { name: "url", type: "string", description: "Company website URL", required: true },
      ],
      handler: async (params): Promise<McpToolResult> => {
        const url = params.url as string;
        try { new URL(url); } catch { return { success: false, data: null, error: "Invalid URL", toolName: "browser_company_info", duration: 0 }; }

        // Try common about page paths
        const aboutPaths = ["/about", "/about-us", "/company", "/"];
        let text = "";
        for (const path of aboutPaths) {
          try {
            const aboutUrl = new URL(path, url).href;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(aboutUrl, {
              signal: controller.signal,
              redirect: "follow",
              headers: { "User-Agent": "Mozilla/5.0 (compatible; CareerCMD/1.0)" },
            });
            clearTimeout(timeout);
            if (res.ok) {
              const html = await res.text();
              text = html
                .replace(/<script[\s\S]*?<\/script>/gi, "")
                .replace(/<style[\s\S]*?<\/style>/gi, "")
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .substring(0, 3000);
              if (text.length > 200) break;
            }
          } catch {}
        }

        if (!text) return { success: false, data: null, error: "Could not fetch company info", toolName: "browser_company_info", duration: 0 };

        try {
          const { callAIWithMessages } = await import("@/lib/ai");
          const systemPrompt = `Extract company information from the website text. Return ONLY valid JSON:
{
  "name": "Company Name",
  "description": "What the company does",
  "industry": "Industry",
  "size": "Company size if mentioned",
  "location": "Headquarters or locations",
  "tech_stack": ["tech1", "tech2"],
  "culture": "Culture values mentioned",
  "products": ["product1", "product2"]
}`;
          const result = await callAIWithMessages([{ role: "user", content: text }], systemPrompt);
          return { success: true, toolName: "browser_company_info", duration: 0, data: JSON.parse(result) };
        } catch {
          return { success: true, toolName: "browser_company_info", duration: 0, data: { url, raw_text: text.substring(0, 2000) } };
        }
      },
    },
    {
      name: "browser_salary_lookup",
      description: "Search for market salary data by role and location using web search (Levels.fyi, Glassdoor)",
      serverName: "browser",
      params: [
        { name: "role", type: "string", description: "Job role/title (e.g., 'DevOps Engineer')", required: true },
        { name: "location", type: "string", description: "Location (e.g., 'Remote', 'New York')", default: "Remote" },
      ],
      handler: async (params): Promise<McpToolResult> => {
        const role = params.role as string;
        const location = (params.location as string) || "Remote";
        const searchQuery = `${role} salary ${location} site:levels.fyi OR site:glassdoor.com`;

        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
          const res = await fetch(searchUrl, {
            signal: controller.signal,
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
          });
          clearTimeout(timeout);
          if (!res.ok) throw new Error(`Search failed: ${res.status}`);

          const html = await res.text();
          const results: Array<{ title: string; url: string; snippet: string }> = [];
          const blocks = html.split(/class="result\s/);
          for (let i = 1; i < blocks.length && results.length < 5; i++) {
            const block = blocks[i];
            const titleMatch = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/);
            const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
            const urlMatch = block.match(/class="result__a"[^>]*href="([^"]+)"/);
            let url = urlMatch ? urlMatch[1] : "";
            if (url.includes("uddg=")) { try { url = decodeURIComponent(url.match(/uddg=([^&]+)/)?.[1] || url); } catch {} }
            const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
            const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, "").trim() : "";
            if (title && url) results.push({ title, url, snippet });
          }

          // Try to extract salary numbers from snippets
          const salaryPattern = /\$[\d,]+(?:\s*-\s*\$[\d,]+)?/g;
          const extractedSalaries: string[] = [];
          for (const r of results) {
            const matches = r.snippet.match(salaryPattern);
            if (matches) extractedSalaries.push(...matches);
          }

          return {
            success: true,
            toolName: "browser_salary_lookup",
            duration: 0,
            data: { role, location, results, extracted_salaries: extractedSalaries },
          };
        } catch (e: any) {
          clearTimeout(timeout);
          return { success: false, data: null, error: e.message, toolName: "browser_salary_lookup", duration: 0 };
        }
      },
    },
  ],
};

registerServer(browserServer);
