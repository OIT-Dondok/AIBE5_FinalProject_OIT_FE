import { CalendarRange, Trophy, WalletCards } from 'lucide-react';
import { Button } from '@/components/common/Button';
import type { SettlementDetailViewModel } from './settlementViewModel';

interface MissionEndCardProps {
  viewModel: SettlementDetailViewModel;
  onViewResult: () => void;
  onGoToCrewFeed: () => void;
}

// 트로피(중앙 상단)와 겹치지 않도록 좌우 가장자리에만 배치
const CONFETTI = [
  'left-[40px] top-[20px] bg-[#FFC57A]',
  'left-[66px] top-[58px] bg-[#7FB271]',
  'left-[46px] top-[96px] bg-[#D9A93D]',
  'right-[40px] top-[26px] bg-[#9F95D4]',
  'right-[68px] top-[62px] bg-[#E59A6F]',
  'right-[48px] top-[98px] bg-[#4C73D9]',
];

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[20px]" aria-hidden>
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
    <div className="relative mt-4 flex flex-col items-center gap-2">
      {viewModel.crewName && (
        <p className="text-lg font-extrabold tracking-[-0.02em] text-text-primary">
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

function ResultActions({
  onViewResult,
  onGoToCrewFeed,
  primaryVariant,
}: {
  onViewResult: () => void;
  onGoToCrewFeed: () => void;
  primaryVariant: 'primary-green' | 'primary-blue';
}) {
  return (
    <div className="relative flex gap-2">
      <Button type="button" variant="outline" fullWidth onClick={onGoToCrewFeed}>
        피드로 이동
      </Button>
      <Button type="button" variant={primaryVariant} fullWidth onClick={onViewResult}>
        결과 보기
      </Button>
    </div>
  );
}

export function MissionEndCard({
  viewModel,
  onViewResult,
  onGoToCrewFeed,
}: MissionEndCardProps) {
  if (viewModel.isAllFail) {
    return (
      <MissionEndAllFailCard
        viewModel={viewModel}
        onViewResult={onViewResult}
        onGoToCrewFeed={onGoToCrewFeed}
      />
    );
  }

  return (
    <section
      aria-labelledby="mission-end-title"
      className="relative w-full overflow-hidden rounded-[20px] bg-white p-6 text-center shadow-card"
    >
      <Confetti />

      <div className="relative mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-gradient-to-br from-primary-green to-primary-blue text-white shadow-[0_14px_28px_rgba(76,115,217,0.32)]">
        <Trophy size={40} />
      </div>

      <h1 id="mission-end-title" className="relative mt-3 text-lg font-black tracking-[-0.03em] text-text-primary">
        {viewModel.title}
      </h1>
      <p className="relative mt-1 text-xs font-medium text-text-secondary">
        {viewModel.subtitle}
      </p>

      <CrewMissionMeta viewModel={viewModel} accent="green" />

      <div className="relative mx-3 my-5 rounded-card bg-success-green/70 px-4 py-4">
        <p className="text-xs font-bold text-primary-green">최종 환급금</p>
        <p className="mt-0.5 text-[26px] font-black leading-tight tracking-[-0.03em] text-primary-green">
          {viewModel.totalRefundAmount}
        </p>
        <div className="mt-3 grid grid-cols-2 divide-x divide-primary-green/15 border-t border-primary-green/15 pt-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold text-primary-green/70">예치금</span>
            <span className="text-sm font-bold text-primary-green">{viewModel.totalLockedAmount}</span>
          </div>
          {viewModel.myShareRatioPercent && (
            <div className="flex flex-col gap-0.5 pl-3">
              <span className="text-[11px] font-semibold text-primary-green/70">최종 지분율</span>
              <span className="text-sm font-bold text-primary-green">{viewModel.myShareRatioPercent}</span>
            </div>
          )}
        </div>
      </div>

      <ResultActions
        onViewResult={onViewResult}
        onGoToCrewFeed={onGoToCrewFeed}
        primaryVariant="primary-green"
      />
    </section>
  );
}

function MissionEndAllFailCard({
  viewModel,
  onViewResult,
  onGoToCrewFeed,
}: MissionEndCardProps) {
  return (
    <section
      aria-labelledby="mission-end-all-fail-title"
      className="relative w-full overflow-hidden rounded-[20px] bg-white p-6 text-center shadow-card"
    >
      <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-primary-blue/10 text-primary-blue shadow-[0_12px_24px_rgba(76,115,217,0.16)]">
        <WalletCards size={38} />
      </div>

      <h1 id="mission-end-all-fail-title" className="mt-3 text-lg font-black tracking-[-0.03em] text-text-primary">
        {viewModel.title}
      </h1>
      <p className="mt-2 text-xs font-medium leading-5 text-text-secondary">
        {viewModel.subtitle}
      </p>

      <CrewMissionMeta viewModel={viewModel} accent="blue" />

      <div className="mx-3 my-5 rounded-card bg-primary-blue/10 px-4 py-4">
        <p className="text-xs font-bold text-primary-blue">최종 환급금</p>
        <p className="mt-0.5 text-[26px] font-black leading-tight tracking-[-0.03em] text-primary-blue">
          {viewModel.totalRefundAmount}
        </p>
        <div className="mt-3 flex flex-col gap-0.5 border-t border-primary-blue/15 pt-2.5">
          <span className="text-[11px] font-semibold text-primary-blue/70">예치금</span>
          <span className="text-sm font-bold text-primary-blue">{viewModel.totalLockedAmount}</span>
        </div>
      </div>

      <ResultActions
        onViewResult={onViewResult}
        onGoToCrewFeed={onGoToCrewFeed}
        primaryVariant="primary-blue"
      />
    </section>
  );
}
