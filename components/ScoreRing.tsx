interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreRing({ score, size = 120, strokeWidth = 8 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 70) return "#00FF88";
    if (score >= 40) return "#00F5FF";
    return "#FF2D55";
  };

  const getGlow = (score: number) => {
    if (score >= 70) return "drop-shadow(0 0 6px #00FF88)";
    if (score >= 40) return "drop-shadow(0 0 6px #00F5FF)";
    return "drop-shadow(0 0 6px #FF2D55)";
  };

  const color = getColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} style={{ filter: getGlow(score) }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0, 245, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Score circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="text-2xl font-mono font-bold"
          style={{ color, textShadow: `0 0 10px ${color}` }}
        >
          {score}%
        </span>
        <span className="text-[10px] font-mono text-muted uppercase">Match</span>
      </div>
    </div>
  );
}
