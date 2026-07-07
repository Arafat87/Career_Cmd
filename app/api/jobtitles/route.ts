import { NextResponse } from "next/server";
import { getJobTitles, createJobTitle, updateJobTitle, deleteJobTitle } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";
import { jobTitleSchema, validateRequest } from "@/lib/validations";

export async function GET() {
  try {
    const userId = await getUserId();
    return NextResponse.json(getJobTitles(userId));
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch job titles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const data = await request.json();
    const validation = validateRequest(jobTitleSchema, data);
    if (!validation.success) return NextResponse.json({ error: validation.error }, { status: 400 });
    const result = createJobTitle(data, userId);
    return NextResponse.json({ id: result.lastInsertRowid, ...data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create job title" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const data = await request.json();
    const { id, ...rest } = data;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const validation = validateRequest(jobTitleSchema.partial(), rest);
    if (!validation.success) return NextResponse.json({ error: validation.error }, { status: 400 });
    updateJobTitle(id, rest, userId);
    return NextResponse.json({ id, ...rest });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update job title" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    deleteJobTitle(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete job title" }, { status: 500 });
  }
}
