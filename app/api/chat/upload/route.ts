import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "chat");
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "text/plain", "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfParseModule: any = await import("pdf-parse");
    const parse = pdfParseModule.default || pdfParseModule;
    const data = await parse(buffer);
    return data.text || "";
  } catch {
    return "";
  }
}

async function extractTextFile(buffer: Buffer): Promise<string> {
  try {
    return buffer.toString("utf-8").substring(0, 10000); // Limit to 10k chars
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = path.extname(file.name) || ".bin";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const url = `/uploads/chat/${uniqueName}`;

    // Extract text content for readable file types
    let extractedText = "";
    if (file.type === "application/pdf") {
      extractedText = await extractPdfText(buffer);
    } else if (file.type === "text/plain" || file.type === "text/csv") {
      extractedText = await extractTextFile(buffer);
    }

    return NextResponse.json({
      url,
      name: file.name,
      size: file.size,
      type: file.type.startsWith("image/") ? "image" : "file",
      extractedText: extractedText || undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
