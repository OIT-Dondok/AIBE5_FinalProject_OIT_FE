"use client";

import type { AvailableCrew } from '@/types/domain';
import { getCrewBrandingColor } from '@/components/domain/feed/feedItemMeta';
import { ChevronRight } from 'lucide-react';

interface FeedCrewFilterProps {
  /** 호출자 참여 크루 목록 (GET /api/feed available_crews). "전체 크루" 칩은 이 컴포넌트가 구성 */
  crews: AvailableCrew[];
  selectedCrewId: number | null;
  onSelect: (crewId: number | null) => void;
}

export function FeedCrewFilter({ crews, selectedCrewId, onSelect }: FeedCrewFilterProps) {
  return (
    <div className="relative w-full overflow-hidden">
      {/* 가로 스크롤 컨테이너 */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 px-5 py-4 pr-14">
        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-pressed={selectedCrewId === null}
          className={`flex-shrink-0 px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 active:scale-95 focus-visible:outline-none ${
            selectedCrewId === null
              ? 'bg-[#5E9B73] text-white shadow-lg shadow-[#5E9B73]/20 ring-2 ring-[#5E9B73]/20 scale-[1.04] z-10'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/50'
          }`}
        >
          전체 크루
        </button>
        {crews.map((crew) => {
          const isSelected = selectedCrewId === crew.crew_id;
          const branding = getCrewBrandingColor(crew.crew_id, crew.crew_name);
          
          return (
            <button
              key={crew.crew_id}
              type="button"
              onClick={() => onSelect(crew.crew_id)}
              aria-pressed={isSelected}
              className={`flex-shrink-0 px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 active:scale-95 whitespace-nowrap focus-visible:outline-none ${
                isSelected ? branding.active : branding.inactive
              }`}
            >
              {crew.crew_name}
            </button>
          );
        })}
      </div>
      
      {/* 우측 페이드 & 스크롤 암시 아이콘 */}
      <div className="absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none flex items-center justify-end pr-0.5 overflow-hidden">
        <ChevronRight size={18} className="text-text-secondary/40 translate-x-1.5 animate-pulse shrink-0" strokeWidth={3} />
      </div>
    </div>
  );
}
