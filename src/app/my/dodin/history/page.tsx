"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Header } from "@/components/common/Header";
import {
  HistoryRow,
  getFilteredHistory,
  HistoryFilterTabs,
  WALLET_PREVIEW_HISTORY_FILTERS,
  type HistoryFilter,
} from "@/components/domain/point/WalletHistorySection";
import { createWalletViewModel } from "@/components/domain/point/pointViewModel";
import { mockPointAccount, mockPointHistory } from "@/mocks/data/points";

const HISTORY_PAGE_SIZE = 10;

export default function DodinHistoryPage() {
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("ALL");
  const [visibleCount, setVisibleCount] = useState(HISTORY_PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const wasIntersectingRef = useRef(false);
  const isLoadingRef = useRef(false);

  const walletHistory = useMemo(
    () => createWalletViewModel(mockPointAccount, mockPointHistory.items),
    [],
  );

  const filteredHistory = useMemo(
    () =>
      getFilteredHistory(walletHistory.historyItems, activeFilter, {
        supportedFilters: WALLET_PREVIEW_HISTORY_FILTERS,
      }),
    [activeFilter, walletHistory.historyItems],
  );

  const visibleHistory = filteredHistory.slice(0, visibleCount);
  const hasMore = visibleHistory.length < filteredHistory.length;

  const handleFilterChange = (filter: HistoryFilter) => {
    setActiveFilter(filter);
    setVisibleCount(HISTORY_PAGE_SIZE);
    wasIntersectingRef.current = false;
  };

  useEffect(() => {
    if (!hasMore || !loadMoreRef.current) return;

    const node = loadMoreRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry?.isIntersecting ?? false;

        if (!isIntersecting) {
          wasIntersectingRef.current = false;
          return;
        }

        if (isLoadingRef.current || wasIntersectingRef.current) {
          return;
        }

        isLoadingRef.current = true;
        wasIntersectingRef.current = true;

        setVisibleCount((current) => Math.min(current + HISTORY_PAGE_SIZE, filteredHistory.length));
        isLoadingRef.current = false;
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px 180px 0px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore, filteredHistory.length]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent">
      <div className="mx-auto flex w-full max-w-[430px] flex-col pb-10">
        <Header title="도딘 내역" showBackButton />

        <div className="px-5 pt-5">
          <section className="overflow-hidden rounded-[24px] border border-text-secondary/10 bg-card shadow-card">
            <div className="px-4 py-4">
              <HistoryFilterTabs
                activeFilter={activeFilter}
                filters={WALLET_PREVIEW_HISTORY_FILTERS}
                onFilterChange={handleFilterChange}
              />
            </div>

            {visibleHistory.length > 0 ? (
              <ul className="divide-y divide-text-secondary/[0.08]">
                {visibleHistory.map((item) => (
                  <HistoryRow key={item.id} item={item} />
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-[15px] font-extrabold text-text-primary">
                  {activeFilter === "ALL" ? "아직 표시할 도딘 내역이 없어요" : "이 조건의 내역이 아직 없어요"}
                </p>
                <p className="mt-2 text-xs font-medium text-text-secondary">
                  도딘을 충전하거나 크루에 참여하면 여기에 기록돼요.
                </p>
              </div>
            )}

            {hasMore ? (
              <div
                ref={loadMoreRef}
                className="border-t border-text-secondary/[0.08] px-4 py-4"
              >
                <p className="text-center text-xs font-medium text-text-secondary">내역을 불러오는 중...</p>
              </div>
            ) : <div className="border-t border-text-secondary/[0.08] px-4 py-4"><p className="text-center text-xs font-medium text-text-secondary">마지막 내역입니다.</p></div>}
          </section>
        </div>
      </div>
    </main>
  );
}
