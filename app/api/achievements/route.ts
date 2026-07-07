import { NextResponse } from "next/server";
import { getAchievementData } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

export async function GET() {
  try {
    const userId = await getUserId();
    return NextResponse.json(getAchievementData(userId));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
