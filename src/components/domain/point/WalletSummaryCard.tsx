"use client";

import Image from "next/image";
import { useId, useState, useEffect, useRef } from "react";

import { ArrowDown, Plus } from "lucide-react";

import type { WalletSummaryMetric, WalletViewModel } from "@/components/domain/point/pointViewModel";

interface WalletSummaryCardProps {
  wallet: Pick<WalletViewModel, "availableBalance" | "metrics">;
  onOpenCharge: () => void;
}

function HoverHint({ text, align = "center" }: { text: string; align?: "center" | "right" | "left" }) {
  const tooltipId = useId();

  const alignClasses =
    align === "right"
      ? "right-0 translate-x-0"
      : align === "left"
      ? "left-0 translate-x-0"
      : "left-1/2 -translate-x-1/2";

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
        className={`pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-md border border-[var(--color-primary-green)] bg-[var(--color-background)] px-2 py-1 text-[10px] font-semibold leading-snug text-[var(--color-primary-green)] shadow-lg group-hover:block group-focus:block ${alignClasses}`}
      >
        {text}
      </span>
    </button>
  );
}

function WalletMetricPill({ metric }: { metric: WalletSummaryMetric }) {
  return (
    <div className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-white/[0.10] px-3 py-1.5 text-white/90 ring-1 ring-white/[0.10]">
      <span className="truncate text-[11px] font-bold text-white/80">{metric.label}</span>
      <span className="text-[12px] font-black tabular-nums text-white">{metric.value}</span>
      <HoverHint text={metric.caption} />
    </div>
  );
}

export function WalletSummaryCard({ wallet, onOpenCharge }: WalletSummaryCardProps) {
  const [showWithdrawTooltip, setShowWithdrawTooltip] = useState(false);
  const withdrawTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (withdrawTimerRef.current) {
        clearTimeout(withdrawTimerRef.current);
      }
    };
  }, []);

  return (
    <section className="relative rounded-[24px] bg-gradient-to-br from-[#6BAF85] via-[#5E9B73] to-[#4A7D5C] text-white shadow-[0_4px_20px_rgba(94,155,115,0.22),_0_16px_56px_rgba(94,155,115,0.35)]">

      {/* 상단 하이라이트 및 대각선 광택/쉬머 레이어 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/[0.08] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/[0.08] to-transparent" />
        
        {/* 사선 유광 광채 효과 */}
        <div className="absolute -inset-y-20 -left-[100px] w-48 bg-white/10 blur-[40px] transform rotate-[35deg] translate-x-[-150px] animate-[shine_8s_ease-in-out_infinite]" />
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

        {/* 미니 지표 수평 배치 (총 보유금액, 크루 예치금) */}
        {wallet.metrics.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {wallet.metrics.map((metric) => (
              <WalletMetricPill key={metric.label} metric={metric} />
            ))}
          </div>
        )}

        {/* 사용가능 잔액 */}
        <div className="mt-5 flex flex-col">
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
          
          <div className="relative flex flex-col items-center">
            <button
              type="button"
              onClick={() => {
                if (withdrawTimerRef.current) {
                  clearTimeout(withdrawTimerRef.current);
                }
                setShowWithdrawTooltip(true);
                withdrawTimerRef.current = setTimeout(() => {
                  setShowWithdrawTooltip(false);
                  withdrawTimerRef.current = null;
                }, 3000);
              }}
              className="w-full flex h-11 items-center justify-center gap-1.5 rounded-xl bg-white text-sm font-extrabold text-[#4A7D5C] shadow-sm transition-transform active:scale-[0.98]"
              aria-label="도딘 출금 안내 보기"
            >
              <ArrowDown size={16} /> 출금하기
            </button>

            {showWithdrawTooltip && (
              <span
                role="tooltip"
                className="absolute bottom-full mb-2 z-50 w-40 rounded-xl bg-[var(--color-background)] border border-[var(--color-primary-green)] px-3 py-2 text-center text-[10px] font-bold leading-relaxed text-[var(--color-primary-green)] shadow-lg animate-fade-in animate-dropdown-open"
              >
                출금 기능은 현재 준비중입니다.
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
