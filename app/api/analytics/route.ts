import { NextResponse } from "next/server";
import { getAnalyticsData } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

export async function GET() {
  try {
    const userId = await getUserId();
    return NextResponse.json(getAnalyticsData(userId));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
