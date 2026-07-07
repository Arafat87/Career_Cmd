import { NextResponse } from "next/server";
import { getSavedJobs, createSavedJob, updateSavedJob, deleteSavedJob } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

export async function GET() {
  try {
    const userId = await getUserId();
    return NextResponse.json(getSavedJobs(userId));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const r = createSavedJob(body, userId);
    return NextResponse.json({ id: r.lastInsertRowid, ...body });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const { id, ...rest } = await request.json();
    updateSavedJob(id, rest, userId);
    return NextResponse.json({ id, ...rest });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    deleteSavedJob(parseInt(id), userId);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
