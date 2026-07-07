"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 pt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-2.5 py-1.5 rounded text-xs font-mono text-muted hover:text-foreground hover:bg-[rgba(0,245,255,0.05)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        « PREV
      </button>

      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-xs font-mono text-muted/40">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded text-xs font-mono transition-colors ${
              p === page
                ? "bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan"
                : "text-muted hover:text-foreground hover:bg-[rgba(0,245,255,0.05)]"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-2.5 py-1.5 rounded text-xs font-mono text-muted hover:text-foreground hover:bg-[rgba(0,245,255,0.05)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        NEXT »
      </button>
    </div>
  );
}
