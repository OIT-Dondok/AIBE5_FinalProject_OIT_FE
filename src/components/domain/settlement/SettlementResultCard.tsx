import { forwardRef } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { SettlementResultCardViewModel } from './settlementViewModel';

interface SettlementResultCardProps {
  viewModel: SettlementResultCardViewModel;
}

const DELTA_TEXT = {
  up: 'text-[#8FE0AC]',
  down: 'text-[#FF9C94]',
  flat: 'text-white/55',
} as const;

// 1:1 공유용 결과 카드 — 이 노드가 PNG 캡처 대상이다 (ref 전달 필수)
export const SettlementResultCard = forwardRef<HTMLDivElement, SettlementResultCardProps>(
  function SettlementResultCard({ viewModel }, ref) {
    return (
      <div
        ref={ref}
        className="relative flex aspect-square w-full flex-col overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#0B1117_0%,#101B22_45%,#28403C_70%,#518666_100%)] p-6"
      >
        {/* 바둑판 그리드 (가로세로 선) */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:26px_26px]" />

        {/* 헤더 */}
        <div className="relative flex items-center justify-between">
          <span className="text-lg font-black tracking-[-0.01em] text-white">Dondok</span>
          {viewModel.periodLabel && (
            <span className="text-xs font-semibold text-white/55">{viewModel.periodLabel}</span>
          )}
        </div>

        {/* 크루명 + 순위 */}
        <div className="relative mt-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7FBF95]">
            Mission Complete
          </p>
          <p className="mt-1.5 break-keep text-lg font-bold leading-snug tracking-[-0.01em] text-white/90">
            {viewModel.crewName}
          </p>
          <p className="mt-3 text-xs font-semibold text-white/55">최종 순위</p>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="text-[32px] font-black leading-none tracking-[-0.02em] text-white">
              {viewModel.rankLabel}
            </span>
            <span className="text-base font-semibold text-white/55">
              / {viewModel.totalParticipantsLabel}
            </span>
          </p>
        </div>

        {/* 환급금 + 보증금 대비 */}
        <div className="relative mt-auto">
          <p className="text-xs font-semibold text-white/55">최종 환급금</p>
          <p className="mt-1 text-[32px] font-black leading-none tracking-[-0.03em] text-[#8FE0AC]">
            {viewModel.refundAmount}
          </p>
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-white/55">
            {viewModel.depositComparePrefix}
            <span className={`inline-flex items-center gap-0.5 font-bold ${DELTA_TEXT[viewModel.refundDeltaSign]}`}>
              {viewModel.refundDeltaSign === 'down' ? (
                <TrendingDown size={12} />
              ) : viewModel.refundDeltaSign === 'up' ? (
                <TrendingUp size={12} />
              ) : null}
              {viewModel.refundDeltaLabel}
            </span>
          </p>

          {/* 인증 성공률 */}
          <div className="mt-4 flex items-baseline gap-2 border-t border-white/15 pt-4">
            <span className="text-xs font-semibold text-white/55">인증 성공률</span>
            {viewModel.successRateLabel && (
              <span className="text-xl font-black tracking-[-0.02em] text-white">
                {viewModel.successRateLabel}
              </span>
            )}
            <span className="ml-auto text-sm font-bold text-white/70">
              {viewModel.successCountLabel}
            </span>
          </div>
        </div>
      </div>
    );
  },
);
