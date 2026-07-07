import { NextResponse } from "next/server";
import { getMcpServerStats, toggleMcpServer, upsertMcpServer } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

export async function GET() {
  try {
    const userId = await getUserId();
    return NextResponse.json(getMcpServerStats(userId));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "toggle") {
      if (!body.name) return NextResponse.json({ error: "name required" }, { status: 400 });
      toggleMcpServer(body.name, body.enabled ? 1 : 0);
      return NextResponse.json({ success: true });
    }

    if (body.action === "upsert") {
      if (!body.name) return NextResponse.json({ error: "name required" }, { status: 400 });
      upsertMcpServer({ name: body.name, description: body.description || "", enabled: body.enabled ?? 1 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
