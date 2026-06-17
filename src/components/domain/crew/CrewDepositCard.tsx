interface CrewDepositCardProps {
  depositAmount: number;
  currentParticipants: number;
}

export default function CrewDepositCard({ depositAmount, currentParticipants }: CrewDepositCardProps) {
  return (
    <div className="bg-card rounded-[24px] border border-text-secondary/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 flex flex-col gap-4 mt-1">
      <div className="flex items-center justify-between border-b border-text-secondary/5 pb-3">
        <span className="text-xs text-text-primary font-bold">참여 보증금 💳</span>
        <span className="text-lg font-bold text-text-primary">
          {depositAmount.toLocaleString()}원
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-primary font-bold">총 모인 보증금 💰</span>
        <span className="text-2xl font-black text-primary-green">
          {(depositAmount * currentParticipants).toLocaleString()}원
        </span>
      </div>
    </div>
  );
}
