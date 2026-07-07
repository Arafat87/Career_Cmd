"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";

interface SoundContextType {
  enabled: boolean;
  toggle: () => void;
  play: (sound: "click" | "whoosh" | "success" | "error" | "notify") => void;
}

const SoundContext = createContext<SoundContextType>({ enabled: false, toggle: () => {}, play: () => {} });

export function useSound() {
  return useContext(SoundContext);
}

// Generate sounds using Web Audio API (no external files needed)
function createSound(type: string, ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  switch (type) {
    case "click":
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
      break;
    case "whoosh":
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    case "success":
      osc.type = "sine";
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.1);
      osc.frequency.setValueAtTime(784, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
      break;
    case "error":
      osc.type = "square";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.setValueAtTime(150, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    case "notify":
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1100, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
      break;
  }
}

export default function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("hireops_sounds");
    if (saved === "on") setEnabled(true);
  }, []);

  // Get or create AudioContext
  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const play = useCallback((sound: "click" | "whoosh" | "success" | "error" | "notify") => {
    if (!enabled) return;
    try {
      createSound(sound, getCtx());
    } catch {}
  }, [enabled, getCtx]);

  // Global sound triggers on UI interactions
  useEffect(() => {
    if (!enabled) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const el = target.closest("button, a, [role='button']");
      if (!el) return;

      // Determine sound type based on element
      if (el.classList.contains("sound-success") || el.getAttribute("data-sound") === "success") {
        createSound("success", getCtx());
      } else if (el.classList.contains("sound-error") || el.getAttribute("data-sound") === "error") {
        createSound("error", getCtx());
      } else if (el.tagName === "A" || el.closest("a")) {
        createSound("whoosh", getCtx());
      } else {
        createSound("click", getCtx());
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      // Sound on Ctrl+K (command palette)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        createSound("whoosh", getCtx());
      }
      // Sound on Escape
      if (e.key === "Escape") {
        createSound("click", getCtx());
      }
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, getCtx]);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("hireops_sounds", next ? "on" : "off");
      if (next) {
        // Play a test sound when enabling
        setTimeout(() => createSound("success", getCtx()), 100);
      }
      return next;
    });
  }, [getCtx]);

  return (
    <SoundContext.Provider value={{ enabled, toggle, play }}>
      {children}
    </SoundContext.Provider>
  );
}
