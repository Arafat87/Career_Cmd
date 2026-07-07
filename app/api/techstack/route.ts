import { NextResponse } from "next/server";
import {
  getTechStack,
  createTechItem,
  updateTechItem,
  deleteTechItem,
} from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

export async function GET() {
  try {
    const userId = await getUserId();
    const techStack = getTechStack(userId);
    return NextResponse.json(techStack);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tech stack" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const data = await request.json();
    const result = createTechItem(data, userId);
    return NextResponse.json({ id: result.lastInsertRowid, ...data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create tech item" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const data = await request.json();
    const { id, ...rest } = data;
    updateTechItem(id, rest, userId);
    return NextResponse.json({ id, ...rest });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update tech item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    deleteTechItem(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete tech item" }, { status: 500 });
  }
}
