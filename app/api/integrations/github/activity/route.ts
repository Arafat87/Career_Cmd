import { NextResponse } from "next/server";
import { insertGithubActivity, getGithubActivity } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

const EVENT_LABELS: Record<string, string> = {
  PushEvent: "Pushed",
  PullRequestEvent: "PR",
  IssuesEvent: "Issue",
  CreateEvent: "Created",
  DeleteEvent: "Deleted",
  ForkEvent: "Forked",
  WatchEvent: "Starred",
  ReleaseEvent: "Release",
  IssueCommentEvent: "Comment",
  PullRequestReviewEvent: "Review",
};

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

    // Check if we have recent data (last 6 hours)
    const cached = getGithubActivity(username, userId, 100) as any[];
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const hasRecent = cached.length > 0 && cached[0]?.created_at > sixHoursAgo;

    if (!hasRecent) {
      // Fetch from GitHub Events API
      const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, {
        headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "CareerCMD/1.0" },
      });

      if (res.ok) {
        const events = await res.json();
        for (const evt of events as any[]) {
          const type = evt.type?.replace("Event", "") || "unknown";
          const repo = evt.repo?.name || "";
          const label = EVENT_LABELS[evt.type] || type;
          const title = `${label}: ${repo}`;
          const url = `https://github.com/${repo}`;

          insertGithubActivity({
            event_type: type,
            repo_name: repo,
            title,
            url,
            github_username: username,
            payload_json: JSON.stringify(evt.payload || {}),
            github_created_at: evt.created_at || new Date().toISOString(),
            user_id: userId,
          });
        }
      }
    }

    // Return from DB
    const activity = getGithubActivity(username, userId, 50);
    return NextResponse.json(activity);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
