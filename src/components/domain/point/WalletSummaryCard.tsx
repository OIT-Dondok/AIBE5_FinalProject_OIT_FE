"use client";

import Image from "next/image";
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
      className="group relative ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white/25 text-[10px] text-white/60 outline-none transition-colors focus-visible:border-white/70 focus-visible:text-white"
      aria-describedby={tooltipId}
      aria-label="도움말"
    >
      i
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/20 bg-[#3D7050] px-2 py-1 text-[10px] font-semibold leading-snug text-white shadow-lg group-hover:block group-focus:block"
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
      <p className="inline-flex items-center pl-3 text-[11px] font-semibold text-white/60">
        {isWarning ? (
          <span className="mr-1.5 text-[12px] font-black leading-none text-red-300" aria-hidden="true">
            ⚠
          </span>
        ) : (
          <span className="mr-2 h-px w-2 rounded-full bg-white/25" aria-hidden="true" />
        )}
        <span>{metric.label}</span>
        <HoverHint text={metric.caption} />
      </p>
      <p className="text-[13px] font-bold tabular-nums text-white/80">{metric.value}</p>
    </div>
  );
}

function TotalBalanceRow({ metric }: { metric: WalletSummaryMetric }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="inline-flex items-center text-[12px] font-bold text-white/70">
        <span>{metric.label}</span>
        <HoverHint text={metric.caption} />
      </p>
      <p className="text-[15px] font-black tracking-[-0.02em] tabular-nums text-white">
        {metric.value}
      </p>
    </div>
  );
}

export function WalletSummaryCard({ wallet, onOpenCharge }: WalletSummaryCardProps) {
  const [totalMetric, ...breakdownMetrics] = wallet.metrics;

  return (
    <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#6BAF85] via-[#5E9B73] to-[#4A7D5C] text-white shadow-[0_4px_20px_rgba(94,155,115,0.22),_0_16px_56px_rgba(94,155,115,0.35)]">

      {/* 상단 하이라이트 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/[0.07] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/[0.08] to-transparent" />
      </div>

      <div className="relative px-5 pb-5 pt-5">

        {/* 로고 + 레이블 */}
        <div className="flex items-center justify-between">
          <Image
            src="/images/logo/dondok-logo.png"
            alt="돈독"
            width={88}
            height={24}
            className="object-contain brightness-0 invert opacity-85"
          />
          <span className="text-[11px] font-semibold text-white/45">도딘 지갑</span>
        </div>

        {/* 잔액 */}
        <div className="mt-5">
          <p className="text-[12px] font-medium text-white/60">사용가능 잔액</p>
          <div className="mt-1 flex items-end gap-1.5">
            <span className="text-[38px] font-black leading-none tracking-[-0.05em] tabular-nums">
              {wallet.availableBalance.replace("원", "")}
            </span>
            <span className="pb-1 text-sm font-bold text-white/65">원</span>
          </div>
        </div>

        {/* 상세 내역 */}
        {totalMetric && (
          <div className="mt-5 rounded-xl border border-white/[0.12] bg-black/[0.08] px-4 py-3.5">
            <TotalBalanceRow metric={totalMetric} />
            <div className="mt-3 space-y-2 border-t border-dashed border-white/[0.10] pt-3">
              {breakdownMetrics.map((metric) => (
                <WalletBreakdownRow key={metric.label} metric={metric} />
              ))}
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onOpenCharge}
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-white text-sm font-extrabold text-[#4A7D5C] shadow-sm transition-transform active:scale-[0.98]"
          >
            <Plus size={16} strokeWidth={3} /> 도딘 충전
          </button>
          <button
            type="button"
            disabled
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-white/[0.12] text-sm font-extrabold text-white/55"
            aria-label="도딘 출금 MVP 미지원"
          >
            <ArrowDown size={16} /> 출금 미지원
          </button>
        </div>

        <p className="mt-3 text-[11px] leading-snug text-white/60">
          충전은 결제 연동 준비 중이며, 출금은 MVP 범위 외입니다.
        </p>
      </div>
    </section>
  );
}
