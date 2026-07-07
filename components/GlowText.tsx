import { ReactNode } from "react";

interface GlowTextProps {
  children: ReactNode;
  color?: "cyan" | "purple" | "green" | "red" | "yellow";
  className?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4";
}

const glowMap = {
  cyan: "glow-cyan text-neon-cyan",
  purple: "glow-purple text-neon-purple",
  green: "glow-green text-neon-green",
  red: "glow-red text-neon-red",
  yellow: "glow-yellow text-neon-yellow",
};

export default function GlowText({
  children,
  color = "cyan",
  className = "",
  as: Tag = "span",
}: GlowTextProps) {
  return <Tag className={`${glowMap[color]} ${className}`}>{children}</Tag>;
}
