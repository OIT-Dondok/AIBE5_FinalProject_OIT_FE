import { CalendarRange, Trophy, WalletCards } from 'lucide-react';
import { Button } from '@/components/common/Button';
import type { SettlementDetailViewModel } from './settlementViewModel';

interface MissionEndCardProps {
  viewModel: SettlementDetailViewModel;
  onViewResult: () => void;
}

// 트로피(중앙 상단)와 겹치지 않도록 좌우 가장자리에만 배치
const CONFETTI = [
  'left-[24px] top-[8px] bg-[#FFC57A]',
  'left-[52px] top-[52px] bg-[#7FB271]',
  'left-[32px] top-[96px] bg-[#D9A93D]',
  'right-[24px] top-[14px] bg-[#9F95D4]',
  'right-[54px] top-[56px] bg-[#E59A6F]',
  'right-[34px] top-[98px] bg-[#4C73D9]',
];

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[140px] overflow-hidden" aria-hidden>
      {CONFETTI.map((cls, index) => (
        <span
          key={cls}
          className={`absolute h-1.5 w-1.5 rotate-45 rounded-[2px] ${cls} ${
            index % 2 === 0 ? 'opacity-95' : 'opacity-80'
          }`}
        />
      ))}
    </div>
  );
}

function CrewMissionMeta({
  viewModel,
  accent,
}: {
  viewModel: SettlementDetailViewModel;
  accent: 'green' | 'blue';
}) {
  if (!viewModel.crewName && !viewModel.missionPeriod) return null;

  const accentText = accent === 'blue' ? 'text-primary-blue' : 'text-primary-green';

  return (
    <div className="relative mt-5 flex flex-col items-center gap-2">
      {viewModel.crewName && (
        <p className="text-xl font-extrabold tracking-[-0.02em] text-text-primary">
          {viewModel.crewName}
        </p>
      )}
      {viewModel.missionPeriod && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-text-secondary/5 px-3 py-1 text-xs font-semibold text-text-secondary">
          <CalendarRange size={13} className={accentText} />
          {viewModel.missionPeriod}
        </span>
      )}
    </div>
  );
}

// 페이지 하단 단일 풀폭 CTA — 결과 상세로 진입 (피드는 전역 BottomNav 피드 탭으로 이동)
function ResultActions({
  onViewResult,
  primaryVariant,
}: {
  onViewResult: () => void;
  primaryVariant: 'primary-green' | 'primary-blue';
}) {
  return (
    <div className="mt-8">
      <Button type="button" variant={primaryVariant} size="lg" fullWidth onClick={onViewResult}>
        결과 보기
      </Button>
    </div>
  );
}

export function MissionEndCard({ viewModel, onViewResult }: MissionEndCardProps) {
  if (viewModel.isAllFail) {
    return <MissionEndAllFailCard viewModel={viewModel} onViewResult={onViewResult} />;
  }

  return (
    <section aria-labelledby="mission-end-title" className="relative">
      <div className="relative pt-2 text-center">
        <Confetti />

        <div className="relative mx-auto flex h-[88px] w-[88px] items-center justify-center rounded-full bg-gradient-to-br from-primary-green to-primary-blue text-white shadow-[0_16px_32px_rgba(76,115,217,0.32)]">
          <Trophy size={44} />
        </div>

        <h1
          id="mission-end-title"
          className="relative mt-5 text-2xl font-black tracking-[-0.03em] text-text-primary"
        >
          {viewModel.title}
        </h1>
        <p className="relative mt-2 text-sm font-medium text-text-secondary">{viewModel.subtitle}</p>

        <CrewMissionMeta viewModel={viewModel} accent="green" />
      </div>

      <div className="mt-7 rounded-card bg-success-green/70 px-5 py-5">
        <p className="text-xs font-bold text-primary-green">최종 환급금</p>
        <p className="mt-1 text-[32px] font-black leading-tight tracking-[-0.03em] text-primary-green">
          {viewModel.totalRefundAmount}
        </p>
        <div className="mt-4 grid grid-cols-2 divide-x divide-primary-green/15 border-t border-primary-green/15 pt-3.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold text-primary-green/70">예치금</span>
            <span className="text-base font-bold text-primary-green">{viewModel.totalLockedAmount}</span>
          </div>
          {viewModel.myShareRatioPercent && (
            <div className="flex flex-col gap-0.5 pl-4">
              <span className="text-[11px] font-semibold text-primary-green/70">최종 지분율</span>
              <span className="text-base font-bold text-primary-green">{viewModel.myShareRatioPercent}</span>
            </div>
          )}
        </div>
      </div>

      <ResultActions onViewResult={onViewResult} primaryVariant="primary-green" />
    </section>
  );
}

function MissionEndAllFailCard({ viewModel, onViewResult }: MissionEndCardProps) {
  return (
    <section aria-labelledby="mission-end-all-fail-title" className="relative">
      <div className="pt-2 text-center">
        <div className="mx-auto flex h-[88px] w-[88px] items-center justify-center rounded-full bg-primary-blue/10 text-primary-blue shadow-[0_14px_28px_rgba(76,115,217,0.16)]">
          <WalletCards size={42} />
        </div>

        <h1
          id="mission-end-all-fail-title"
          className="mt-5 text-2xl font-black tracking-[-0.03em] text-text-primary"
        >
          {viewModel.title}
        </h1>
        <p className="mt-2 text-sm font-medium leading-6 text-text-secondary">{viewModel.subtitle}</p>

        <CrewMissionMeta viewModel={viewModel} accent="blue" />
      </div>

      <div className="mt-7 rounded-card bg-primary-blue/10 px-5 py-5">
        <p className="text-xs font-bold text-primary-blue">최종 환급금</p>
        <p className="mt-1 text-[32px] font-black leading-tight tracking-[-0.03em] text-primary-blue">
          {viewModel.totalRefundAmount}
        </p>
        <div className="mt-4 flex flex-col gap-0.5 border-t border-primary-blue/15 pt-3.5">
          <span className="text-[11px] font-semibold text-primary-blue/70">예치금</span>
          <span className="text-base font-bold text-primary-blue">{viewModel.totalLockedAmount}</span>
        </div>
      </div>

      <ResultActions onViewResult={onViewResult} primaryVariant="primary-blue" />
    </section>
  );
}
