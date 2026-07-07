interface PulsingDotProps {
  color?: "cyan" | "purple" | "green" | "red";
  size?: "sm" | "md" | "lg";
}

const colorMap = {
  cyan: "bg-neon-cyan",
  purple: "bg-neon-purple",
  green: "bg-neon-green",
  red: "bg-neon-red",
};

const sizeMap = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-3 h-3",
};

export default function PulsingDot({ color = "cyan", size = "md" }: PulsingDotProps) {
  return (
    <span
      className={`rounded-full ${colorMap[color]} ${sizeMap[size]} animate-pulse-glow inline-block`}
    />
  );
}
