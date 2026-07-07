interface SkillTagProps {
  name: string;
  category?: string;
  onRemove?: () => void;
}

const categoryColors: Record<string, string> = {
  "Frontend": "border-neon-cyan/30 text-neon-cyan bg-[rgba(0,245,255,0.08)]",
  "Backend": "border-neon-purple/30 text-neon-purple bg-[rgba(191,0,255,0.08)]",
  "DevOps": "border-neon-green/30 text-neon-green bg-[rgba(0,255,136,0.08)]",
  "Database": "border-neon-red/30 text-neon-red bg-[rgba(255,45,85,0.08)]",
  "Cloud": "border-neon-cyan/30 text-neon-cyan bg-[rgba(0,245,255,0.08)]",
  "Security": "border-neon-red/30 text-neon-red bg-[rgba(255,45,85,0.08)]",
  "AI/ML": "border-neon-purple/30 text-neon-purple bg-[rgba(191,0,255,0.08)]",
  "Mobile": "border-neon-green/30 text-neon-green bg-[rgba(0,255,136,0.08)]",
};

export default function SkillTag({ name, category, onRemove }: SkillTagProps) {
  const colorClass = category && categoryColors[category]
    ? categoryColors[category]
    : "border-[rgba(0,245,255,0.2)] text-muted bg-[rgba(0,245,255,0.05)]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border ${colorClass}`}
    >
      {name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:text-foreground transition-colors"
        >
          ×
        </button>
      )}
    </span>
  );
}
