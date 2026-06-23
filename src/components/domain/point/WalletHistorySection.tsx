"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ChevronRight,
  CreditCard,
  HelpCircle,
  RefreshCw,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ReceiptTopEdge } from "@/components/common/ReceiptTopEdge";
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
  deposit: ArrowDownToLine,
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
  activeClassName?: string;
  filters?: HistoryFilterOption[];
  limit?: number;
  fullHistoryHref?: string;
  isLoading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

function HistoryIcon({ item }: { item: WalletHistoryViewItem }) {
  const tone =
    item.direction === "inflow"
      ? "bg-success-green/40 text-primary-green"
      : "bg-amber-50 text-amber-700";
  const Icon = WALLET_HISTORY_ICON[item.category] ?? ArrowDown;

  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
      <Icon size={17} strokeWidth={2.25} aria-hidden="true" />
    </span>
  );
}

export function HistoryRow({
  item,
  hideDate = false,
}: {
  item: WalletHistoryViewItem;
  hideDate?: boolean;
}) {
  const isInflow = item.direction === "inflow";

  return (
    <li className="flex items-start gap-3 px-4 py-3.5">
      <div className="mt-0.5">
        <HistoryIcon item={item} />
      </div>
      <div className="min-w-0 flex-1">
        {/* 라벨 — 짧으므로 truncate 제거 */}
        <p className="text-[13px] font-bold text-text-primary">{item.label}</p>
        {/* 크루명 등 설명 — 2줄까지 허용 */}
        {item.description ? (
          <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-snug text-text-secondary">
            {item.description}
          </p>
        ) : null}
        {/* 날짜/시간 — 그룹 헤더가 있으면 시간만 */}
        <p className="mt-0.5 text-[11px] font-medium text-text-secondary/65">
          {hideDate ? item.timeLabel : item.dateLabel}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={`text-[14px] font-extrabold tabular-nums ${
            isInflow ? "text-primary-green" : "text-text-primary"
          }`}
        >
          {item.displayAmount}
        </p>
        <p className="mt-0.5 text-[10px] font-semibold text-text-secondary">
          {item.balanceAfter}
        </p>
      </div>
    </li>
  );
}

export function HistoryFilterTabs({
  activeClassName = "bg-primary-green text-white shadow-sm shadow-primary-green/25",
  activeFilter,
  filters = WALLET_PREVIEW_HISTORY_FILTERS,
  onFilterChange,
}: Pick<
  WalletHistorySectionProps,
  "activeClassName" | "activeFilter" | "filters" | "onFilterChange"
>) {
  return (
    <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onFilterChange(filter.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-extrabold transition-colors ${
              isActive
                ? activeClassName
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
  const shouldApplyFilter =
    !supportedValues || supportedValues.includes(activeFilter);
  const filteredItems = shouldApplyFilter
    ? historyItems.filter((item) => matchesFilter(item, activeFilter))
    : historyItems;

  return typeof options.limit === "number"
    ? filteredItems.slice(0, options.limit)
    : filteredItems;
}

function WalletHistoryStatus({
  errorMessage,
  isLoading,
  onRetry,
}: Pick<WalletHistorySectionProps, "errorMessage" | "isLoading" | "onRetry">) {
  if (isLoading) {
    return (
      <p className="px-4 py-8 text-center text-xs font-semibold text-text-secondary">
        도딘 내역을 불러오는 중...
      </p>
    );
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

  return (
    <p className="px-4 py-8 text-center text-xs font-semibold text-text-secondary">
      표시할 도딘 내역이 없어요
    </p>
  );
}

/** 영수증 하단 바코드 + 푸터 */
function ReceiptFooter({ updatedAtLabel }: { updatedAtLabel: string }) {
  // 장식용 바코드 (데이터 인코딩 X, 시각적 효과만)
  const barPattern = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 1, 1, 3, 1, 2, 3, 1, 1, 2, 1];
  let x = 0;
  const rects: { x: number; w: number }[] = [];
  barPattern.forEach((w, i) => {
    if (i % 2 === 0) rects.push({ x, w });
    x += w;
  });

  return (
    <div className="px-4 pb-5 pt-4">
      {/* 굵은 구분선 */}
      <div className="border-t-[2.5px] border-text-primary/10 pt-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <svg
              aria-hidden="true"
              viewBox={`0 0 ${x} 22`}
              className="h-[22px] w-28 text-text-secondary/25"
            >
              {rects.map((r, i) => (
                <rect key={i} x={r.x} y={0} width={r.w} height={22} fill="currentColor" />
              ))}
            </svg>
            <p className="mt-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-text-secondary/40">
              DONDOK WALLET
            </p>
          </div>

          <div className="text-right">
            <p className="font-mono text-[9px] uppercase tracking-wider text-text-secondary/35">
              기준
            </p>
            <p className="mt-0.5 font-mono text-[9px] font-semibold text-text-secondary/50">
              {updatedAtLabel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
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
    <section className="mt-5">
      {/* 영수증 톱니 절취선 — 카드 위에서 영수증이 출력되는 느낌 */}
      <ReceiptTopEdge />

      {/* 영수증 본체 */}
      <div className="overflow-hidden rounded-b-[24px] bg-card shadow-[0_6px_28px_rgba(0,0,0,0.07)]">
        {/* 헤더 */}
        <div className="px-4 pb-2 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-extrabold text-text-primary">도딘 내역</h2>
              <p className="mt-0.5 text-[11px] font-medium text-text-secondary">{updatedAtLabel}</p>
            </div>
            <Link
              href={fullHistoryHref}
              className="inline-flex items-center gap-0.5 text-xs font-extrabold text-primary-green"
              aria-label="전체 도딘 내역 보기"
            >
              전체 <ChevronRight size={14} />
            </Link>
          </div>

          <HistoryFilterTabs
            activeFilter={activeFilter}
            filters={filters}
            onFilterChange={onFilterChange}
          />
        </div>

        {/* 내역 리스트 — 점선 구분선으로 영수증 감성 */}
        {filteredHistory.length > 0 && !errorMessage ? (
          <ul className="divide-y divide-dashed divide-text-secondary/[0.10]">
            {filteredHistory.map((item) => (
              <HistoryRow key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <WalletHistoryStatus
            errorMessage={errorMessage}
            isLoading={isLoading}
            onRetry={onRetry}
          />
        )}

        {/* 영수증 하단 바코드 */}
        {!isLoading && !errorMessage && (
          <ReceiptFooter updatedAtLabel={updatedAtLabel} />
        )}
      </div>
    </section>
  );
}
