import { NextResponse } from "next/server";
import {
  getCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
} from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";
import { certificationSchema, validateRequest } from "@/lib/validations";

export async function GET() {
  try {
    const userId = await getUserId();
    const certifications = getCertifications(userId);
    return NextResponse.json(certifications);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch certifications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const data = await request.json();
    const validation = validateRequest(certificationSchema, data);
    if (!validation.success) return NextResponse.json({ error: validation.error }, { status: 400 });
    const result = createCertification(data, userId);
    return NextResponse.json({ id: result.lastInsertRowid, ...data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create certification" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const data = await request.json();
    const { id, ...rest } = data;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const validation = validateRequest(certificationSchema.partial(), rest);
    if (!validation.success) return NextResponse.json({ error: validation.error }, { status: 400 });
    updateCertification(id, rest, userId);
    return NextResponse.json({ id, ...rest });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update certification" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    deleteCertification(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete certification" }, { status: 500 });
  }
}
