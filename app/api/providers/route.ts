import { NextResponse } from "next/server";
import { getCustomProviders, createCustomProvider, deleteCustomProvider } from "@/lib/db";

// Providers route is shared/global — custom providers are not user-scoped

export async function GET() {
  try { return NextResponse.json(getCustomProviders()); } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
    createCustomProvider({ name: body.name.trim().toLowerCase(), base_url: body.base_url || "", api_key: body.api_key || "" });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.message?.includes("UNIQUE")) return NextResponse.json({ error: "Provider already exists" }, { status: 409 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    deleteCustomProvider(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
