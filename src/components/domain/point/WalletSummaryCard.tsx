"use client";

import { useId } from "react";

import { ArrowDown, Plus } from "lucide-react";

import type { WalletSummaryMetric, WalletViewModel } from "@/components/domain/point/pointViewModel";

interface WalletSummaryCardProps {
  wallet: Pick<WalletViewModel, "availableBalance" | "metrics">;
  onOpenCharge: () => void;
}

function HoverHint({ text }: { text: string }) {
  const tooltipId = useId();

  return (
    <button
      type="button"
      className="group relative ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#D9E3CF]/35 text-[10px] text-[#D9E3CF]/75 outline-none transition-colors focus-visible:border-[#F7F1E5]/70 focus-visible:text-[#F7F1E5]"
      aria-describedby={tooltipId}
      aria-label="도움말"
    >
      i
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/20 bg-[#0f172a] px-2 py-1 text-[10px] font-semibold leading-snug text-[#F7F1E5] shadow-lg group-hover:block group-focus:block"
      >
        {text}
      </span>
    </button>
  );
}

function WalletBreakdownRow({ metric }: { metric: WalletSummaryMetric }) {
  const isWarning = metric.tone === "red";

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="inline-flex items-center pl-3 text-[11px] font-semibold text-[#D9E3CF]/60">
        {isWarning ? (
          <span className="mr-1.5 text-[12px] font-black leading-none text-red-400" aria-hidden="true">
            ⚠
          </span>
        ) : (
          <span className="mr-2 h-px w-2 rounded-full bg-[#D9E3CF]/30" aria-hidden="true" />
        )}
        <span>{metric.label}</span>
        <HoverHint text={metric.caption} />
      </p>
      <p className="text-[13px] font-bold text-[#D9E3CF]/75 tabular-nums">{metric.value}</p>
    </div>
  );
}

function TotalBalanceRow({ metric }: { metric: WalletSummaryMetric }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="inline-flex items-center text-[12px] font-bold text-[#D9E3CF]/80">
        <span>{metric.label}</span>
        <HoverHint text={metric.caption} />
      </p>
      <p className="text-[15px] font-black tracking-[-0.02em] text-[#F7F1E5] tabular-nums">
        {metric.value}
      </p>
    </div>
  );
}

export function WalletSummaryCard({ wallet, onOpenCharge }: WalletSummaryCardProps) {
  const [totalMetric, ...breakdownMetrics] = wallet.metrics;

  return (
    <section className="relative overflow-visible rounded-[28px] bg-[#111827] px-5 pb-5 pt-5 text-[#F7F1E5] shadow-[0_18px_40px_rgba(17,24,39,0.22)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
        <div className="absolute -right-12 -top-10 h-36 w-36 rounded-full bg-primary-blue/35 blur-2xl" />
      </div>

      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold text-[#D9E3CF]/70">사용가능 도딘</p>
          <div className="mt-1 flex items-end gap-1.5">
            <span className="text-[38px] font-black leading-none tracking-[-0.06em] tabular-nums">
              {wallet.availableBalance.replace("원", "")}
            </span>
            <span className="pb-1 text-sm font-extrabold text-[#D9E3CF]/70">원</span>
          </div>
        </div>
      </div>

      {totalMetric && (
        <div className="relative mt-5 rounded-2xl border border-[#D9E3CF]/10 bg-[#F7F1E5]/[0.045] px-4 py-3.5">
          <TotalBalanceRow metric={totalMetric} />

          <div className="mt-3 space-y-2 border-t border-dashed border-[#D9E3CF]/15 pt-3">
            {breakdownMetrics.map((metric) => (
              <WalletBreakdownRow key={metric.label} metric={metric} />
            ))}
          </div>
        </div>
      )}

      <div className="relative mt-5 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onOpenCharge}
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
        충전은 결제 연동 준비 중이며, 출금 기능은 MVP 범위에서 제공하지 않습니다.
      </p>
    </section>
  );
}
