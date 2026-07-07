import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    // Test database connection
    const db = getDb();
    const result = db.prepare("SELECT datetime('now') as now").get() as any;

    return NextResponse.json({
      status: "ok",
      timestamp: result?.now || new Date().toISOString(),
      version: "0.1.0",
      db: "connected",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", timestamp: new Date().toISOString(), db: "disconnected", error: error.message },
      { status: 503 }
    );
  }
}
