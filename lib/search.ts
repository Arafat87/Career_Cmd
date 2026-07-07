// Shared search utility — uses AI web search for job results

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

// This module is kept for backward compatibility with app/api/web-search/route.ts
// The Job RSS search now uses AI-native web search via lib/ai.ts callAIWithWebSearch()
