"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface CategoryGroupProps {
  category: string;
  count: number;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function CategoryGroup({
  category,
  count,
  children,
  defaultOpen = true,
}: CategoryGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[rgba(0,245,255,0.03)] border border-[rgba(0,245,255,0.08)] rounded-lg hover:border-[rgba(0,245,255,0.15)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-neon-cyan font-mono text-sm"
          >
            ▶
          </motion.span>
          <h3 className="text-sm font-mono font-semibold text-foreground uppercase tracking-wider">
            {category}
          </h3>
        </div>
        <span className="text-xs font-mono text-muted bg-[rgba(0,245,255,0.05)] px-2 py-1 rounded border border-[rgba(0,245,255,0.1)]">
          {count}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 pl-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
