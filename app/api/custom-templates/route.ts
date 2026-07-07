import { NextResponse } from "next/server";
import { getCustomTemplates, createCustomTemplate, updateCustomTemplate, deleteCustomTemplate } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

export async function GET() {
  try {
    const userId = await getUserId();
    const templates = getCustomTemplates(userId);
    // Parse JSON fields
    const parsed = templates.map((t: any) => ({
      ...t,
      certs: JSON.parse(t.certs || "[]"),
      skills: JSON.parse(t.skills || "[]"),
      projects: JSON.parse(t.projects || "[]"),
      learning: JSON.parse(t.learning || "[]"),
    }));
    return NextResponse.json(parsed);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const r = createCustomTemplate(body, userId);
    return NextResponse.json({ id: r.lastInsertRowid, ...body });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    updateCustomTemplate(id, rest, userId);
    return NextResponse.json({ id, ...rest });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    deleteCustomTemplate(parseInt(id), userId);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
