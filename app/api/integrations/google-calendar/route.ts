import { NextResponse } from "next/server";
import { getOAuthToken, upsertOAuthToken, deleteOAuthToken, createCalendarEvent, getCalendarEventsCustom } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

// Google Calendar API base
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3333";
}

// GET — Return auth URL or connection status
export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Check if already connected
    const token = getOAuthToken("google_calendar", userId) as any;

    if (action === "status") {
      return NextResponse.json({
        connected: !!token?.access_token,
        expires_at: token?.expires_at || null,
      });
    }

    if (action === "disconnect") {
      deleteOAuthToken("google_calendar", userId);
      return NextResponse.json({ success: true });
    }

    // Return OAuth URL
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: "Google Calendar not configured. Set GOOGLE_CALENDAR_CLIENT_ID in .env.local" }, { status: 400 });
    }

    const redirectUri = `${getBaseUrl()}/api/integrations/google-calendar/callback`;
    const authUrl = `${GOOGLE_AUTH_URL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`;

    return NextResponse.json({ authUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST — Sync events from Google Calendar
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const token = getOAuthToken("google_calendar", userId) as any;

    if (!token?.access_token) {
      return NextResponse.json({ error: "Not connected to Google Calendar" }, { status: 400 });
    }

    // Check if token is expired and refresh if needed
    let accessToken = token.access_token;
    if (token.expires_at && new Date(token.expires_at) < new Date()) {
      const refreshed = await refreshAccessToken(token.refresh_token);
      if (refreshed) {
        accessToken = refreshed.access_token;
        upsertOAuthToken({
          provider: "google_calendar",
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token || token.refresh_token,
          expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
          scope: token.scope,
          user_id: userId,
        });
      } else {
        return NextResponse.json({ error: "Token expired. Please reconnect Google Calendar." }, { status: 401 });
      }
    }

    // Fetch events from Google Calendar (next 90 days)
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const calRes = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=100`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!calRes.ok) {
      const err = await calRes.json().catch(() => ({}));
      return NextResponse.json({ error: `Google API error: ${err.error?.message || calRes.status}` }, { status: calRes.status });
    }

    const calData = await calRes.json();
    const events = calData.items || [];

    // Upsert events into calendar_events table
    let synced = 0;
    for (const evt of events) {
      const date = evt.start?.date || evt.start?.dateTime?.substring(0, 10) || "";
      if (!date) continue;

      // Check if already synced
      const existing = getCalendarEventsCustom(userId) as any[];
      const alreadyExists = existing.some((e) => e.google_event_id === evt.id);
      if (alreadyExists) continue;

      createCalendarEvent({
        title: evt.summary || "Untitled Event",
        date,
        end_date: evt.end?.date || evt.end?.dateTime?.substring(0, 10) || "",
        source: "google",
        google_event_id: evt.id,
        color: "#4285F4", // Google blue
        description: evt.description || "",
        user_id: userId,
      });
      synced++;
    }

    return NextResponse.json({ synced, total: events.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) return null;
  return res.json();
}
