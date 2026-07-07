"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-[#0a0a10] border border-[rgba(0,245,255,0.15)] rounded-xl p-6 shadow-2xl border-glow-cyan">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-mono font-semibold text-neon-cyan glow-cyan">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-muted hover:text-foreground transition-colors text-xl font-mono"
                >
                  ×
                </button>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent mb-4" />
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
