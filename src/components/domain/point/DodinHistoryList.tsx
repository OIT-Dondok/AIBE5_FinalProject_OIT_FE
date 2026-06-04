"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

import {
  getFilteredHistory,
  HistoryFilterTabs,
  HistoryRow,
  WALLET_PREVIEW_HISTORY_FILTERS,
  type HistoryFilter,
  type HistoryFilterOption,
} from "@/components/domain/point/WalletHistorySection";
import type { WalletHistoryViewItem } from "@/components/domain/point/pointViewModel";

interface DodinHistoryListProps {
  historyItems: WalletHistoryViewItem[];
  pageSize?: number;
  filters?: HistoryFilterOption[];
}

const DEFAULT_HISTORY_PAGE_SIZE = 10;

function DodinHistoryEmptyState({ activeFilter }: { activeFilter: HistoryFilter }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-[15px] font-extrabold text-text-primary">
        {activeFilter === "ALL" ? "아직 표시할 도딘 내역이 없어요" : "이 조건의 내역이 아직 없어요"}
      </p>
      <p className="mt-2 text-xs font-medium text-text-secondary">
        도딘을 충전하거나 크루에 참여하면 여기에 기록돼요.
      </p>
    </div>
  );
}

function DodinHistoryFooter({
  hasMore,
  loadMoreRef,
}: {
  hasMore: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={hasMore ? loadMoreRef : undefined} className="border-t border-text-secondary/[0.08] px-4 py-4">
      <p className="text-center text-xs font-medium text-text-secondary">
        {hasMore ? "내역을 불러오는 중..." : "마지막 내역입니다."}
      </p>
    </div>
  );
}

export function DodinHistoryList({
  filters = WALLET_PREVIEW_HISTORY_FILTERS,
  historyItems,
  pageSize = DEFAULT_HISTORY_PAGE_SIZE,
}: DodinHistoryListProps) {
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("ALL");
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);

  const filteredHistory = useMemo(
    () =>
      getFilteredHistory(historyItems, activeFilter, {
        supportedFilters: filters,
      }),
    [activeFilter, filters, historyItems],
  );

  const visibleHistory = filteredHistory.slice(0, visibleCount);
  const hasMore = visibleHistory.length < filteredHistory.length;

  const handleFilterChange = (filter: HistoryFilter) => {
    setActiveFilter(filter);
    setVisibleCount(pageSize);
    isLoadingRef.current = false;
  };

  useEffect(() => {
    if (!hasMore || !loadMoreRef.current) return;

    const node = loadMoreRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry?.isIntersecting ?? false;

        if (!isIntersecting || !hasMore) return;

        if (isLoadingRef.current) {
          return;
        }

        isLoadingRef.current = true;

        setVisibleCount((current) => Math.min(current + pageSize, filteredHistory.length));
      },
      {
        root: null,
        rootMargin: "0px 0px 180px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [filteredHistory.length, hasMore, pageSize]);

  useEffect(() => {
    if (isLoadingRef.current) {
      isLoadingRef.current = false;
    }
  }, [visibleCount]);

  return (
    <section className="overflow-hidden rounded-[24px] border border-text-secondary/10 bg-card shadow-card">
      <div className="px-4 py-4">
        <HistoryFilterTabs activeFilter={activeFilter} filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {visibleHistory.length > 0 ? (
        <ul className="divide-y divide-text-secondary/[0.08]">
          {visibleHistory.map((item) => (
            <HistoryRow key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <DodinHistoryEmptyState activeFilter={activeFilter} />
      )}

      <DodinHistoryFooter hasMore={hasMore} loadMoreRef={loadMoreRef} />
    </section>
  );
}
