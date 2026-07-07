"use client";

import { useEffect, useState } from "react";

const CHARS = "01ABCDEF0123456789";

export default function DataStreamHeader({ speed = 80 }: { speed?: number }) {
  const [stream, setStream] = useState("");

  useEffect(() => {
    const len = 120;
    let interval: NodeJS.Timeout;

    function generate() {
      let s = "";
      for (let i = 0; i < len; i++) {
        s += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      return s;
    }

    setStream(generate());
    interval = setInterval(() => {
      setStream((prev) => {
        const arr = prev.split("");
        const count = 3 + Math.floor(Math.random() * 5);
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * arr.length);
          arr[idx] = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        return arr.join("");
      });
    }, speed);

    return () => clearInterval(interval);
  }, [speed]);

  return (
    <div className="w-full overflow-hidden font-mono text-[9px] tracking-[0.3em] text-neon-cyan/20 select-none whitespace-nowrap">
      {stream}
    </div>
  );
}
