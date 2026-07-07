import { NextResponse } from "next/server";
import { getGoals, createGoal, updateGoal, deleteGoal } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

export async function GET() {
  try {
    const userId = await getUserId();
    const goals = getGoals(userId);
    const parsed = goals.map((g: any) => ({ ...g, milestones: JSON.parse(g.milestones || "[]") }));
    return NextResponse.json(parsed);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const r = createGoal(body, userId);
    return NextResponse.json({ id: r.lastInsertRowid, ...body });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    updateGoal(id, rest, userId);
    return NextResponse.json({ id, ...rest });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    deleteGoal(parseInt(id), userId);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
