import { NextResponse } from "next/server";
import {
  getModelConfigs,
  createModelConfig,
  updateModelConfig,
  deleteModelConfig,
  setDefaultModel,
} from "@/lib/db";

// Settings route is shared/global — model configs are not user-scoped

export async function GET() {
  try {
    const configs = getModelConfigs();
    // Mask API keys in response
    const masked = (configs as any[]).map((c) => ({
      ...c,
      api_key: c.api_key ? "••••••••" : "",
    }));
    return NextResponse.json(masked);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch model configs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = createModelConfig(data);
    return NextResponse.json({ id: result.lastInsertRowid, ...data, api_key: "••••••••" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create model config" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...rest } = data;

    // Always update the config fields first
    updateModelConfig(id, rest);

    // If setting as default, also update the default flag
    if (rest.is_default) {
      setDefaultModel(id);
    }

    return NextResponse.json({ id, ...rest, api_key: rest.api_key ? "••••••••" : "" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update model config" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    deleteModelConfig(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete model config" }, { status: 500 });
  }
}
