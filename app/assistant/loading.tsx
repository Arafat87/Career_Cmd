export default function AssistantLoading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 animate-pulse">
      {/* Sidebar skeleton */}
      <div className="w-64 flex-shrink-0 space-y-3">
        <div className="h-8 bg-[rgba(0,245,255,0.05)] rounded-lg" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-[rgba(0,245,255,0.03)] border border-[rgba(0,245,255,0.06)] rounded-lg" />
        ))}
      </div>

      {/* Chat area skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 space-y-4 p-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
              <div className={`h-16 ${i % 2 === 0 ? "w-2/3" : "w-1/2"} bg-[rgba(0,245,255,0.03)] border border-[rgba(0,245,255,0.06)] rounded-lg`} />
            </div>
          ))}
        </div>
        <div className="h-12 bg-[rgba(0,245,255,0.03)] border border-[rgba(0,245,255,0.06)] rounded-lg mx-4" />
      </div>
    </div>
  );
}
