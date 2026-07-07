"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";

const COLORS = ["#00F5FF", "#BF00FF", "#00FF88", "#FF2D55", "#FFD700", "#FFFFFF"];
const TOOLS = [
  { id: "pen", label: "✏", name: "Pen" },
  { id: "rect", label: "▭", name: "Rectangle" },
  { id: "circle", label: "○", name: "Circle" },
  { id: "line", label: "╱", name: "Line" },
  { id: "text", label: "T", name: "Text" },
  { id: "eraser", label: "◻", name: "Eraser" },
];

const SHAPES = [
  { id: "server", label: "🖥", draw: (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.strokeRect(x - 20, y - 25, 40, 50);
    ctx.fillStyle = color; ctx.font = "10px monospace"; ctx.textAlign = "center";
    ctx.fillText("SERVER", x, y + 5);
  }},
  { id: "db", label: "🗄", draw: (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y - 15, 20, 8, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 20, y - 15); ctx.lineTo(x - 20, y + 15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 20, y - 15); ctx.lineTo(x + 20, y + 15); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y + 15, 20, 8, 0, 0, Math.PI); ctx.stroke();
    ctx.fillStyle = color; ctx.font = "9px monospace"; ctx.textAlign = "center";
    ctx.fillText("DB", x, y + 5);
  }},
  { id: "cloud", label: "☁", draw: (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x - 10, y, 12, Math.PI, 0);
    ctx.arc(x + 5, y - 5, 15, Math.PI * 1.2, Math.PI * 0.1);
    ctx.arc(x + 15, y, 10, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath(); ctx.stroke();
    ctx.fillStyle = color; ctx.font = "9px monospace"; ctx.textAlign = "center";
    ctx.fillText("CLOUD", x, y + 4);
  }},
  { id: "lb", label: "⚖", draw: (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = color; ctx.font = "9px monospace"; ctx.textAlign = "center";
    ctx.fillText("LB", x, y + 4);
  }},
  { id: "user", label: "👤", draw: (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y - 10, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y + 10, 15, Math.PI, 0); ctx.stroke();
  }},
];

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#00F5FF");
  const [lineWidth, setLineWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState<{ x: number; y: number } | null>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const historyRef = useRef<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width = parent?.clientWidth || 800;
    canvas.height = parent?.clientHeight || 600;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw grid
      ctx.strokeStyle = "rgba(0,245,255,0.03)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < canvas.width; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
      for (let y = 0; y < canvas.height; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
    }
  }, []);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (historyRef.current.length > 50) historyRef.current.shift();
  }, []);

  function undo() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || historyRef.current.length === 0) return;
    const state = historyRef.current.pop();
    if (state) ctx.putImageData(state, 0, 0);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    saveState();
    ctx.fillStyle = "#050508";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(0,245,255,0.03)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
  }

  function getPos(e: React.MouseEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handleMouseDown(e: React.MouseEvent) {
    const pos = getPos(e);
    if (tool === "text") {
      setTextPos(pos);
      return;
    }
    saveState();
    setIsDrawing(true);
    setStartPos(pos);
    lastPos.current = pos;
    if (tool === "pen" || tool === "eraser") {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = tool === "eraser" ? "#050508" : color;
      ctx.lineWidth = tool === "eraser" ? lineWidth * 5 : lineWidth;
      ctx.lineCap = "round";
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPos.current = pos;
    }
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (!isDrawing) return;
    setIsDrawing(false);
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (tool === "rect") {
      ctx.strokeStyle = color; ctx.lineWidth = lineWidth;
      ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
    } else if (tool === "circle") {
      const rx = Math.abs(pos.x - startPos.x) / 2;
      const ry = Math.abs(pos.y - startPos.y) / 2;
      const cx = (startPos.x + pos.x) / 2;
      const cy = (startPos.y + pos.y) / 2;
      ctx.strokeStyle = color; ctx.lineWidth = lineWidth;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (tool === "line") {
      ctx.strokeStyle = color; ctx.lineWidth = lineWidth;
      ctx.beginPath(); ctx.moveTo(startPos.x, startPos.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
    }
  }

  function addText() {
    if (!textInput.trim() || !textPos) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    saveState();
    ctx.fillStyle = color;
    ctx.font = `${lineWidth * 6}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText(textInput, textPos.x, textPos.y);
    setTextInput("");
    setTextPos(null);
  }

  function addShape(shapeId: string) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    saveState();
    const shape = SHAPES.find(s => s.id === shapeId);
    if (shape) shape.draw(ctx, 400, 300, color);
  }

  function exportCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "system-design.png";
    link.href = canvas.toDataURL();
    link.click();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">SYSTEM DESIGN WHITEBOARD</GlowText>
        <div className="flex gap-2">
          <button onClick={undo} className="px-2 py-1 text-[9px] font-mono text-muted border border-[rgba(0,245,255,0.1)] rounded hover:text-foreground">UNDO</button>
          <button onClick={clearCanvas} className="px-2 py-1 text-[9px] font-mono text-neon-red border border-neon-red/20 rounded hover:bg-neon-red/10">CLEAR</button>
          <button onClick={exportCanvas} className="px-2 py-1 text-[9px] font-mono text-neon-green border border-neon-green/20 rounded hover:bg-neon-green/10">EXPORT</button>
        </div>
      </div>

      {/* Toolbar */}
      <Card hover={false} className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-1">
          {TOOLS.map((t) => (
            <button key={t.id} onClick={() => setTool(t.id)} title={t.name}
              className={`w-8 h-8 rounded flex items-center justify-center text-sm ${tool === t.id ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "text-muted border border-[rgba(0,245,255,0.08)] hover:text-foreground"}`}>{t.label}</button>
          ))}
        </div>
        <div className="w-px h-6 bg-[rgba(0,245,255,0.1)]" />
        <div className="flex gap-1">
          {COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-white scale-110" : "border-transparent"}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="w-px h-6 bg-[rgba(0,245,255,0.1)]" />
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-muted">SIZE</span>
          <input type="range" min="1" max="8" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-20 accent-neon-cyan" />
        </div>
        <div className="w-px h-6 bg-[rgba(0,245,255,0.1)]" />
        <div className="flex gap-1">
          {SHAPES.map((s) => (
            <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
              className="w-8 h-8 rounded flex items-center justify-center text-sm text-muted border border-[rgba(0,245,255,0.08)] hover:text-foreground hover:border-neon-cyan/20">{s.label}</button>
          ))}
        </div>
      </Card>

      {/* Canvas */}
      <div className="relative border border-[rgba(0,245,255,0.1)] rounded-lg overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
        <canvas ref={canvasRef} className="cursor-crosshair"
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={() => setIsDrawing(false)} />
        {textPos && (
          <div className="absolute" style={{ left: textPos.x, top: textPos.y - 30 }}>
            <input value={textInput} onChange={(e) => setTextInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addText(); }}
              placeholder="Type text..." autoFocus
              className="bg-[#0a0a12] border border-neon-cyan/30 rounded px-2 py-1 text-xs font-mono text-foreground outline-none" />
          </div>
        )}
      </div>
    </div>
  );
}
