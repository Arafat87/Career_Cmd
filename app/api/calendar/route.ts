import { NextResponse } from "next/server";
import { getCalendarEvents, createCalendarEvent } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

export async function GET() {
  try {
    const userId = await getUserId();
    return NextResponse.json(getCalendarEvents(userId));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();

    if (!body.title || !body.date) {
      return NextResponse.json({ error: "title and date required" }, { status: 400 });
    }

    createCalendarEvent({
      title: body.title,
      date: body.date,
      end_date: body.end_date || "",
      description: body.description || "",
      color: body.color || "#00F5FF",
      user_id: userId,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
