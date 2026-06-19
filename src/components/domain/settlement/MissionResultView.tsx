import { Check, Image as ImageIcon, List, Users } from 'lucide-react';
import { Button } from '@/components/common/Button';
import type { SettlementResultViewModel } from './settlementViewModel';

interface MissionResultViewProps {
  viewModel: SettlementResultViewModel;
  onViewFeed: () => void;
  onCreateCard: () => void;
}

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

// 골드 그라데이션 히어로 — 내 순위·환급금 강조
function HeroCard({ viewModel }: { viewModel: SettlementResultViewModel }) {
  return (
    <section
      className="rounded-card bg-gradient-to-br from-[#FFF4D6] to-[#FFE0A1] px-5 py-7 text-center shadow-[0_6px_22px_rgba(34,30,20,0.06)]"
      aria-labelledby="mission-result-hero"
    >
      {viewModel.heroCrewName && (
        <p className="mx-auto max-w-[16rem] break-keep text-sm font-bold text-[#8A6410]">
          {viewModel.heroCrewName}
        </p>
      )}
      {viewModel.heroSubMeta && (
        <p className="mt-1 text-xs font-medium text-[#8A6410]/75">{viewModel.heroSubMeta}</p>
      )}

      <p className="mt-3 text-[40px] leading-none" aria-hidden>
        {viewModel.isAllFail ? '🤝' : '🏆'}
      </p>

      <h1
        id="mission-result-hero"
        className="mt-3 text-2xl font-black tracking-[-0.03em] text-text-primary"
      >
        {viewModel.heroHeadline}
      </h1>

      {viewModel.heroRefundAmount && (
        <p className="mt-4">
          <span className="text-[28px] font-black tracking-[-0.02em] text-primary-green">
            {viewModel.heroRefundAmount}
          </span>
          <span className="ml-2 text-sm font-bold text-primary-green">환급 완료</span>
        </p>
      )}

      {viewModel.my && (
        <span className="mt-4 inline-flex items-baseline gap-1.5 rounded-full bg-white/70 px-3.5 py-1.5 leading-none text-primary-green shadow-[0_2px_8px_rgba(34,30,20,0.06)]">
          <Check size={15} strokeWidth={2.5} className="self-center" />
          <span className="text-xs font-semibold">성공 인증</span>
          <span className="text-sm font-extrabold">{viewModel.my.recognizedSuccessLabel}</span>
        </span>
      )}
    </section>
  );
}

function RankCard({ rows }: { rows: SettlementResultViewModel['rankRows'] }) {
  return (
    <section
      className="rounded-card bg-card px-4 py-2 shadow-[0_6px_22px_rgba(34,30,20,0.05)]"
      aria-label="팀원 순위"
    >
      <ul className="divide-y divide-text-secondary/10">
        {rows.map((row) => (
          <li
            key={row.id}
            className={`-mx-4 flex items-center gap-3 px-4 py-3 ${
              row.isMe ? 'bg-success-green/40' : ''
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center text-base font-extrabold text-text-secondary">
              {RANK_MEDALS[row.rank] ?? row.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-text-primary">{row.nickname}</p>
              <p className="mt-0.5 text-xs font-medium text-text-secondary">
                지분율 {row.shareRatioPercent}
              </p>
            </div>
            <span className="shrink-0 text-sm font-extrabold text-text-primary">{row.refundAmount}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// 그린 그라데이션 크루 요약 — 함께 만든 성과. 축하 이모지는 성공률 티어(showCelebration)로 게이팅
function CrewSummaryCard({
  crew,
  heading,
  closingMessage,
  showCelebration,
}: {
  crew: SettlementResultViewModel['crew'];
  heading: string;
  closingMessage: string;
  showCelebration: boolean;
}) {
  return (
    <section
      className="rounded-card bg-gradient-to-br from-[#E8F2EB] to-[#DCEFE0] px-5 py-5 shadow-[0_6px_22px_rgba(34,30,20,0.05)]"
      aria-labelledby="crew-summary-title"
    >
      <p
        id="crew-summary-title"
        className="flex items-center gap-1.5 text-xs font-bold text-primary-green"
      >
        <Users size={14} />
        {heading}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-button bg-card/80 px-4 py-3">
          <dt className="text-xs font-medium text-text-secondary">함께 성공한 인증</dt>
          <dd className="mt-1 text-lg font-black tracking-[-0.02em] text-text-primary">
            {crew.totalRecognizedSuccessLabel}
            {showCelebration && <span aria-hidden> 💪</span>}
          </dd>
        </div>
        <div className="rounded-button bg-card/80 px-4 py-3">
          <dt className="text-xs font-medium text-text-secondary">크루 전체 성공률</dt>
          <dd className="mt-1 text-lg font-black tracking-[-0.02em] text-text-primary">
            {crew.successRatePercent}
            {showCelebration && <span aria-hidden> 🎉</span>}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-center text-sm font-medium text-primary-green">{closingMessage}</p>
    </section>
  );
}

export function MissionResultView({ viewModel, onViewFeed, onCreateCard }: MissionResultViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <HeroCard viewModel={viewModel} />

      {viewModel.rankRows.length > 0 && <RankCard rows={viewModel.rankRows} />}

      <CrewSummaryCard
        crew={viewModel.crew}
        heading={viewModel.crewSummaryHeading}
        closingMessage={viewModel.closingMessage}
        showCelebration={viewModel.showCelebration}
      />

      <div className="mt-1 flex gap-2.5">
        <Button type="button" variant="outline" size="lg" fullWidth className="gap-1.5" onClick={onViewFeed}>
          <List size={16} />
          피드 보기
        </Button>
        <Button type="button" variant="primary-blue" size="lg" fullWidth className="gap-1.5" onClick={onCreateCard}>
          <ImageIcon size={16} />
          결과 카드 만들기
        </Button>
      </div>
    </div>
  );
}
