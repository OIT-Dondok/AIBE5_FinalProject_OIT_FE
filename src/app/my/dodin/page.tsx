"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  CreditCard,
  Plus,
  RefreshCw,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Header } from "@/components/common/Header";
import { ChargeBottomSheet } from "@/components/domain/point/ChargeBottomSheet";
import {
  POINT_TRANSACTION_DISPLAY_DIRECTION,
  createWalletViewModel,
} from "@/components/domain/point/pointViewModel";
import type { WalletHistoryViewItem } from "@/components/domain/point/pointViewModel";
import { mockPointAccount, mockPointHistory } from "@/mocks/data/points";
import type { PointTransactionType } from "@/types/domain";

type HistoryFilter = "ALL" | PointTransactionType;

const HISTORY_FILTERS: Array<{ label: string; value: HistoryFilter }> = [
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

function HoverHint({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <span
        className="ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#D9E3CF]/35 text-[10px] text-[#D9E3CF]/75"
        aria-hidden="true"
      >
        i
      </span>
      <span className="pointer-events-none absolute left-1/2 top-auto bottom-full z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/20 bg-[#0f172a] px-2 py-1 text-[10px] font-semibold leading-snug text-[#F7F1E5] shadow-lg group-hover:block">
        {text}
      </span>
    </span>
  );
}

function WalletBreakdownRow({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="inline-flex items-center pl-3 text-[11px] font-semibold text-[#D9E3CF]/60">
        <span className="mr-2 h-px w-2 rounded-full bg-[#D9E3CF]/30" aria-hidden="true" />
        <span>{label}</span>
        <HoverHint text={caption} />
      </p>
      <p className="text-[13px] font-bold text-[#D9E3CF]/75 tabular-nums">{`−${value}`}</p>
    </div>
  );
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

function HistoryRow({ item }: { item: WalletHistoryViewItem }) {
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
        <p className="mt-0.5 text-[10px] font-semibold text-text-secondary">잔액 {item.balanceAfter}</p>
      </div>
    </li>
  );
}

export default function DodinWalletPage() {
  const [isChargeSheetOpen, setIsChargeSheetOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("ALL");

  const wallet = useMemo(
    () => createWalletViewModel(mockPointAccount, mockPointHistory.items),
    [],
  );

  const filteredHistory = wallet.historyItems.filter((item) => {
    if (activeFilter === "ALL") return true;
    return item.transactionType === activeFilter;
  }).slice(0, HISTORY_ROW_COUNT);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent">
      <div className="mx-auto flex w-full max-w-[430px] flex-col pb-10">
        <Header title="도딘 지갑" showBackButton />

        <div className="px-5 pt-5">
          <section className="relative overflow-visible rounded-[28px] bg-[#111827] px-5 pb-5 pt-5 text-[#F7F1E5] shadow-[0_18px_40px_rgba(17,24,39,0.22)]">
            <div className="pointer-events-none absolute inset-0 rounded-[28px] overflow-hidden">
              <div className="absolute -right-12 -top-10 h-36 w-36 rounded-full bg-primary-blue/35 blur-2xl" />
            </div>
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="text-[12px] font-bold text-[#D9E3CF]/70">사용가능 도딘</p>
                <div className="mt-1 flex items-end gap-1.5">
                  <span className="text-[38px] font-black tracking-[-0.06em] tabular-nums leading-none">
                    {wallet.availableBalance.replace("원", "")}
                  </span>
                  <span className="pb-1 text-sm font-extrabold text-[#D9E3CF]/70">원</span>
                </div>
              </div>
            </div>

            <div className="relative mt-5 rounded-2xl border border-[#D9E3CF]/10 bg-[#F7F1E5]/[0.045] px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="inline-flex items-center text-[12px] font-bold text-[#D9E3CF]/80">
                  <span>{wallet.metrics[0].label}</span>
                  <HoverHint text={wallet.metrics[0].caption} />
                </p>
                <p className="text-[15px] font-black tracking-[-0.02em] text-[#F7F1E5] tabular-nums">
                  {wallet.metrics[0].value}
                </p>
              </div>

              <div className="mt-3 space-y-2 border-t border-dashed border-[#D9E3CF]/15 pt-3">
                {wallet.metrics.slice(1).map((metric) => (
                  <WalletBreakdownRow
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    caption={metric.caption}
                  />
                ))}
              </div>
            </div>

            <div className="relative mt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsChargeSheetOpen(true)}
                className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-[#F7F1E5] text-sm font-extrabold text-[#111827] shadow-sm transition-transform active:scale-[0.98]"
              >
                <Plus size={16} strokeWidth={3} /> 도딘 충전
              </button>
              <button
                type="button"
                disabled
                className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-[#F7F1E5]/10 text-sm font-extrabold text-[#F7F1E5]/45"
                aria-label="도딘 출금 MVP 미지원"
              >
                <ArrowDown size={16} /> 출금 미지원
              </button>
            </div>

            <p className="mt-3 text-[11px] leading-snug text-[#D9E3CF]/70">
              충전: 카드/계좌로 도딘 충전 · 출금: 사용가능 도딘을 내 계좌로
            </p>
          </section>

          <section className="mt-5 rounded-[24px] bg-card shadow-card border border-text-secondary/10 overflow-hidden">
            <div className="px-4 pb-3 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-extrabold text-text-primary">도딘 내역</h2>
                  <p className="mt-0.5 text-[11px] font-medium text-text-secondary">{wallet.updatedAtLabel}</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-0.5 text-xs font-extrabold text-primary-blue"
                  aria-label="전체 도딘 내역 보기 준비 중"
                >
                  전체 <ChevronRight size={14} />
                </button>
              </div>

              <div className="no-scrollbar -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4">
                {HISTORY_FILTERS.map((filter) => {
                  const isActive = activeFilter === filter.value;
                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setActiveFilter(filter.value)}
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
            </div>

            <ul className="divide-y divide-text-secondary/[0.08]">
              {filteredHistory.map((item) => (
                <HistoryRow key={item.id} item={item} />
              ))}
            </ul>
          </section>

        </div>
      </div>

      <ChargeBottomSheet isOpen={isChargeSheetOpen} onClose={() => setIsChargeSheetOpen(false)} />
    </main>
  );
}
