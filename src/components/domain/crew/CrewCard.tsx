'use client';

import { useState } from 'react';
import { Pin } from 'lucide-react';
import type { CrewListItem, CrewStatus, CrewCategory } from '@/types/domain';
import { CATEGORY_EMOJI } from '@/constants/crew';
import { formatShortDate } from '@/utils/date';
import { getCrewCardViewModel } from '@/utils/crew';

const CATEGORY_BG: Record<CrewCategory, string> = {
  MORNING: 'bg-orange-50',
  READING: 'bg-amber-50',
  EXERCISE: 'bg-blue-50',
  STUDY: 'bg-violet-50',
  DIET: 'bg-green-50',
  OTHER: 'bg-slate-50',
};

interface StatusConfig {
  dot: string;
  text: string;
  label: string;
  progress: string;
}

const STATUS_CONFIG: Record<CrewStatus, StatusConfig> = {
  RECRUITING: {
    dot: 'bg-primary-blue',
    text: 'text-primary-blue',
    label: '모집중',
    progress: 'bg-gradient-to-r from-blue-400 to-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.25)]',
  },
  ACTIVE: {
    dot: 'bg-primary-green animate-pulse',
    text: 'text-primary-green',
    label: '진행중',
    progress: 'bg-gradient-to-r from-green-400 to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.25)]',
  },
  CLOSED: {
    dot: 'bg-text-secondary/50',
    text: 'text-text-secondary',
    label: '종료됨',
    progress: 'bg-text-secondary/30',
  },
  CANCELLED: {
    dot: 'bg-red-400',
    text: 'text-red-500',
    label: '취소됨',
    progress: 'bg-red-300',
  },
};

interface CrewCardProps {
  crew: CrewListItem;
}

export default function CrewCard({ crew }: CrewCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const category = crew.category as CrewCategory;
  const emoji = CATEGORY_EMOJI[category] ?? '📌';
  const categoryBg = CATEGORY_BG[category] ?? 'bg-gray-50';
  const status = STATUS_CONFIG[crew.status];
  const isClosed = crew.status === 'CLOSED' || crew.status === 'CANCELLED';
  const showImage = !!crew.image_url && !imgFailed;

  const {
    currentParticipants,
    fillPercent,
    dDayInfo,
    progressBg,
  } = getCrewCardViewModel(crew, status.progress, isClosed);

  return (
      <div className={`bg-card rounded-[24px] flex flex-col border border-text-secondary/10 shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-[0.985] transition-all duration-300 cursor-pointer group relative overflow-hidden ${isClosed ? 'opacity-60' : ''}`}>
        
        <div className="p-5 flex flex-col gap-4">
          {/* 상단: 이모지 + 크루명/상태 + 보증금 */}
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex-shrink-0 overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${showImage ? '' : `${categoryBg} flex items-center justify-center text-2xl`}`}>
              {showImage ? (
                <img
                  src={crew.image_url!}
                  alt={crew.title}
                  className="w-full h-full object-cover"
                  onError={() => setImgFailed(true)}
                />
              ) : (
                emoji
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-text-primary leading-tight truncate mb-1.5 group-hover:text-primary-green transition-colors duration-200">
                {crew.title}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
                <span className={`text-xs font-semibold ${status.text}`}>{status.label}</span>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-[15px] font-extrabold text-primary-green leading-tight">
                {crew.deposit_amount.toLocaleString()}
                <span className="text-xs font-semibold ml-0.5">원</span>
              </p>
              <p className="text-[10px] text-text-secondary mt-0.5 tracking-tight">보증금 💰</p>
            </div>
          </div>

          {/* 참여 멤버 현황 프로그레스 바 */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-secondary font-medium">참여 멤버 현황</span>
              <span className="text-[11px] font-bold text-text-primary">
                {currentParticipants}명 / {crew.max_participants}명 (최소 {crew.min_participants}명)
              </span>
            </div>
            <div className="w-full h-2.5 bg-text-secondary/10 rounded-full overflow-hidden">
              <div
                  className={`h-full rounded-full transition-all duration-500 ${progressBg}`}
                  style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>

          {/* 하단: 기간 및 D-Day 배지 */}
          <div className="flex items-center justify-between pt-2.5 border-t border-text-secondary/10">
            <div className="relative bg-[#FFFEEA] border border-amber-200/50 shadow-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 rotate-[-1deg] hover:rotate-0 transition-transform duration-300 shrink-0">
              <Pin size={11} className="text-amber-600/70 rotate-45 shrink-0" />
              <span className="text-[11px] font-bold text-amber-800 tracking-tight">
                {formatShortDate(crew.start_at)} ~ {formatShortDate(crew.end_at)}
              </span>
            </div>
            {crew.status === 'RECRUITING' && dDayInfo && (
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                dDayInfo.isUrgent
                  ? 'bg-red-50 text-red-500 border border-red-200/60 animate-pulse'
                  : 'bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}>
                {dDayInfo.label}
              </span>
            )}
          </div>
        </div>
      </div>
  );
}
