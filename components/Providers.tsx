"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import SoundProvider from "./SoundManager";
import BootSequence from "./BootSequence";
import CommandPalette from "./CommandPalette";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SoundProvider>
        <BootSequence duration={2200}>
          <div className="noise-overlay vignette w-full h-full flex flex-col">
            <CommandPalette />
            {children}
          </div>
        </BootSequence>
      </SoundProvider>
    </SessionProvider>
  );
}
