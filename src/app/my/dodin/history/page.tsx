"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Header } from "@/components/common/Header";
import { DodinHistoryList } from "@/components/domain/point/DodinHistoryList";
import type { HistoryFilter } from "@/components/domain/point/WalletHistorySection";
import {
  getCurrentSeoulMonth,
  getWalletHistoryTypeParam,
  toWalletHistoryViewItem,
} from "@/components/domain/point/pointViewModel";
import { getWalletHistory } from "@/services/point";
import type { WalletHistoryItem } from "@/types/domain";

const HISTORY_PAGE_SIZE = 20;
const INITIAL_CURSOR_KEY = "__initial__";

export default function DodinHistoryPage() {
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("ALL");
  const [activeMonth, setActiveMonth] = useState(() => getCurrentSeoulMonth());
  const [historyItems, setHistoryItems] = useState<WalletHistoryItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const requestIdRef = useRef(0);
  const lastRequestedCursorRef = useRef<string | null>(null);

  const fetchHistory = useCallback(
    async ({
      cursor,
      filter,
      month,
      reset,
    }: {
      cursor?: string;
      filter: HistoryFilter;
      month: string;
      reset: boolean;
    }) => {
      const cursorKey = cursor ?? INITIAL_CURSOR_KEY;
      if (!reset && lastRequestedCursorRef.current === cursorKey) return;

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      lastRequestedCursorRef.current = cursorKey;
      setIsLoading(true);
      setErrorMessage("");

      try {
        const { data } = await getWalletHistory({
          cursor,
          limit: HISTORY_PAGE_SIZE,
          month,
          type: getWalletHistoryTypeParam(filter),
        });

        if (requestIdRef.current !== requestId) return;

        setHistoryItems((current) => (reset ? data.items : [...current, ...data.items]));
        setNextCursor(data.next_cursor);
      } catch {
        if (requestIdRef.current !== requestId) return;
        lastRequestedCursorRef.current = null;
        setErrorMessage("도딘 내역을 불러오지 못했어요.");
        if (reset) {
          setHistoryItems([]);
          setNextCursor(null);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  const resetHistoryQuery = useCallback(() => {
    requestIdRef.current += 1;
    lastRequestedCursorRef.current = null;
    setHistoryItems([]);
    setNextCursor(null);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      resetHistoryQuery();
      void fetchHistory({ filter: activeFilter, month: activeMonth, reset: true });
    });
  }, [activeFilter, activeMonth, fetchHistory, resetHistoryQuery]);

  const handleFilterChange = useCallback(
    (filter: HistoryFilter) => {
      if (filter === activeFilter) return;
      resetHistoryQuery();
      setActiveFilter(filter);
    },
    [activeFilter, resetHistoryQuery],
  );

  const handleMonthChange = useCallback(
    (month: string) => {
      if (month === activeMonth) return;
      resetHistoryQuery();
      setActiveMonth(month);
    },
    [activeMonth, resetHistoryQuery],
  );

  const handleLoadMore = useCallback(() => {
    if (isLoading || !nextCursor) return;
    void fetchHistory({ cursor: nextCursor, filter: activeFilter, month: activeMonth, reset: false });
  }, [activeFilter, activeMonth, fetchHistory, isLoading, nextCursor]);

  const handleRetry = useCallback(() => {
    resetHistoryQuery();
    void fetchHistory({ filter: activeFilter, month: activeMonth, reset: true });
  }, [activeFilter, activeMonth, fetchHistory, resetHistoryQuery]);

  const walletHistoryItems = useMemo(
    () => historyItems.map(toWalletHistoryViewItem),
    [historyItems],
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent">
      <div className="mx-auto flex w-full max-w-[430px] flex-col pb-10">
        <Header title="도딘 내역" showBackButton />

        <div className="px-5 pt-5">
          <DodinHistoryList
            activeFilter={activeFilter}
            activeMonth={activeMonth}
            errorMessage={errorMessage}
            hasMore={nextCursor != null}
            historyItems={walletHistoryItems}
            isLoading={isLoading}
            onFilterChange={handleFilterChange}
            onLoadMore={handleLoadMore}
            onMonthChange={handleMonthChange}
            onRetry={handleRetry}
          />
        </div>
      </div>
    </main>
  );
}
