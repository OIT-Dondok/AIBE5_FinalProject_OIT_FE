"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  CreditCard,
  RefreshCw,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  POINT_TRANSACTION_DISPLAY_DIRECTION,
  type WalletHistoryViewItem,
} from "@/components/domain/point/pointViewModel";
import type { PointTransactionType } from "@/types/domain";

export type HistoryFilter = "ALL" | PointTransactionType;

export interface HistoryFilterOption {
  label: string;
  value: HistoryFilter;
}

export const WALLET_PREVIEW_HISTORY_FILTERS: HistoryFilterOption[] = [
  { label: "전체", value: "ALL" },
  { label: "충전", value: "POINT_CHARGE" },
  { label: "예치", value: "CREW_DEPOSIT_RESERVE" },
  { label: "예치 반환", value: "CREW_RESERVE_RELEASE" },
  { label: "정산", value: "CREW_SETTLEMENT_REFUND" },
  { label: "출금", value: "POINT_WITHDRAWAL" },
];

const POINT_HISTORY_ICON: Record<PointTransactionType, LucideIcon> = {
  POINT_CHARGE: CreditCard,
  CREW_DEPOSIT_RESERVE: ArrowDown,
  CREW_RESERVE_RELEASE: ArrowUp,
  CREW_SETTLEMENT_REFUND: RefreshCw,
  POINT_WITHDRAWAL: Wallet,
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
}

function HistoryIcon({ item }: { item: WalletHistoryViewItem }) {
  const direction = POINT_TRANSACTION_DISPLAY_DIRECTION[item.transactionType];
  const tone = direction === "inflow" ? "bg-success-green/40 text-primary-green" : "bg-amber-50 text-amber-700";
  const Icon = POINT_HISTORY_ICON[item.transactionType];

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
        <p className="mt-0.5 text-[10px] font-semibold text-text-secondary">사용가능 잔액 {item.balanceAfter}</p>
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

export function getFilteredHistory(
  historyItems: WalletHistoryViewItem[],
  activeFilter: HistoryFilter,
  options: { limit?: number; supportedFilters?: HistoryFilterOption[] } = {},
) {
  const supportedValues = options.supportedFilters?.map((filter) => filter.value);
  const visibleItems = supportedValues
    ? historyItems.filter((item) => supportedValues.includes(item.transactionType))
    : historyItems;
  const filteredItems = visibleItems.filter((item) => {
    if (activeFilter === "ALL") return true;
    return item.transactionType === activeFilter;
  });

  return typeof options.limit === "number" ? filteredItems.slice(0, options.limit) : filteredItems;
}

export function WalletHistorySection({
  activeFilter,
  filters = WALLET_PREVIEW_HISTORY_FILTERS,
  fullHistoryHref = "/my/dodin/history",
  historyItems,
  limit = HISTORY_ROW_COUNT,
  onFilterChange,
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

      <ul className="divide-y divide-text-secondary/[0.08]">
        {filteredHistory.map((item) => (
          <HistoryRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}
