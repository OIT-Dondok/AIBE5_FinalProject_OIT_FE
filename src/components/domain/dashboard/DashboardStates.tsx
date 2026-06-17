"use client";

import { PieChart, RefreshCw } from "lucide-react";

import { Skeleton } from "@/components/common/Skeleton";

export function RefreshButton({ onRefresh }: { onRefresh: () => void }) {
  return (
    <button
      type="button"
      aria-label="대시보드 새로고침"
      className="p-1 -mr-1 rounded-full text-text-secondary hover:text-text-primary"
      onClick={onRefresh}
    >
      <RefreshCw size={21} />
    </button>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-44 w-full rounded-card" />
      <Skeleton className="h-16 w-full rounded-card" />
      <Skeleton className="h-16 w-full rounded-card" />
      <Skeleton className="h-16 w-full rounded-card" />
    </div>
  );
}

export function DashboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mt-20 flex flex-col items-center gap-3 text-text-secondary">
      <PieChart size={40} className="opacity-30" />
      <p className="text-sm font-medium">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-button border border-text-secondary/20 bg-card px-5 py-2 text-sm font-semibold text-text-primary hover:bg-text-secondary/5"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

export function DashboardEmpty() {
  return (
    <div className="mt-20 flex flex-col items-center gap-3 text-text-secondary">
      <PieChart size={40} className="opacity-30" />
      <p className="text-sm font-medium">아직 참여 중인 크루가 없어요.</p>
    </div>
  );
}
