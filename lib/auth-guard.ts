import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function getUserId(): Promise<string> {
  const session = await auth();
  return session?.user?.email || "default";
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
