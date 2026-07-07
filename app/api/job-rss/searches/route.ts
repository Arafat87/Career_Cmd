import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth-guard";
import { getJobSearches, deleteJobSearch } from "@/lib/db";

export async function GET() {
  try {
    const userId = await getUserId();
    const searches = getJobSearches(userId);
    return NextResponse.json(searches);
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
    deleteJobSearch(parseInt(id), userId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
