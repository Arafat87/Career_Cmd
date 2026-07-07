import { NextResponse } from "next/server";
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

export async function GET() {
  try {
    const userId = await getUserId();
    const reminders = getReminders(userId);
    return NextResponse.json(reminders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const data = await request.json();
    const result = createReminder(data, userId);
    return NextResponse.json({ id: result.lastInsertRowid, ...data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const data = await request.json();
    const { id, ...rest } = data;
    updateReminder(id, rest, userId);
    return NextResponse.json({ id, ...rest });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    deleteReminder(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete reminder" }, { status: 500 });
  }
}
