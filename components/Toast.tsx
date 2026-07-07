"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import type { ToastMessage } from "@/lib/toast";

const TYPE_STYLES: Record<string, { border: string; bg: string; text: string }> = {
  success: { border: "border-neon-green/30", bg: "bg-neon-green/10", text: "text-neon-green" },
  error: { border: "border-neon-red/30", bg: "bg-neon-red/10", text: "text-neon-red" },
  info: { border: "border-neon-cyan/30", bg: "bg-neon-cyan/10", text: "text-neon-cyan" },
};

export default function Toast({
  toast,
  onClose,
}: {
  toast: ToastMessage;
  onClose: () => void;
}) {
  const style = TYPE_STYLES[toast.type] || TYPE_STYLES.info;

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${style.border} ${style.bg} backdrop-blur-sm`}
    >
      <span className={`text-xs font-mono ${style.text}`}>{toast.message}</span>
      <button onClick={onClose} className="text-muted hover:text-foreground text-xs ml-2">×</button>
    </motion.div>
  );
}
