"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";
import { fetchArray } from "@/lib/fetch-helpers";

// ─── Theme presets ───
const THEMES = {
  cyan: {
    label: "CYBERPUNK",
    primary: "#00F5FF",
    secondary: "#BF00FF",
    accent: "#00FF88",
    grid: "rgba(0,245,255,0.04)",
    border: "rgba(0,245,255,0.3)",
    muted: "#4A6274",
    bg: "#050508",
  },
  matrix: {
    label: "MATRIX",
    primary: "#00FF41",
    secondary: "#008F11",
    accent: "#39FF14",
    grid: "rgba(0,255,65,0.04)",
    border: "rgba(0,255,65,0.3)",
    muted: "#2A4A2A",
    bg: "#020A02",
  },
  synthwave: {
    label: "SYNTHWAVE",
    primary: "#FF2D95",
    secondary: "#B537F2",
    accent: "#FFD700",
    grid: "rgba(255,45,149,0.04)",
    border: "rgba(255,45,149,0.3)",
    muted: "#5A3A6A",
    bg: "#0A0510",
  },
  solar: {
    label: "SOLAR",
    primary: "#FFB000",
    secondary: "#FF6B00",
    accent: "#FF2D55",
    grid: "rgba(255,176,0,0.04)",
    border: "rgba(255,176,0,0.3)",
    muted: "#5A4A2A",
    bg: "#0A0802",
  },
  frost: {
    label: "FROST",
    primary: "#0088FF",
    secondary: "#00D4FF",
    accent: "#AAFFEE",
    grid: "rgba(0,136,255,0.04)",
    border: "rgba(0,136,255,0.3)",
    muted: "#3A5068",
    bg: "#030810",
  },
  crimson: {
    label: "CRIMSON",
    primary: "#FF2D55",
    secondary: "#FF6B6B",
    accent: "#FFD700",
    grid: "rgba(255,45,85,0.04)",
    border: "rgba(255,45,85,0.3)",
    muted: "#5A2A3A",
    bg: "#0A0305",
  },
};

type ThemeKey = keyof typeof THEMES;
type AspectKey = "16:9" | "1:1" | "9:16";

const ASPECTS: Record<AspectKey, { w: number; h: number; label: string }> = {
  "16:9": { w: 800, h: 450, label: "16:9 · LinkedIn / Twitter" },
  "1:1": { w: 600, h: 600, label: "1:1 · Instagram" },
  "9:16": { w: 450, h: 800, label: "9:16 · Stories" },
};

// ─── Milestone thresholds ───
function getMilestone(value: number, label: string): string | null {
  if (value >= 100) return `100+ ${label}!`;
  if (value >= 50) return `50+ ${label}`;
  if (value >= 25) return `25+ ${label}`;
  if (value >= 10) return `10+ ${label}`;
  return null;
}

export default function SharePage() {
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    offers: 0,
    certs: 0,
    projects: 0,
    skills: 0,
    activeApps: 0,
    passedCerts: 0,
  });
  const [topSkills, setTopSkills] = useState<string[]>([]);
  const [theme, setTheme] = useState<ThemeKey>("cyan");
  const [aspect, setAspect] = useState<AspectKey>("16:9");
  const [tagline, setTagline] = useState("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ─── Load data ───
  useEffect(() => {
    async function load() {
      const [apps, interviews, certs, projects, techstack] = await Promise.all([
        fetchArray("/api/applications"),
        fetchArray("/api/interviews"),
        fetchArray("/api/certifications"),
        fetchArray("/api/projects"),
        fetchArray("/api/techstack"),
      ]);

      const appsArr = apps as any[];
      const certsArr = certs as any[];
      const techArr = techstack as any[];

      setStats({
        applications: appsArr.length,
        interviews: (interviews as any[]).length,
        offers: appsArr.filter((a: any) => a.status === "OFFER").length,
        certs: certsArr.length,
        projects: (projects as any[]).length,
        skills: techArr.length,
        activeApps: appsArr.filter((a: any) =>
          ["APPLIED", "PHONE SCREEN", "INTERVIEW"].includes(a.status)
        ).length,
        passedCerts: certsArr.filter((c: any) => c.status === "PASSED").length,
      });

      // Top 8 skills by name
      setTopSkills(techArr.slice(0, 8).map((t: any) => t.name));
    }
    load();
  }, []);

  // ─── Canvas rendering (HiDPI) ───
  const generateCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const t = THEMES[theme];
    const { w, h } = ASPECTS[aspect];
    const dpr = 2; // HiDPI

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = t.grid;
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Border
    ctx.strokeStyle = t.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Corner brackets
    ctx.strokeStyle = t.primary;
    ctx.lineWidth = 3;
    const corners = [
      [10, 30, 10, 10, 30, 10],
      [w - 30, 10, w - 10, 10, w - 10, 30],
      [10, h - 30, 10, h - 10, 30, h - 10],
      [w - 30, h - 10, w - 10, h - 10, w - 10, h - 30],
    ];
    corners.forEach(([x1, y1, x2, y2, x3, y3]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.stroke();
    });

    // Title
    ctx.fillStyle = t.primary;
    ctx.font = "bold 26px monospace";
    ctx.textAlign = "center";
    ctx.shadowColor = t.primary;
    ctx.shadowBlur = 20;
    ctx.fillText("CAREER CMD", w / 2, 50);
    ctx.shadowBlur = 0;

    ctx.font = "10px monospace";
    ctx.fillStyle = t.muted;
    ctx.fillText("CAREER COMMAND CENTER", w / 2, 68);

    // ─── Stats row ───
    const statData = [
      { label: "APPLICATIONS", value: stats.applications, color: t.primary },
      { label: "INTERVIEWS", value: stats.interviews, color: t.secondary },
      { label: "OFFERS", value: stats.offers, color: t.accent },
      { label: "CERTIFICATIONS", value: stats.certs, color: "#FFD700" },
      { label: "PROJECTS", value: stats.projects, color: "#FF6B00" },
    ];

    const isWide = aspect === "16:9";
    const isTall = aspect === "9:16";
    const isSquare = aspect === "1:1";
    const statsPerRow = isTall ? 3 : isSquare ? 3 : 5;
    const statRows = Math.ceil(statData.length / statsPerRow);

    const statFontSize = isTall ? 22 : isSquare ? 24 : 30;
    const statLabelSize = isTall ? 6 : 7;
    const rowSpacing = isTall ? 55 : isSquare ? 60 : 70;
    const statsStartY = isWide ? 100 : 110;

    for (let row = 0; row < statRows; row++) {
      const slice = statData.slice(row * statsPerRow, (row + 1) * statsPerRow);
      const spacing = (w - 100) / slice.length;
      slice.forEach((s, i) => {
        const x = 50 + i * spacing + spacing / 2;
        const y = statsStartY + row * rowSpacing;

        // Glow
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = s.color;
        ctx.font = `bold ${statFontSize}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(String(s.value), x, y);
        ctx.shadowBlur = 0;

        ctx.fillStyle = t.muted;
        ctx.font = `${statLabelSize}px monospace`;
        ctx.fillText(s.label, x, y + statFontSize * 0.6);
      });
    }

    // ─── Milestone callouts (wrapped) ───
    let milestoneEndY = statsStartY + statRows * rowSpacing + 10;
    const milestones: string[] = [];
    const m1 = getMilestone(stats.applications, "APPS SENT");
    const m2 = getMilestone(stats.interviews, "INTERVIEWS");
    const m3 = getMilestone(stats.offers, "OFFERS");
    if (m1) milestones.push(m1);
    if (m2) milestones.push(m2);
    if (m3) milestones.push(m3);

    if (milestones.length > 0) {
      const mPadding = 25;
      const mGap = 10;
      const mMaxW = w - mPadding * 2;

      ctx.font = "bold 10px monospace";
      const mWidths = milestones.map((m) => ctx.measureText(m).width + 16);

      // Build rows of milestone indices
      const mRows: number[][] = [[]];
      let mRowW = 0;
      milestones.forEach((_, i) => {
        const mw = mWidths[i];
        const needed = mRows[mRows.length - 1].length === 0 ? mw : mGap + mw;
        if (mRowW + needed > mMaxW && mRows[mRows.length - 1].length > 0) {
          mRows.push([i]);
          mRowW = mw;
        } else {
          mRows[mRows.length - 1].push(i);
          mRowW += needed;
        }
      });

      let my = milestoneEndY;
      mRows.forEach((row) => {
        const rowMWidths = row.map((i) => mWidths[i]);
        const totalRowW = rowMWidths.reduce((a, b) => a + b, 0) + (row.length - 1) * mGap;
        let mx = (w - totalRowW) / 2;

        row.forEach((mIdx) => {
          const mw = mWidths[mIdx];
          ctx.fillStyle = `${t.primary}15`;
          ctx.strokeStyle = `${t.primary}60`;
          ctx.lineWidth = 1;
          roundRect(ctx, mx, my - 10, mw, 20, 4);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = t.primary;
          ctx.textAlign = "left";
          ctx.fillText(milestones[mIdx], mx + 8, my + 3);
          mx += mw + mGap;
        });
        my += 28;
      });
      milestoneEndY = my + 6;
    }

    // ─── Divider ───
    const divY = milestoneEndY;
    ctx.strokeStyle = `${t.primary}20`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, divY);
    ctx.lineTo(w - 40, divY);
    ctx.stroke();

    // ─── Top skills tags (wrapped rows) ───
    let skillsEndY = divY + 10;
    if (topSkills.length > 0) {
      const padding = 30;
      const maxW = w - padding * 2;
      const tagGap = 6;
      const tagH = 18;
      const tagColors = [t.primary, t.secondary, t.accent, "#FFD700", "#FF6B00", t.primary, t.secondary, t.accent];

      // Measure all tags first
      ctx.font = "bold 9px monospace";
      const tagWidths = topSkills.map((s) => ctx.measureText(s).width + 14);

      // Build rows of tag indices that fit within maxW
      const rows: number[][] = [[]];
      let rowW = 0;
      topSkills.forEach((_, i) => {
        const tw = tagWidths[i];
        const needed = rows[rows.length - 1].length === 0 ? tw : tagGap + tw;
        if (rowW + needed > maxW && rows[rows.length - 1].length > 0) {
          rows.push([i]);
          rowW = tw;
        } else {
          rows[rows.length - 1].push(i);
          rowW += needed;
        }
      });

      const sectionLabelY = divY + 20;
      ctx.font = "8px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = t.muted;
      ctx.fillText("TOP SKILLS", w / 2, sectionLabelY);

      let tagY = sectionLabelY + 12;
      ctx.font = "bold 9px monospace";

      rows.forEach((row) => {
        // Measure this row's total width
        const rowTagWidths = row.map((i) => tagWidths[i]);
        const totalRowW = rowTagWidths.reduce((a, b) => a + b, 0) + (row.length - 1) * tagGap;
        let tx = (w - totalRowW) / 2;

        row.forEach((skillIdx) => {
          const tw = tagWidths[skillIdx];
          const tc = tagColors[skillIdx % tagColors.length];

          ctx.fillStyle = `${tc}18`;
          ctx.strokeStyle = `${tc}50`;
          ctx.lineWidth = 1;
          roundRect(ctx, tx, tagY, tw, tagH, 3);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = tc;
          ctx.textAlign = "center";
          ctx.fillText(topSkills[skillIdx], tx + tw / 2, tagY + 13);
          tx += tw + tagGap;
        });

        tagY += tagH + 4;
      });

      skillsEndY = tagY + 4;
    }

    // ─── Tagline ───
    if (tagline.trim()) {
      const taglineY = skillsEndY + 16;
      ctx.font = "italic 11px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = `${t.primary}AA`;
      ctx.shadowColor = t.primary;
      ctx.shadowBlur = 8;
      ctx.fillText(`"${tagline}"`, w / 2, taglineY);
      ctx.shadowBlur = 0;
    }

    // ─── ASCII art decoration ───
    const asciiY = h - 80;
    ctx.fillStyle = `${t.primary}10`;
    ctx.font = "7px monospace";
    ctx.textAlign = "center";
    ctx.fillText("██████╗ █████╗ ██████╗ ███████╗███████╗██████╗", w / 2, asciiY);

    // ─── Footer ───
    ctx.fillStyle = t.muted;
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      `Generated ${new Date().toLocaleDateString()} · ${stats.skills} skills tracked · careercmd.app`,
      w / 2,
      h - 30
    );
  }, [stats, topSkills, theme, aspect, tagline]);

  useEffect(() => {
    generateCard();
  }, [generateCard]);

  // ─── Download PNG ───
  function downloadCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    generateCard();
    const link = document.createElement("a");
    link.download = `careercmd-${theme}-${aspect.replace(":", "x")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  // ─── Copy to clipboard ───
  async function copyCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    generateCard();
    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/png")
      );
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      downloadCard();
    }
  }

  // ─── Render ───
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">
          SHARE CARD
        </GlowText>
        <div className="flex gap-2">
          <button
            onClick={copyCard}
            className="px-3 py-1.5 bg-neon-purple/20 border border-neon-purple/30 rounded-lg font-mono text-xs text-neon-purple hover:bg-neon-purple/30 transition-colors"
          >
            {copied ? "COPIED!" : "COPY TO CLIPBOARD"}
          </button>
          <button
            onClick={downloadCard}
            className="px-3 py-1.5 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-xs text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
          >
            DOWNLOAD PNG
          </button>
        </div>
      </div>

      {/* Controls */}
      <Card hover={false} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Theme picker */}
        <div>
          <label className="block text-[10px] font-mono text-muted mb-2 tracking-widest">
            COLOR THEME
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(Object.keys(THEMES) as ThemeKey[]).map((key) => {
              const t = THEMES[key];
              const active = theme === key;
              return (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`px-2 py-1.5 rounded border font-mono text-[9px] tracking-wider transition-all ${
                    active
                      ? "border-current"
                      : "border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
                  }`}
                  style={{
                    color: t.primary,
                    backgroundColor: active ? `${t.primary}15` : "transparent",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect ratio */}
        <div>
          <label className="block text-[10px] font-mono text-muted mb-2 tracking-widest">
            ASPECT RATIO
          </label>
          <div className="flex gap-2">
            {(Object.keys(ASPECTS) as AspectKey[]).map((key) => {
              const active = aspect === key;
              return (
                <button
                  key={key}
                  onClick={() => setAspect(key)}
                  className={`flex-1 px-2 py-1.5 rounded border font-mono text-[9px] tracking-wider transition-all ${
                    active
                      ? "bg-neon-cyan/15 border-neon-cyan/50 text-neon-cyan"
                      : "border-[rgba(255,255,255,0.1)] text-muted hover:border-[rgba(255,255,255,0.2)]"
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>
          <p className="text-[8px] font-mono text-muted/60 mt-1">
            {ASPECTS[aspect].label}
          </p>
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-[10px] font-mono text-muted mb-2 tracking-widest">
            PERSONAL TAGLINE
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Building the future of infra"
            maxLength={60}
            className="w-full px-3 py-1.5 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded font-mono text-xs text-white placeholder:text-muted/40 focus:outline-none focus:border-neon-cyan/50 transition-colors"
          />
        </div>
      </Card>

      {/* Canvas preview */}
      <Card hover={false} className="flex justify-center p-8 overflow-auto">
        <canvas
          ref={canvasRef}
          className="rounded-lg border border-[rgba(0,245,255,0.1)]"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </Card>

      {/* Info */}
      <Card hover={false}>
        <p className="text-xs font-mono text-muted text-center">
          Download or copy the card and share on LinkedIn, Twitter, or with your
          network. Stats are pulled live from your CAREER CMD data.
        </p>
      </Card>
    </div>
  );
}

// ─── Helper: rounded rectangle ───
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
