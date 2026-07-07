"use client";

export default function Skeleton({
  width = "100%",
  height = "20px",
  className = "",
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={`shimmer rounded ${className}`}
      style={{ width, height }}
    />
  );
}
