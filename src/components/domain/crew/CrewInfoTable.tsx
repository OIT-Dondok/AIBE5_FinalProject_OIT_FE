'use client';

import { useState } from 'react';
import type { CrewDetail } from '@/types/domain';
import { SETTLEMENT_TYPE_LABEL, SETTLEMENT_TIMES } from '@/constants/crew';
import { ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

const DAY_LABEL: Record<string, string> = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};

interface CrewInfoTableProps {
  crew: CrewDetail;
  confirmedCount: number | null;
  pendingCount: number | null;
}

export default function CrewInfoTable({ crew, confirmedCount, pendingCount }: CrewInfoTableProps) {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const { daily_settlement_type } = crew;
  const times = SETTLEMENT_TIMES[daily_settlement_type];

  const scheduleData = [
    { type: 'A', label: '아침형', deadline: '09:00', settlement: '12:00', gradient: 'from-blue-300 to-sky-300', shadow: 'rgba(147,197,253,0.2)' },
    { type: 'B', label: '표준형', deadline: '21:00', settlement: '00:00', gradient: 'from-emerald-300 to-teal-300', shadow: 'rgba(110,231,183,0.2)' },
    { type: 'C', label: '올빼미형', deadline: '23:59', settlement: '익일 12:00', gradient: 'from-violet-300 to-fuchsia-300', shadow: 'rgba(196,181,253,0.2)' },
  ];

  const getFrequencyLabel = () => {
    if (crew.frequency_type === 'DAILY') {
      return '매일 인증';
    }
    if (crew.frequency_type === 'SPECIFIC_DAYS' && crew.mission_schedule_days && crew.mission_schedule_days.length > 0) {
      const days = crew.mission_schedule_days
        .map((d) => DAY_LABEL[d] ?? d)
        .join(', ');
      return `매주 (${days})`;
    }
    return '기타';
  };

  const activeCount = confirmedCount !== null ? confirmedCount : (crew.current_participants ?? 0);
  const isMinAchieved = activeCount >= crew.min_participants;
  const minAchievedLabel = isMinAchieved ? ' (최소 인원 달성! 🎉)' : '';

  const rows: { label: string; value: string }[] = [
    { label: '인증 주기', value: getFrequencyLabel() },
    {
      label: '인증 타입',
      value: `${daily_settlement_type} · ${SETTLEMENT_TYPE_LABEL[daily_settlement_type]}`,
    },
    { label: '인증 마감', value: `${times.deadline}까지 완료` },
    { label: '인원 (참여 확정)', value: `${activeCount} / ${crew.max_participants}명 (최소 ${crew.min_participants}명)${minAchievedLabel}` },
    ...(pendingCount !== null
      ? [{ label: '승인 대기 인원', value: `${pendingCount}명` }]
      : []),
    { label: '참여 보증금 💳', value: `${crew.deposit_amount.toLocaleString()}원` },
    { label: '총 모인 보증금 💰', value: `${(crew.deposit_amount * activeCount).toLocaleString()}원` },
  ];

  return (
    <div className="flex flex-col mt-2 px-1">
      <div className="bg-card rounded-[24px] border border-text-secondary/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 flex flex-col mt-1">
        {rows.map((row) => {
          const isSettlementType = row.label === '인증 타입';
          const isDeadline = row.label === '인증 마감';
          const isTotalDeposit = row.label === '총 모인 보증금 💰';
          return (
            <div key={row.label} className="flex flex-col border-b border-text-secondary/5 last:border-b-0">
              {isSettlementType ? (
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                  className="w-full flex items-center justify-between py-3.5 transition-colors cursor-pointer hover:bg-text-secondary/5 px-2 -mx-2 rounded-xl text-left"
                >
                  <span className="text-[13px] text-text-primary font-bold flex items-center gap-1.5">
                    {row.label}
                    <span className="text-[10px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded-md font-bold transition-all hover:bg-blue-500/20">
                      시간표 보기
                    </span>
                  </span>
                  <span className="text-[13px] font-bold text-text-primary flex items-center gap-1">
                    {row.value}
                    {isScheduleOpen ? (
                      <ChevronUp size={14} className="text-text-secondary/50 animate-pulse" />
                    ) : (
                      <ChevronDown size={14} className="text-text-secondary/50" />
                    )}
                  </span>
                </button>
              ) : (
                <div className="flex items-center justify-between py-3.5 transition-colors">
                  <span className="text-[13px] text-text-primary font-bold flex items-center gap-1.5">
                    {row.label}
                  </span>
                  <span className={`text-[13px] font-bold flex items-center gap-1 ${isTotalDeposit ? 'text-primary-green' : 'text-text-primary'}`}>
                    {row.value}
                  </span>
                </div>
              )}

              {isDeadline && (
                <p className="text-[11px] text-text-primary/75 pb-3.5 -mt-1 leading-normal font-semibold">
                  ※ 해당 시간까지 인증을 업로드해야 미션 성공으로 처리됩니다.
                </p>
              )}

              {/* 인증 타입 시간표 가이드 아코디언 */}
              {isSettlementType && isScheduleOpen && (
                <div className="flex flex-col gap-2.5 pb-4 pt-1.5 px-0.5 origin-top transition-all duration-300">
                  <div className="grid grid-cols-3 gap-2">
                    {scheduleData.map((item) => {
                      const isCurrent = item.type === daily_settlement_type;
                      return (
                        <div
                          key={item.type}
                          className={`flex flex-col p-3 rounded-2xl border transition-all duration-300 ${
                            isCurrent
                              ? 'bg-card border-primary-green/30 shadow-[0_8px_30px_rgba(0,0,0,0.04)] scale-[1.02] ring-2 ring-primary-green/5'
                              : 'bg-text-secondary/5 border-transparent opacity-80'
                          }`}
                        >
                          <div
                            style={{ boxShadow: `0 0 8px ${item.shadow}` }}
                            className={`w-fit px-2 py-0.5 rounded-full text-[9px] font-extrabold text-white bg-gradient-to-r ${item.gradient} mb-2`}
                          >
                            타입 {item.type}
                          </div>
                          <span className={`text-xs font-black ${isCurrent ? 'text-primary-green' : 'text-text-primary'} mb-1.5`}>
                            {item.label}
                          </span>
                          <div className="flex flex-col text-[10px] text-text-primary/90 gap-1 leading-none font-semibold">
                            <span>마감 {item.deadline}</span>
                            <span>정산 {item.settlement}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Link
        href="/guide"
        className="mt-6 flex items-center justify-between p-4 bg-primary-green/5 border border-primary-green/10 rounded-[20px] hover:bg-primary-green/10 active:scale-[0.99] transition-all duration-200 group"
      >
        <div className="flex flex-col gap-1">
          <span className="text-xs font-extrabold text-primary-green">처음이라 조금 낯선가요?</span>
          <span className="text-[11px] text-[#426E51] font-bold">가이드 페이지에서 상세한 이용 방법을 확인해 보세요</span>
        </div>
        <ChevronRight size={15} className="text-primary-green/50 group-hover:text-primary-green transition-colors" />
      </Link>
    </div>
  );
}
