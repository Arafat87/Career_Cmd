import { NextResponse } from "next/server";
import { getSalaryCache, upsertSalaryCache } from "@/lib/db";
import { callTool } from "@/lib/mcp/registry";
import "@/lib/mcp/init";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const location = searchParams.get("location") || "Remote";
    if (!role) return NextResponse.json({ error: "role required" }, { status: 400 });

    // Check cache (24h TTL)
    const cached = getSalaryCache(role, location) as any;
    if (cached) {
      const fetchedAt = new Date(cached.fetched_at).getTime();
      const hoursSince = (Date.now() - fetchedAt) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        return NextResponse.json(JSON.parse(cached.data_json));
      }
    }

    // Fetch fresh data via MCP browser tool
    const result = await callTool("browser_salary_lookup", { role, location });

    if (result.success && result.data) {
      // Cache the result
      upsertSalaryCache({
        role,
        location,
        data_json: JSON.stringify(result.data),
      });
    }

    return NextResponse.json(result.data || { error: result.error });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
