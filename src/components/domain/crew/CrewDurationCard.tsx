import { Pin } from 'lucide-react';
import { formatShortDate, calcDurationDays } from '@/utils/date';

interface CrewDurationCardProps {
  startAt: string;
  endAt: string;
}

export default function CrewDurationCard({ startAt, endAt }: CrewDurationCardProps) {
  const startShort = startAt.split('T')[0];
  const endShort = endAt.split('T')[0];
  const durationDays = calcDurationDays(startShort, endShort) ?? 0;

  return (
    <div className="relative bg-[#FFFEEA] rounded-[24px] border border-amber-200/50 shadow-[0_8px_20px_rgba(245,230,150,0.15)] p-5 flex flex-col gap-3.5 mt-1 rotate-[-1deg] hover:rotate-0 transition-transform duration-300 group/postit">
      {/* 상단 핀 데코레이션 */}
      <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 z-10 w-6 h-6 bg-amber-100 border border-amber-200 rounded-full shadow-sm flex items-center justify-center">
        <Pin size={12} className="text-amber-600 rotate-45 shrink-0" />
      </div>

      <div className="flex flex-col gap-1 border-b border-amber-200/40 pb-2.5 mt-1">
        <span className="text-xs text-amber-950 font-black">미션 수행 기간 📅</span>
        <span className="text-lg font-black text-[#DB5C55]">
          총 {durationDays}일간 진행
        </span>
      </div>
      <div className="flex items-center justify-center py-1">
        <span className="text-[14px] font-black text-amber-950 tracking-tight">
          {formatShortDate(startAt)} ~ {formatShortDate(endAt)}
        </span>
      </div>
    </div>
  );
}
