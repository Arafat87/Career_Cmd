import { NextResponse } from "next/server";

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Use DuckDuckGo HTML search
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const html = await response.text();

    // Parse results from DuckDuckGo HTML
    const results: SearchResult[] = [];

    // Match result blocks: <a class="result__a" href="...">title</a> followed by <a class="result__snippet">snippet</a>
    const resultBlocks = html.split(/class="result\s/);

    for (let i = 1; i < resultBlocks.length && results.length < 6; i++) {
      const block = resultBlocks[i];

      // Extract title
      const titleMatch = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/);
      const title = titleMatch
        ? titleMatch[1].replace(/<[^>]+>/g, "").trim()
        : "";

      // Extract URL
      const urlMatch = block.match(/class="result__a"[^>]*href="([^"]+)"/);
      let url = urlMatch ? urlMatch[1] : "";

      // Extract snippet
      const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
      const snippet = snippetMatch
        ? snippetMatch[1].replace(/<[^>]+>/g, "").trim()
        : "";

      // Clean up DuckDuckGo redirect URLs
      if (url.includes("uddg=")) {
        try {
          const urlParams = new URL(url, "https://duckduckgo.com");
          url = urlParams.searchParams.get("uddg") || url;
        } catch {
          // Keep original URL
        }
      }

      if (title && snippet) {
        results.push({ title, snippet, url });
      }
    }

    // Fallback: try simpler regex if structured parsing failed
    if (results.length === 0) {
      const linkRegex = /<a[^>]+class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
      const snippetRegex = /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

      const links: { url: string; title: string }[] = [];
      const snippets: string[] = [];

      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        let url = match[1];
        if (url.includes("uddg=")) {
          try {
            const urlParams = new URL(url, "https://duckduckgo.com");
            url = urlParams.searchParams.get("uddg") || url;
          } catch {}
        }
        links.push({
          url,
          title: match[2].replace(/<[^>]+>/g, "").trim(),
        });
      }

      while ((match = snippetRegex.exec(html)) !== null) {
        snippets.push(match[1].replace(/<[^>]+>/g, "").trim());
      }

      for (let i = 0; i < Math.min(links.length, snippets.length, 6); i++) {
        if (links[i].title && snippets[i]) {
          results.push({
            title: links[i].title,
            snippet: snippets[i],
            url: links[i].url,
          });
        }
      }
    }

    return NextResponse.json({ results, query });
  } catch (error: any) {
    console.error("Web search error:", error);
    return NextResponse.json(
      { error: error.message || "Search failed", results: [] },
      { status: 500 }
    );
  }
}
