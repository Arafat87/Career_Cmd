import { NextResponse } from "next/server";
import { getPortfolioItems, createPortfolioItem, updatePortfolioItem, deletePortfolioItem } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

export async function GET() {
  try {
    const userId = await getUserId();
    return NextResponse.json(getPortfolioItems(userId));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const r = createPortfolioItem(body, userId);
    return NextResponse.json({ id: r.lastInsertRowid, ...body });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const { id, ...rest } = await request.json();
    updatePortfolioItem(id, rest, userId);
    return NextResponse.json({ id, ...rest });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    deletePortfolioItem(parseInt(id), userId);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
