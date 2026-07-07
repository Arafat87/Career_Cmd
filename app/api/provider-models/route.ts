import { NextResponse } from "next/server";
import { getProviderModels, createProviderModel, deleteProviderModel } from "@/lib/db";

// Provider models route is shared/global — not user-scoped

export async function GET(request: Request) {
  try {
    const provider = new URL(request.url).searchParams.get("provider");
    return NextResponse.json(getProviderModels(provider || undefined));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.provider?.trim() || !body.model_name?.trim()) return NextResponse.json({ error: "Provider and model name required" }, { status: 400 });
    createProviderModel({ provider: body.provider.trim().toLowerCase(), model_name: body.model_name.trim() });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    deleteProviderModel(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
