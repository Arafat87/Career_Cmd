import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const username = new URL(request.url).searchParams.get("username");
    if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });

    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });

    if (!res.ok) return NextResponse.json({ error: "GitHub user not found" }, { status: 404 });

    const repos = await res.json();
    const formatted = repos.map((r: any) => ({
      name: r.name,
      description: r.description || "",
      language: r.language || "",
      stars: r.stargazers_count,
      url: r.html_url,
      homepage: r.homepage || "",
      updated_at: r.updated_at,
    }));

    return NextResponse.json(formatted);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
