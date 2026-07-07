"use client";

import { motion } from "framer-motion";
import { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({ children, className = "", style, onClick, hover = true }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        bg-card-bg border border-card-border rounded-lg p-4
        ${hover ? "card-hover cursor-pointer" : ""}
        ${className}
      `}
      style={style}
    >
      {children}
    </motion.div>
  );
}
