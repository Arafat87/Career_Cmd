# CAREER CMD — Career Command Center

A full-stack career management dashboard built with Next.js, SQLite, and multi-provider AI integration. Features a cyberpunk HUD interface with 48 pages, 41 API routes, and 30 database tables.

Available as a **web app** and **desktop app** (Windows & Linux via Electron).

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Electron](https://img.shields.io/badge/Electron-43-47848F?logo=electron)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)

## Features

- **Job Pipeline** — Track applications, saved jobs, referrals, networking contacts, companies
- **Interview Prep** — Question bank, flashcards, mock interviews, whiteboard
- **Growth Tracking** — Goals, career roadmap, certifications, projects, tech stack, learning paths
- **AI Assistant** — Context-aware chat using your career data, resume analysis, cover letter generation
- **Job RSS** — Dual-mode job search — target roles from your profile or custom search terms
- **Analytics** — Career score, gap analysis, activity heatmap, interview analytics
- **Data Export/Import** — Full JSON backup and restore of all your data

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Database:** SQLite via better-sqlite3
- **Auth:** NextAuth v5 beta (Google, GitHub, LinkedIn OAuth)
- **AI:** Multi-provider support (OpenAI, Anthropic, Google, Groq, OpenRouter, Ollama, custom)
- **Styling:** Tailwind CSS v4, Framer Motion
- **Desktop:** Electron (Windows .exe installer, Linux .AppImage / .deb)
- **Theme:** Cyberpunk HUD — neon glows, ElectricBorder, font-mono, zero white

## Quick Start

### Web

```bash
npm install
cp .env.example .env.local
npm run dev
# → http://localhost:3333
```

### Desktop (Electron)

```bash
# Dev mode — Next.js + Electron window
npm run electron:dev

# Build Windows installer (.exe)
npm run electron:build

# Build Linux packages (.AppImage, .deb) — requires Linux
npm run electron:build:linux
```

Output is in the `release/` directory.

### Cross-Platform Builds (CI)

Push a git tag to trigger automated builds for Windows and Linux via GitHub Actions:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The workflow builds on `windows-latest` and `ubuntu-latest`, then creates a GitHub Release with all installers.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXTAUTH_SECRET` | Yes | Random string for session encryption |
| `NEXTAUTH_URL` | No | Base URL (default: `http://localhost:3333`) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth |

AI provider keys are configured through the **Settings** page in the app.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Dev server on port 3333 |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |
| `npm run format` | Prettier |
| `npm run electron:dev` | Electron dev mode |
| `npm run electron:build` | Build Windows installer |
| `npm run electron:build:linux` | Build Linux packages |

## Project Structure

```
app/                  # Next.js App Router pages
  api/                # API routes (41 endpoints)
  (page groups)/      # Dashboard, pipeline, prep, growth, data, tools, integrations
components/           # React components (60+)
lib/                  # Shared utilities
  db.ts               # SQLite database layer
  ai.ts               # Multi-provider AI routing
  auth.ts             # NextAuth configuration
  validations.ts      # Zod schemas
  types.ts            # TypeScript interfaces
electron/             # Electron main process
scripts/              # Build scripts
.github/workflows/    # CI/CD (Electron builds)
```

## Docker

```bash
docker build -t careercmd .
docker run -p 3333:3333 careercmd
```

## License

MIT
