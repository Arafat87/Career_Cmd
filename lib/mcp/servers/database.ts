import { McpServer, McpToolResult } from "../types";
import { registerServer } from "../registry";
import {
  getCareerScore,
  getGapAnalysis,
  getConversationContext,
  getCalendarEvents,
  getApplications,
  getSavedJobs,
  getTechStack,
  getCertifications,
  getNotifications,
  getDb,
} from "@/lib/db";

const databaseServer: McpServer = {
  name: "database",
  description: "Database access — query career data, generate reports, search records",
  icon: "DB",
  color: "#00FF88",
  tools: [
    {
      name: "db_career_summary",
      description: "Full career snapshot: skills, certs, applications, projects, career score",
      serverName: "database",
      params: [],
      handler: async (): Promise<McpToolResult> => {
        const score = getCareerScore("default") as any;
        const context = getConversationContext("default") as any;
        return {
          success: true, toolName: "db_career_summary", duration: 0,
          data: { score, profile: context },
        };
      },
    },
    {
      name: "db_gap_analysis",
      description: "Skills gap analysis — compares your skills against target job requirements",
      serverName: "database",
      params: [],
      handler: async (): Promise<McpToolResult> => {
        const gap = getGapAnalysis("default");
        return { success: true, toolName: "db_gap_analysis", duration: 0, data: gap };
      },
    },
    {
      name: "db_application_stats",
      description: "Application pipeline statistics — counts by status, timeline, companies",
      serverName: "database",
      params: [],
      handler: async (): Promise<McpToolResult> => {
        const apps = getApplications("default") as any[];
        const byStatus: Record<string, number> = {};
        const byMonth: Record<string, number> = {};
        const companies: Record<string, number> = {};
        for (const a of apps) {
          byStatus[a.status] = (byStatus[a.status] || 0) + 1;
          if (a.date_applied) {
            const month = a.date_applied.substring(0, 7);
            byMonth[month] = (byMonth[month] || 0) + 1;
          }
          companies[a.company] = (companies[a.company] || 0) + 1;
        }
        const topCompanies = Object.entries(companies).sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, count]) => ({ name, count }));
        return {
          success: true, toolName: "db_application_stats", duration: 0,
          data: { total: apps.length, byStatus, byMonth, topCompanies },
        };
      },
    },
    {
      name: "db_skill_inventory",
      description: "List all skills in your tech stack with categories and proficiency levels",
      serverName: "database",
      params: [],
      handler: async (): Promise<McpToolResult> => {
        const skills = getTechStack("default") as any[];
        const byCategory: Record<string, any[]> = {};
        for (const s of skills) {
          const cat = s.category || "Uncategorized";
          if (!byCategory[cat]) byCategory[cat] = [];
          byCategory[cat].push({ name: s.name, proficiency: s.proficiency_goal, image_url: s.image_url });
        }
        return {
          success: true, toolName: "db_skill_inventory", duration: 0,
          data: { total: skills.length, byCategory },
        };
      },
    },
    {
      name: "db_upcoming_events",
      description: "Interviews, reminders, deadlines, and cert expirations in the next 30 days",
      serverName: "database",
      params: [],
      handler: async (): Promise<McpToolResult> => {
        const events = getCalendarEvents("default");
        const now = new Date();
        const cutoff = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const upcoming = events.filter((e) => {
          const d = new Date(e.date);
          return d >= now && d <= cutoff;
        }).sort((a, b) => a.date.localeCompare(b.date));
        return { success: true, toolName: "db_upcoming_events", duration: 0, data: upcoming };
      },
    },
    {
      name: "db_search_records",
      description: "Search across all career tables for a keyword (applications, jobs, contacts, projects, notes)",
      serverName: "database",
      params: [
        { name: "query", type: "string", description: "Search keyword", required: true },
        { name: "tables", type: "string", description: "Comma-separated table names to search (default: all)" },
      ],
      handler: async (params): Promise<McpToolResult> => {
        const query = `%${params.query}%`;
        const d = getDb();
        const searchTables = (params.tables as string)?.split(",").map((t: string) => t.trim()) || [
          "applications", "saved_jobs", "networking_contacts", "projects", "notes", "companies", "referrals",
        ];
        const results: Record<string, any[]> = {};
        for (const table of searchTables) {
          try {
            const cols = d.prepare(`PRAGMA table_info(${table})`).all() as any[];
            const textCols = cols.filter((c: any) => c.type === "TEXT" && c.name !== "created_at" && c.name !== "user_id");
            if (textCols.length === 0) continue;
            const whereClauses = textCols.map((c: any) => `${c.name} LIKE ?`).join(" OR ");
            const rows = d.prepare(`SELECT * FROM ${table} WHERE user_id = 'default' AND (${whereClauses}) LIMIT 20`).all(...textCols.map(() => query));
            if (rows.length > 0) results[table] = rows;
          } catch {}
        }
        return { success: true, toolName: "db_search_records", duration: 0, data: results };
      },
    },
    {
      name: "db_top_matches",
      description: "Top saved jobs by match score",
      serverName: "database",
      params: [
        { name: "limit", type: "number", description: "Number of results", default: 10 },
      ],
      handler: async (params): Promise<McpToolResult> => {
        const limit = Number(params.limit) || 10;
        const jobs = getSavedJobs("default") as any[];
        const top = jobs
          .filter((j: any) => j.match_score > 0)
          .sort((a: any, b: any) => b.match_score - a.match_score)
          .slice(0, limit)
          .map((j: any) => ({ title: j.title, company: j.company, url: j.url, match_score: j.match_score, status: j.status, location: j.location }));
        return { success: true, toolName: "db_top_matches", duration: 0, data: top };
      },
    },
    {
      name: "db_notifications",
      description: "Active notifications — upcoming interviews, overdue follow-ups, expiring certs, project deadlines",
      serverName: "database",
      params: [],
      handler: async (): Promise<McpToolResult> => {
        const notifs = getNotifications("default");
        return { success: true, toolName: "db_notifications", duration: 0, data: notifs };
      },
    },
  ],
};

registerServer(databaseServer);
