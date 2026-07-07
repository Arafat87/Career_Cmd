"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) {
    return (
      <a
        href="/login"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 text-xs font-mono text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
      >
        <span className="text-[10px]">⏻</span>
        <span>SIGN IN</span>
      </a>
    );
  }

  const user = session.user;
  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[rgba(0,245,255,0.05)] transition-colors"
      >
        {user.image ? (
          <img src={user.image} alt="" className="w-6 h-6 rounded-full border border-neon-cyan/20" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
            <span className="text-[8px] font-mono text-neon-cyan">{initials}</span>
          </div>
        )}
        <span className="text-[10px] font-mono text-foreground hidden md:block">{user.name || user.email}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-[100] w-56 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 0 20px rgba(0,245,255,0.1)" }}>
          <div className="p-3 border-b border-[rgba(0,245,255,0.1)]">
            <p className="text-xs font-mono text-foreground">{user.name}</p>
            <p className="text-[10px] font-mono text-muted">{user.email}</p>
          </div>
          <div className="p-1">
            <a href="/settings" onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded text-xs font-mono text-muted hover:text-foreground hover:bg-[rgba(0,245,255,0.05)] transition-colors">
              ⚙ Settings
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-mono text-neon-red hover:bg-neon-red/5 transition-colors text-left"
            >
              ⏻ Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
