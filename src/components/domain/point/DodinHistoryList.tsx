"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

import {
  HistoryFilterTabs,
  HistoryRow,
  WALLET_PREVIEW_HISTORY_FILTERS,
  type HistoryFilter,
  type HistoryFilterOption,
} from "@/components/domain/point/WalletHistorySection";
import {
  formatMonthLabel,
  type MonthFilterOption,
  type WalletHistoryViewItem,
} from "@/components/domain/point/pointViewModel";

interface DodinHistoryListProps {
  activeFilter: HistoryFilter;
  activeMonth?: string;
  filters?: HistoryFilterOption[];
  hasMore: boolean;
  historyItems: WalletHistoryViewItem[];
  isLoading: boolean;
  monthOptions: MonthFilterOption[];
  errorMessage?: string;
  onFilterChange: (filter: HistoryFilter) => void;
  onLoadMore: () => void;
  onMonthChange: (month?: string) => void;
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

function DodinHistoryMonthFilter({
  activeMonth,
  monthOptions,
  onMonthChange,
}: {
  activeMonth?: string;
  monthOptions: MonthFilterOption[];
  onMonthChange: (month?: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedLabel = formatMonthLabel(activeMonth);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (containerRef.current?.contains(target)) return;

      setIsOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsidePointer);
    document.addEventListener("touchstart", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsidePointer);
      document.removeEventListener("touchstart", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="dodin-history-month-options"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex items-center gap-1 rounded-full bg-primary-green px-3.5 py-2 text-xs font-extrabold text-white shadow-sm shadow-primary-green/20 transition-colors hover:bg-primary-green/90"
      >
        {selectedLabel}
        <span aria-hidden="true" className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          id="dodin-history-month-options"
          className="absolute left-0 top-full z-10 mt-2 grid max-h-72 w-36 gap-1 overflow-y-auto rounded-2xl border border-text-secondary/10 bg-card p-2 shadow-card"
        >
          {monthOptions.map((option) => {
            const isActive = option.value === activeMonth || (!option.value && !activeMonth);

            return (
              <button
                key={option.value ?? "ALL_PERIOD"}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  onMonthChange(option.value);
                  setIsOpen(false);
                }}
                className={`rounded-xl px-3 py-2 text-left text-xs font-extrabold transition-colors ${
                  isActive
                    ? "bg-primary-green text-white shadow-sm shadow-primary-green/20"
                    : "text-text-secondary hover:bg-background hover:text-text-primary"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DodinHistoryList({
  activeFilter,
  activeMonth,
  errorMessage,
  filters = WALLET_PREVIEW_HISTORY_FILTERS,
  hasMore,
  historyItems,
  isLoading,
  monthOptions,
  onFilterChange,
  onLoadMore,
  onMonthChange,
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
        <DodinHistoryMonthFilter
          activeMonth={activeMonth}
          monthOptions={monthOptions}
          onMonthChange={onMonthChange}
        />
        <HistoryFilterTabs
          activeClassName="bg-primary-green text-white shadow-sm shadow-primary-green/20"
          activeFilter={activeFilter}
          filters={filters}
          onFilterChange={onFilterChange}
        />
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
