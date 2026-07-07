import { NextResponse } from "next/server";
import { getCareerScore } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

export async function GET() {
  try {
    const userId = await getUserId();
    return NextResponse.json(getCareerScore(userId));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
