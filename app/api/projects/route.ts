import { NextResponse } from "next/server";
import { getProjects, createProject, updateProject, deleteProject } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";
import { projectSchema, validateRequest } from "@/lib/validations";

export async function GET() {
  try {
    const userId = await getUserId();
    return NextResponse.json(getProjects(userId));
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const data = await request.json();
    const validation = validateRequest(projectSchema, data);
    if (!validation.success) return NextResponse.json({ error: validation.error }, { status: 400 });
    const result = createProject(data, userId);
    return NextResponse.json({ id: result.lastInsertRowid, ...data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const data = await request.json();
    const { id, ...rest } = data;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const validation = validateRequest(projectSchema.partial(), rest);
    if (!validation.success) return NextResponse.json({ error: validation.error }, { status: 400 });
    updateProject(id, rest, userId);
    return NextResponse.json({ id, ...rest });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    deleteProject(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
