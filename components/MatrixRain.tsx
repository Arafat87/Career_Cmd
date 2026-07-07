"use client";

import { useEffect, useRef } from "react";

export default function MatrixRain({ opacity = 0.05, speed = 1, className = "" }: { opacity?: number; speed?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";
    let columns: number[];
    let w: number;
    let h: number;

    function resize() {
      w = canvas!.width = canvas!.parentElement?.clientWidth || window.innerWidth;
      h = canvas!.height = canvas!.parentElement?.clientHeight || window.innerHeight;
      const colCount = Math.floor(w / 14);
      columns = Array.from({ length: colCount }, () => Math.random() * h / 14);
    }

    function draw() {
      if (!ctx) return;
      ctx.fillStyle = `rgba(5, 5, 8, 0.08)`;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = `rgba(0, 245, 255, ${opacity})`;
      ctx.font = "12px monospace";

      for (let i = 0; i < columns.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 14, columns[i] * 14);
        if (columns[i] * 14 > h && Math.random() > 0.975) {
          columns[i] = 0;
        }
        columns[i] += speed;
      }
      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [opacity, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    />
  );
}
