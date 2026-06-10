"use client";

import { useEffect, useRef, type RefObject } from "react";

import {
  HistoryFilterTabs,
  HistoryRow,
  WALLET_PREVIEW_HISTORY_FILTERS,
  type HistoryFilter,
  type HistoryFilterOption,
} from "@/components/domain/point/WalletHistorySection";
import type { WalletHistoryViewItem } from "@/components/domain/point/pointViewModel";

interface DodinHistoryListProps {
  activeFilter: HistoryFilter;
  filters?: HistoryFilterOption[];
  hasMore: boolean;
  historyItems: WalletHistoryViewItem[];
  isLoading: boolean;
  errorMessage?: string;
  onFilterChange: (filter: HistoryFilter) => void;
  onLoadMore: () => void;
  onRetry: () => void;
}

function DodinHistoryEmptyState({ activeFilter }: { activeFilter: HistoryFilter }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-[15px] font-extrabold text-text-primary">
        {activeFilter === "ALL" ? "아직 표시할 도딘 내역이 없어요." : "이 조건의 내역이 아직 없어요."}
      </p>
      <p className="mt-2 text-xs font-medium text-text-secondary">
        도딘을 충전하거나 크루에 참여하면 여기에 기록돼요.
      </p>
    </div>
  );
}

function DodinHistoryErrorState({
  errorMessage,
  onRetry,
}: {
  errorMessage: string;
  onRetry: () => void;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-[15px] font-extrabold text-text-primary">{errorMessage}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-full bg-primary-blue px-4 py-2 text-xs font-extrabold text-white"
      >
        다시 불러오기
      </button>
    </div>
  );
}

function DodinHistoryFooter({
  hasMore,
  isLoading,
  loadMoreRef,
}: {
  hasMore: boolean;
  isLoading: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={hasMore ? loadMoreRef : undefined} className="border-t border-text-secondary/[0.08] px-4 py-4">
      <p className="text-center text-xs font-medium text-text-secondary">
        {isLoading ? "내역을 불러오는 중..." : hasMore ? "아래로 스크롤해 더 보기" : "마지막 내역입니다."}
      </p>
    </div>
  );
}

export function DodinHistoryList({
  activeFilter,
  errorMessage,
  filters = WALLET_PREVIEW_HISTORY_FILTERS,
  hasMore,
  historyItems,
  isLoading,
  onFilterChange,
  onLoadMore,
  onRetry,
}: DodinHistoryListProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || !loadMoreRef.current) return;

    const node = loadMoreRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "0px 0px 180px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  return (
    <section className="overflow-hidden rounded-[24px] border border-text-secondary/10 bg-card shadow-card">
      <div className="px-4 py-4">
        <HistoryFilterTabs activeFilter={activeFilter} filters={filters} onFilterChange={onFilterChange} />
      </div>

      {errorMessage && historyItems.length === 0 ? (
        <DodinHistoryErrorState errorMessage={errorMessage} onRetry={onRetry} />
      ) : historyItems.length > 0 ? (
        <ul className="divide-y divide-text-secondary/[0.08]">
          {historyItems.map((item) => (
            <HistoryRow key={item.id} item={item} />
          ))}
        </ul>
      ) : isLoading ? (
        <p className="px-6 py-12 text-center text-xs font-semibold text-text-secondary">내역을 불러오는 중...</p>
      ) : (
        <DodinHistoryEmptyState activeFilter={activeFilter} />
      )}

      {(historyItems.length > 0 || isLoading) && (
        <DodinHistoryFooter hasMore={hasMore} isLoading={isLoading} loadMoreRef={loadMoreRef} />
      )}
    </section>
  );
}
