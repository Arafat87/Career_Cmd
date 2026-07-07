import { NextResponse } from "next/server";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || undefined;
    const categories = getCategories(scope, userId);
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const data = await request.json();
    const result = createCategory(data, userId);
    return NextResponse.json({ id: result.lastInsertRowid, ...data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const data = await request.json();
    const { id, ...rest } = data;
    updateCategory(id, rest, userId);
    return NextResponse.json({ id, ...rest });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    deleteCategory(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
