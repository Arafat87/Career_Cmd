import { NextResponse } from "next/server";
import { getQuestions, getQuestionsByRole, createQuestion, updateQuestion, deleteQuestion, incrementQuestionPractice } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    const roleId = new URL(request.url).searchParams.get("role_id");
    if (roleId) return NextResponse.json(getQuestionsByRole(parseInt(roleId), userId));
    return NextResponse.json(getQuestions(userId));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const r = createQuestion(body, userId);
    return NextResponse.json({ id: r.lastInsertRowid, ...body });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const { id, ...rest } = await request.json();
    updateQuestion(id, rest, userId);
    return NextResponse.json({ id, ...rest });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function PATCH(request: Request) {
  try {
    const userId = await getUserId();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    incrementQuestionPractice(parseInt(id), userId);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    deleteQuestion(parseInt(id), userId);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
