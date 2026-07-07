import { NextResponse } from "next/server";
import "@/lib/mcp/init";
import { callTool } from "@/lib/mcp/registry";
import { getUserId } from "@/lib/auth-guard";

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const { toolName, params } = await request.json();

    if (!toolName) {
      return NextResponse.json({ error: "toolName is required" }, { status: 400 });
    }

    const result = await callTool(toolName, params || {}, userId);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
