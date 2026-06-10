"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LockKeyhole,
  RefreshCw,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  POINT_HISTORY_FILTERS,
  type PointHistoryFilter,
  type WalletHistoryCategory,
  type WalletHistoryViewItem,
} from "@/components/domain/point/pointViewModel";

export type HistoryFilter = PointHistoryFilter;

export interface HistoryFilterOption {
  label: string;
  value: HistoryFilter;
}

export const WALLET_PREVIEW_HISTORY_FILTERS: HistoryFilterOption[] = POINT_HISTORY_FILTERS;

const WALLET_HISTORY_ICON: Record<WalletHistoryCategory, LucideIcon> = {
  charge: CreditCard,
  deposit: LockKeyhole,
  refund: ArrowUp,
  settlement: RefreshCw,
  withdrawal: Wallet,
  unknown: HelpCircle,
};

const HISTORY_ROW_COUNT = 5;

export interface WalletHistorySectionProps {
  activeFilter: HistoryFilter;
  historyItems: WalletHistoryViewItem[];
  onFilterChange: (filter: HistoryFilter) => void;
  updatedAtLabel: string;
  filters?: HistoryFilterOption[];
  limit?: number;
  fullHistoryHref?: string;
  isLoading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

function HistoryIcon({ item }: { item: WalletHistoryViewItem }) {
  const tone = item.direction === "inflow" ? "bg-success-green/40 text-primary-green" : "bg-amber-50 text-amber-700";
  const Icon = WALLET_HISTORY_ICON[item.category] ?? ArrowDown;

  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
      <Icon size={17} strokeWidth={2.25} aria-hidden="true" />
    </span>
  );
}

export function HistoryRow({ item }: { item: WalletHistoryViewItem }) {
  const isInflow = item.direction === "inflow";

  return (
    <li className="flex items-center gap-3 px-4 py-3.5">
      <HistoryIcon item={item} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[13px] font-bold text-text-primary">{item.label}</p>
          <span className="h-1 w-1 rounded-full bg-text-secondary/25" />
          <p className="truncate text-[11px] font-medium text-text-secondary">{item.description}</p>
        </div>
        <p className="mt-0.5 text-[11px] font-medium text-text-secondary/70">{item.dateLabel}</p>
      </div>
      <div className="text-right">
        <p className={`text-[14px] font-extrabold tabular-nums ${isInflow ? "text-primary-green" : "text-text-primary"}`}>
          {item.displayAmount}
        </p>
        <p className="mt-0.5 text-[10px] font-semibold text-text-secondary">사용가능 도딘 {item.balanceAfter}</p>
      </div>
    </li>
  );
}

export function HistoryFilterTabs({
  activeFilter,
  filters = WALLET_PREVIEW_HISTORY_FILTERS,
  onFilterChange,
}: Pick<WalletHistorySectionProps, "activeFilter" | "filters" | "onFilterChange">) {
  return (
    <div className="no-scrollbar -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onFilterChange(filter.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold transition-colors ${
              isActive
                ? "bg-primary-blue text-white shadow-sm shadow-primary-blue/20"
                : "bg-background text-text-secondary hover:text-text-primary"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

function matchesFilter(item: WalletHistoryViewItem, activeFilter: HistoryFilter) {
  if (activeFilter === "ALL") return true;
  return item.category === activeFilter;
}

export function getFilteredHistory(
  historyItems: WalletHistoryViewItem[],
  activeFilter: HistoryFilter,
  options: { limit?: number; supportedFilters?: HistoryFilterOption[] } = {},
) {
  const supportedValues = options.supportedFilters?.map((filter) => filter.value);
  const shouldApplyFilter = !supportedValues || supportedValues.includes(activeFilter);
  const filteredItems = shouldApplyFilter ? historyItems.filter((item) => matchesFilter(item, activeFilter)) : historyItems;

  return typeof options.limit === "number" ? filteredItems.slice(0, options.limit) : filteredItems;
}

function WalletHistoryStatus({
  errorMessage,
  isLoading,
  onRetry,
}: Pick<WalletHistorySectionProps, "errorMessage" | "isLoading" | "onRetry">) {
  if (isLoading) {
    return <p className="px-4 py-8 text-center text-xs font-semibold text-text-secondary">도딘 내역을 불러오는 중...</p>;
  }

  if (errorMessage) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm font-extrabold text-text-primary">{errorMessage}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-full bg-primary-blue px-4 py-2 text-xs font-extrabold text-white"
          >
            다시 불러오기
          </button>
        )}
      </div>
    );
  }

  return <p className="px-4 py-8 text-center text-xs font-semibold text-text-secondary">표시할 도딘 내역이 없어요</p>;
}

export function WalletHistorySection({
  activeFilter,
  errorMessage,
  filters = WALLET_PREVIEW_HISTORY_FILTERS,
  fullHistoryHref = "/my/dodin/history",
  historyItems,
  isLoading = false,
  limit = HISTORY_ROW_COUNT,
  onFilterChange,
  onRetry,
  updatedAtLabel,
}: WalletHistorySectionProps) {
  const filteredHistory = getFilteredHistory(historyItems, activeFilter, {
    limit,
    supportedFilters: filters,
  });

  return (
    <section className="mt-5 overflow-hidden rounded-[24px] border border-text-secondary/10 bg-card shadow-card">
      <div className="px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-extrabold text-text-primary">도딘 내역</h2>
            <p className="mt-0.5 text-[11px] font-medium text-text-secondary">{updatedAtLabel}</p>
          </div>
          <Link
            href={fullHistoryHref}
            className="inline-flex items-center gap-0.5 text-xs font-extrabold text-primary-blue"
            aria-label="전체 도딘 내역 보기"
          >
            전체 <ChevronRight size={14} />
          </Link>
        </div>

        <HistoryFilterTabs activeFilter={activeFilter} filters={filters} onFilterChange={onFilterChange} />
      </div>

      {filteredHistory.length > 0 && !errorMessage ? (
        <ul className="divide-y divide-text-secondary/[0.08]">
          {filteredHistory.map((item) => (
            <HistoryRow key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <WalletHistoryStatus errorMessage={errorMessage} isLoading={isLoading} onRetry={onRetry} />
      )}
    </section>
  );
}
