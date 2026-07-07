interface StatusBadgeProps {
  status: "TODO" | "IN PROGRESS" | "DONE";
  size?: "sm" | "md";
}

const statusStyles: Record<string, { bg: string; text: string; glow: string; dot: string }> = {
  TODO: {
    bg: "bg-[rgba(0,245,255,0.1)]",
    text: "text-neon-cyan",
    glow: "glow-cyan",
    dot: "bg-neon-cyan",
  },
  "IN PROGRESS": {
    bg: "bg-[rgba(191,0,255,0.1)]",
    text: "text-neon-purple",
    glow: "glow-purple",
    dot: "bg-neon-purple",
  },
  DONE: {
    bg: "bg-[rgba(0,255,136,0.1)]",
    text: "text-neon-green",
    glow: "glow-green",
    dot: "bg-neon-green",
  },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.TODO;
  const sizeClasses = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1";

  return (
    <span
      className={`neon-badge ${style.bg} ${style.text} ${sizeClasses} inline-flex items-center gap-1.5 border border-current/20`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse-glow`} />
      {status}
    </span>
  );
}
