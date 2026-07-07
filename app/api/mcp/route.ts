import { NextResponse } from "next/server";
import "@/lib/mcp/init";
import { listServers } from "@/lib/mcp/registry";

export async function GET() {
  try {
    const servers = listServers().map((s) => ({
      name: s.name,
      description: s.description,
      icon: s.icon,
      color: s.color,
      toolCount: s.tools.length,
      tools: s.tools.map((t) => ({
        name: t.name,
        description: t.description,
        params: t.params,
      })),
    }));
    return NextResponse.json(servers);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
