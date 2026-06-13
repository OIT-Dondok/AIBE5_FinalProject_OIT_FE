import { Trophy, WalletCards } from 'lucide-react';
import { Button } from '@/components/common/Button';
import type { SettlementDetailViewModel } from './settlementViewModel';

interface SettlementResultCardProps {
  viewModel: SettlementDetailViewModel;
  onPrimaryAction: () => void;
}

export function SettlementResultCard({
  viewModel,
  onPrimaryAction,
}: SettlementResultCardProps) {
  if (viewModel.isAllFail) {
    return <SettlementAllFailRefundCard viewModel={viewModel} onPrimaryAction={onPrimaryAction} />;
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
        최종 정산이 완료됐어요
      </h1>
      <p className="relative mt-1 text-xs font-medium text-text-secondary">
        {viewModel.finishedAtLabel} · {viewModel.totalParticipants}
      </p>

      <div className="relative my-5 rounded-card bg-success-green/70 px-4 py-4">
        <p className="text-xs font-bold text-primary-green">내 최종 환급액</p>
        <p className="mt-1 text-3xl font-black tracking-[-0.03em] text-primary-green">
          {viewModel.totalRefundAmount}
        </p>
        <p className="mt-1 text-xs font-semibold text-primary-green">내 예치금 {viewModel.totalLockedAmount}</p>
      </div>

      <div className="relative">
        <Button type="button" variant="primary-green" onClick={onPrimaryAction}>
          크루로 이동
        </Button>
      </div>
    </section>
  );
}

function SettlementAllFailRefundCard({
  viewModel,
  onPrimaryAction,
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
        전원 원금 환급이 완료됐어요
      </h1>
      <p className="mt-2 text-xs font-medium leading-5 text-text-secondary">
        인정된 성공 기록이 없어 지분 정산 없이 예치금 전액을 돌려드렸어요.
      </p>

      <div className="my-5 rounded-card bg-primary-blue/10 px-4 py-4">
        <p className="text-xs font-bold text-primary-blue">내 환급액</p>
        <p className="mt-1 text-3xl font-black tracking-[-0.03em] text-primary-blue">
          {viewModel.totalRefundAmount}
        </p>
        <p className="mt-1 text-xs font-semibold text-primary-blue">내 예치금 {viewModel.totalLockedAmount}</p>
      </div>

      <div className="grid gap-2">
        <Button type="button" variant="primary-blue" onClick={onPrimaryAction}>
          크루로 이동
        </Button>
      </div>
    </section>
  );
}
