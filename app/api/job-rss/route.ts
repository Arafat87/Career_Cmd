import { NextResponse } from "next/server";
import { getJobRssFeeds, createJobRssFeed, deleteJobRssFeed, updateJobRssFeedScan } from "@/lib/db";

// Job RSS feeds route is shared/global — not user-scoped

export async function GET() {
  try { return NextResponse.json(getJobRssFeeds()); } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name?.trim() || !body.url?.trim()) return NextResponse.json({ error: "Name and URL required" }, { status: 400 });
    createJobRssFeed({ name: body.name.trim(), url: body.url.trim() });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    updateJobRssFeedScan(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    deleteJobRssFeed(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
