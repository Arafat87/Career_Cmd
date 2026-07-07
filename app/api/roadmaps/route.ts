import { NextResponse } from "next/server";
import { getRoadmaps, createRoadmap, deleteRoadmap } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

export async function GET() {
  const userId = await getUserId();
  const roadmaps = getRoadmaps(userId) as any[];
  const parsed = roadmaps.map((r) => ({ ...r, phases: JSON.parse(r.phases_json || "[]") }));
  return NextResponse.json(parsed);
}

export async function POST(request: Request) {
  const userId = await getUserId();
  const body = await request.json();
  const result = createRoadmap(body, userId);
  return NextResponse.json({ id: result.lastInsertRowid, ...body });
}

export async function DELETE(request: Request) {
  const userId = await getUserId();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  deleteRoadmap(parseInt(id), userId);
  return NextResponse.json({ success: true });
}
