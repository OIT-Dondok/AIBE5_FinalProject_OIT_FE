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

function WalletMetricPill({ metric }: { metric: WalletSummaryMetric }) {
  return (
    <div className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-white/[0.10] px-3 py-1.5 text-white/80 ring-1 ring-white/[0.10]">
      <span className="truncate text-[11px] font-semibold text-white/60">{metric.label}</span>
      <span className="text-[12px] font-black tabular-nums text-white">{metric.value}</span>
      <HoverHint text={metric.caption} />
    </div>
  );
}

export function WalletSummaryCard({ wallet, onOpenCharge }: WalletSummaryCardProps) {

  return (
    <section className="relative rounded-[24px] bg-gradient-to-br from-[#6BAF85] via-[#5E9B73] to-[#4A7D5C] text-white shadow-[0_4px_20px_rgba(94,155,115,0.22),_0_16px_56px_rgba(94,155,115,0.35)]">

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

        {/* 상단 지표 */}
        {wallet.metrics.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {wallet.metrics.map((metric) => (
              <WalletMetricPill key={metric.label} metric={metric} />
            ))}
          </div>
        )}

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
