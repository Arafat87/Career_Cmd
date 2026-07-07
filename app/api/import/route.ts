import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();

    if (!body.data || !body.version) {
      return NextResponse.json({ error: "Invalid export file format" }, { status: 400 });
    }

    const db = getDb();
    let imported = 0;

    const tableColumns: Record<string, string[]> = {
      applications: ["company", "position", "status", "date_applied", "location", "salary_min", "salary_max", "notes", "url", "category", "interview_date"],
      certifications: ["name", "category", "status", "expiration_date", "exam_date", "price", "notes", "icon"],
      projects: ["name", "description", "status", "technologies", "category", "deadline", "goal", "notes", "icon"],
      techstack: ["name", "category", "proficiency_goal", "image_url"],
      jobtitles: ["title", "company", "category", "location", "salary_min", "salary_max", "description", "tech_stack", "icon"],
      reminders: ["title", "date", "time", "category", "color", "notes"],
      notes: ["title", "content", "pinned"],
      saved_jobs: ["title", "company", "url", "location", "salary_min", "salary_max", "description", "category", "match_score", "status", "date_saved", "notes"],
      referrals: ["contact_name", "contact_email", "company", "position", "status", "date_referred", "notes", "referral_url"],
      networking_contacts: ["name", "company", "position", "email", "linkedin", "phone", "status", "last_contact", "next_follow_up", "notes", "category"],
      interviews: ["company", "position", "date", "time", "type", "status", "notes", "feedback", "location"],
      questions: ["question", "answer", "category", "role_id", "difficulty", "times_practiced", "last_practiced", "notes"],
      goals: ["title", "description", "category", "status", "priority", "deadline", "milestones"],
      companies: ["name", "industry", "career_page", "notes", "status", "rating", "glassdoor", "tech_stack", "salary_range", "logo", "color"],
      learning_paths: ["name", "provider", "url", "category", "status", "progress", "priority", "notes"],
      documents: ["name", "type", "content", "category"],
      portfolio_items: ["title", "description", "url", "image_url", "category", "technologies", "featured"],
      roadmaps: ["title", "description", "phases_json", "color"],
      user_background: ["headline", "summary", "years_experience", "education", "location", "linkedin", "github", "website"],
    };

    for (const [table, rows] of Object.entries(body.data)) {
      const columns = tableColumns[table];
      if (!columns || !Array.isArray(rows)) continue;

      for (const row of rows) {
        try {
          const values = columns.map((c) => row[c] ?? "");
          const placeholders = columns.map(() => "?").join(", ");
          db.prepare(`INSERT OR IGNORE INTO ${table} (${columns.join(", ")}, user_id) VALUES (${placeholders}, ?)`)
            .run(...values, userId);
          imported++;
        } catch {}
      }
    }

    return NextResponse.json({ success: true, imported });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
