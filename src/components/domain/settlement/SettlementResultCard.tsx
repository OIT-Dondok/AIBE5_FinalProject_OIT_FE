import { CalendarRange, Trophy, WalletCards } from 'lucide-react';
import { Button } from '@/components/common/Button';
import type { SettlementDetailViewModel } from './settlementViewModel';

interface SettlementResultCardProps {
  viewModel: SettlementDetailViewModel;
  onViewResult: () => void;
  onGoToCrewFeed: () => void;
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

export function SettlementResultCard({
  viewModel,
  onViewResult,
  onGoToCrewFeed,
}: SettlementResultCardProps) {
  if (viewModel.isAllFail) {
    return (
      <SettlementAllFailRefundCard
        viewModel={viewModel}
        onViewResult={onViewResult}
        onGoToCrewFeed={onGoToCrewFeed}
      />
    );
  }

  return (
    <section
      aria-labelledby="settlement-complete-title"
      className="relative w-full overflow-hidden rounded-[20px] bg-white p-6 text-center shadow-card"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[20px]" aria-hidden>
        {[
          ['#FFC57A', '20px', '15px'],
          ['#9F95D4', '280px', '30px'],
          ['#7FB271', '24px', '60px'],
          ['#E59A6F', '290px', '80px'],
          ['#D9A93D', '60px', '12px'],
          ['#4C73D9', '250px', '55px'],
        ].map(([color, left, top], index) => (
          <span
            key={`${color}-${left}-${top}`}
            className="absolute h-1.5 w-1.5 rotate-45 rounded-[2px]"
            style={{ left, top, backgroundColor: color, opacity: index % 2 === 0 ? 0.95 : 0.8 }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-gradient-to-br from-primary-green to-primary-blue text-white shadow-[0_14px_28px_rgba(76,115,217,0.32)]">
        <Trophy size={40} />
      </div>

      <h1 id="settlement-complete-title" className="relative mt-3 text-lg font-black tracking-[-0.03em] text-text-primary">
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

function SettlementAllFailRefundCard({
  viewModel,
  onViewResult,
  onGoToCrewFeed,
}: SettlementResultCardProps) {
  return (
    <section
      aria-labelledby="settlement-all-fail-title"
      className="relative w-full overflow-hidden rounded-[20px] bg-white p-6 text-center shadow-card"
    >
      <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-primary-blue/10 text-primary-blue shadow-[0_12px_24px_rgba(76,115,217,0.16)]">
        <WalletCards size={38} />
      </div>

      <h1 id="settlement-all-fail-title" className="mt-3 text-lg font-black tracking-[-0.03em] text-text-primary">
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
