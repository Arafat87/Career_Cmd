import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth-guard";
import {
  getApplications,
  getCertifications,
  getProjects,
  getTechStack,
  getJobTitles,
  getNotes,
  getGoals,
  getCompanies,
  getInterviews,
  getQuestions,
  getSavedJobs,
  getReferrals,
  getNetworkingContacts,
  getLearningPaths,
  getDocuments,
  getPortfolioItems,
} from "@/lib/db";

export async function GET() {
  try {
    const userId = await getUserId();

    const data = {
      version: "1.0",
      exported_at: new Date().toISOString(),
      user_id: userId,
      applications: getApplications(userId),
      certifications: getCertifications(userId),
      projects: getProjects(userId),
      techstack: getTechStack(userId),
      jobtitles: getJobTitles(userId),
      notes: getNotes(userId),
      goals: getGoals(userId),
      companies: getCompanies(userId),
      interviews: getInterviews(userId),
      questions: getQuestions(userId),
      saved_jobs: getSavedJobs(userId),
      referrals: getReferrals(userId),
      networking_contacts: getNetworkingContacts(userId),
      learning_paths: getLearningPaths(userId),
      documents: getDocuments(userId),
      portfolio_items: getPortfolioItems(userId),
    };

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="careercmd-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
