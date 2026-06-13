export function SettlementSkeleton() {
  return (
    <div className="w-full max-w-[430px] mx-auto px-5 py-6">
      <div className="h-48 rounded-[24px] bg-text-secondary/10 animate-pulse" />
      <div className="mt-4 h-28 rounded-card bg-text-secondary/10 animate-pulse" />
      <div className="mt-4 flex flex-col gap-3">
        <div className="h-24 rounded-card bg-text-secondary/10 animate-pulse" />
        <div className="h-24 rounded-card bg-text-secondary/10 animate-pulse" />
        <div className="h-24 rounded-card bg-text-secondary/10 animate-pulse" />
      </div>
    </div>
  );
}
