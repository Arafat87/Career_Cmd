import { NextResponse } from "next/server";
import { upsertOAuthToken } from "@/lib/db";
import { getUserId } from "@/lib/auth-guard";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3333";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(`${getBaseUrl()}/calendar?error=${encodeURIComponent(error)}`);
    }
    if (!code) {
      return NextResponse.redirect(`${getBaseUrl()}/calendar?error=no_code`);
    }

    const userId = await getUserId();
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${getBaseUrl()}/calendar?error=not_configured`);
    }

    const redirectUri = `${getBaseUrl()}/api/integrations/google-calendar/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${getBaseUrl()}/calendar?error=token_exchange_failed`);
    }

    const tokenData = await tokenRes.json();

    upsertOAuthToken({
      provider: "google_calendar",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || "",
      expires_at: new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString(),
      scope: tokenData.scope || "",
      user_id: userId,
    });

    return NextResponse.redirect(`${getBaseUrl()}/calendar?connected=true`);
  } catch (e: any) {
    return NextResponse.redirect(`${getBaseUrl()}/calendar?error=${encodeURIComponent(e.message)}`);
  }
}
