import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import {
  getApplications, getCertifications, getProjects, getTechStack,
  getJobTitles, getBackground,
} from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";
import PdfResume from "@/components/PdfResume";

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const sectionsParam = searchParams.get("sections") || "skills,certifications,projects,targets,applications";
    const sections = sectionsParam.split(",");

    const background = getBackground(userId) as any || {};
    const jobTitles = getJobTitles(userId) as any[];
    const certifications = getCertifications(userId) as any[];
    const projects = getProjects(userId) as any[];
    const techStack = getTechStack(userId) as any[];
    const applications = getApplications(userId) as any[];

    const pdfBuffer = await renderToBuffer(
      React.createElement(PdfResume, {
        data: { background, jobTitles, certifications, projects, techStack, applications, sections },
      }) as any
    );

    const today = new Date().toISOString().split("T")[0];
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="careercmd-resume-${today}.pdf"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
