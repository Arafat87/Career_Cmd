import { NextResponse } from "next/server";
import { getDefaultModel, getModelConfigs, createAssistantSession } from "@/lib/db";
import { callAIWithMessages } from "@/lib/ai";
import { getUserId } from "@/lib/auth-guard";

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const { text } = await request.json();
    if (!text?.trim()) return NextResponse.json({ error: "Text required" }, { status: 400 });

    const model = getDefaultModel() as any;
    const modelUsed = model ? `${model.provider}/${model.model_name}` : "none";

    const systemPrompt = `You are a LinkedIn profile parser. Extract structured data from the provided LinkedIn profile text.
Return ONLY valid JSON (no markdown, no code blocks) with this structure:
{
  "skills": ["skill1", "skill2"],
  "experience": [
    { "title": "Job Title", "company": "Company", "duration": "2020-2023", "description": "Brief description" }
  ],
  "education": [
    { "degree": "Degree", "school": "School", "year": "2020" }
  ],
  "certifications": ["cert1", "cert2"],
  "summary": "Brief professional summary"
}`;

    const result = await callAIWithMessages([{ role: "user", content: text }], systemPrompt);
    const parsed = JSON.parse(result);

    createAssistantSession({
      type: "linkedin_import",
      input_text: text.substring(0, 200),
      result_json: JSON.stringify(parsed),
      score: null,
      model_used: modelUsed,
    }, userId);

    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
