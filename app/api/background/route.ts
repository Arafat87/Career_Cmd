import { NextResponse } from "next/server";
import { getBackground, upsertBackground } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

export async function GET() {
  const userId = await getUserId();
  const bg = getBackground(userId);
  return NextResponse.json(bg || {
    current_role: "", employment_status: "unemployed", years_experience: 0,
    education_level: "", industry_focus: "", bio: "", location: "",
    desired_salary_min: 0, desired_salary_max: 0,
  });
}

export async function POST(request: Request) {
  const userId = await getUserId();
  const body = await request.json();
  upsertBackground(body, userId);
  return NextResponse.json({ success: true });
}
