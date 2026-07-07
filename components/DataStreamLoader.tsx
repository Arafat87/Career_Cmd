"use client";

import { useEffect, useState } from "react";

const CHARS = "0123456789ABCDEF".split("");

export default function DataStreamLoader({ lines = 8 }: { lines?: number }) {
  const [streams, setStreams] = useState<string[][]>([]);

  useEffect(() => {
    const initial = Array.from({ length: lines }, () =>
      Array.from({ length: 16 }, () => CHARS[Math.floor(Math.random() * CHARS.length)])
    );
    setStreams(initial);

    const interval = setInterval(() => {
      setStreams((prev) =>
        prev.map((line) =>
          line.map((char) =>
            Math.random() > 0.7 ? CHARS[Math.floor(Math.random() * CHARS.length)] : char
          )
        )
      );
    }, 100);

    return () => clearInterval(interval);
  }, [lines]);

  return (
    <div className="font-mono text-[10px] text-neon-cyan/40 space-y-0.5 overflow-hidden">
      {streams.map((line, i) => (
        <div key={i} className="whitespace-nowrap">
          {line.join(" ")}
        </div>
      ))}
      <div className="text-neon-cyan/20 mt-1">PROCESSING DATA STREAM...</div>
    </div>
  );
}
