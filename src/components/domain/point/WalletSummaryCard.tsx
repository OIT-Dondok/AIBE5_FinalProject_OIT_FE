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
    <section className="relative rounded-[24px] bg-[#5E9B73] text-white shadow-[0_8px_24px_rgba(34,34,34,0.12)] overflow-hidden border border-white/10 p-0.5 pb-4 pt-2">

      {/* 카드 홀더 슬롯 내부 카드 (컴팩트 규격으로 높이 축소) */}
      <div className="mx-3.5 mb-2 rounded-t-[12px] bg-[#F5F0E6] border border-white/20 p-3 pb-5 pt-3 text-slate-800 shadow-[0_3px_6px_rgba(0,0,0,0.06)] relative z-10 transition-transform duration-300 hover:-translate-y-0.5 flex items-center justify-center">
        <Image
          src="/images/logo/dondok-logo.png"
          alt="돈독"
          width={76}
          height={20}
          className="object-contain brightness-0 opacity-80 select-none"
        />
      </div>

      {/* 가죽 홀더 포켓 덮개 (더 타이트한 상단 마진 및 패딩 조절) */}
      <div className="relative bg-[#5E9B73] rounded-b-[22px] mx-0.5 -mt-3.5 pt-4 px-3.5 pb-0.5 z-20">

        {/* 가죽 겉면을 정교하게 감싸는 점선 스티칭 */}
        <div className="absolute inset-1 rounded-[18px] border border-dashed border-white/20 pointer-events-none z-10" />

        {/* 포켓 곡선 커팅 입체 엣지 장식 */}
        <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-b from-black/8 to-transparent pointer-events-none" />

        {/* 미니 지표 수평 배치 (총 보유금액, 크루 예치금) */}
        {wallet.metrics.length > 0 && (
          <div className="z-20 relative px-1 flex items-center gap-4 mb-3 border-b border-white/10 pb-2">
            {wallet.metrics.map((metric, idx) => (
              <div key={metric.label} className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-white/60 text-[11px]">{metric.label}</span>
                <span className="font-extrabold text-[12.5px] text-white">{metric.value}</span>
                <HoverHint 
                  text={metric.caption} 
                  align={idx === wallet.metrics.length - 1 ? "right" : "center"} 
                />
              </div>
            ))}
          </div>
        )}

        {/* 사용가능 잔액 */}
        <div className="z-20 relative px-1 flex flex-col">
          <p className="text-[11px] font-bold text-white/80">사용가능 잔액</p>
          <div className="mt-1 flex items-end gap-1">
            <span className={`font-black leading-none tracking-[-0.04em] tabular-nums text-white transition-all duration-200 ${
              wallet.availableBalance.replace("원", "").trim().length > 11
                ? "text-[22px]"
                : wallet.availableBalance.replace("원", "").trim().length > 8
                ? "text-[26px]"
                : wallet.availableBalance.replace("원", "").trim().length > 6
                ? "text-[30px]"
                : "text-[34px]"
            }`}>
              {wallet.availableBalance.replace("원", "")}
            </span>
            <span className="pb-0.5 text-xs font-bold text-white/70">원</span>
          </div>
        </div>

        {/* 버튼 (출금 미지원 버튼을 충전과 동일한 톤의 활성화된 흰색 버튼 비주얼로 업그레이드) */}
        <div className="mt-4 grid grid-cols-2 gap-2 relative z-20 pb-0.5">
          <button
            type="button"
            onClick={onOpenCharge}
            className="flex h-[38px] items-center justify-center gap-1.5 rounded-lg bg-white text-xs font-extrabold text-[#5E9B73] shadow-md transition-transform active:scale-[0.98] hover:bg-neutral-50"
          >
            <Plus size={14} strokeWidth={3} /> 도딘 충전
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
              className="w-full flex h-[38px] items-center justify-center gap-1.5 rounded-lg bg-white text-xs font-extrabold text-[#5E9B73] shadow-md transition-transform active:scale-[0.98] hover:bg-neutral-50"
              aria-label="도딘 출금 안내 보기"
            >
              <ArrowDown size={14} /> 출금하기

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

