import { NextResponse } from "next/server";
import { getApplications, getApplication, createApplication, updateApplication, deleteApplication } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";
import { applicationSchema, validateRequest } from "@/lib/validations";

export async function GET() {
  try {
    const userId = await getUserId();
    return NextResponse.json(getApplications(userId));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const validation = validateRequest(applicationSchema, body);
    if (!validation.success) return NextResponse.json({ error: validation.error }, { status: 400 });
    const result = createApplication(body, userId);
    return NextResponse.json({ id: result.lastInsertRowid, ...body });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const validation = validateRequest(applicationSchema.partial(), rest);
    if (!validation.success) return NextResponse.json({ error: validation.error }, { status: 400 });
    updateApplication(id, rest, userId);
    return NextResponse.json({ id, ...rest });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    deleteApplication(parseInt(id), userId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
