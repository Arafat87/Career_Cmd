import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory rate limiter: token bucket per IP
const rateLimit = new Map<string, { tokens: number; lastRefill: number }>();
const MAX_TOKENS = 30;
const REFILL_RATE = 1; // tokens per second
const WINDOW_MS = 1000;

function getRateLimitKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "127.0.0.1";
}

function checkRateLimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  let bucket = rateLimit.get(key);

  if (!bucket) {
    bucket = { tokens: MAX_TOKENS - 1, lastRefill: now };
    rateLimit.set(key, bucket);
    return { allowed: true, retryAfter: 0 };
  }

  // Refill tokens based on elapsed time
  const elapsed = (now - bucket.lastRefill) / WINDOW_MS;
  bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + elapsed * REFILL_RATE);
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    const retryAfter = Math.ceil((1 - bucket.tokens) / REFILL_RATE);
    return { allowed: false, retryAfter };
  }

  bucket.tokens -= 1;
  return { allowed: true, retryAfter: 0 };
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 5 * 60 * 1000;
  for (const [key, bucket] of rateLimit.entries()) {
    if (bucket.lastRefill < cutoff) rateLimit.delete(key);
  }
}, 5 * 60 * 1000);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit API routes (skip auth routes)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    const key = getRateLimitKey(request);
    const { allowed, retryAfter } = checkRateLimit(key);

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(MAX_TOKENS),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // Auth is optional during testing — no forced redirect
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // No-store for API responses
  if (pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
