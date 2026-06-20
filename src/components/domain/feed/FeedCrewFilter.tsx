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
    <div className="relative w-full flex items-center group">
      {/* 가로 스크롤 컨테이너 */}
      <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar px-5 py-3 pr-10">
        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-pressed={selectedCrewId === null}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/50 ${
            selectedCrewId === null
              ? 'bg-primary-green text-white shadow-sm shadow-primary-green/30'
              : 'bg-card border border-text-secondary/20 text-text-secondary hover:bg-text-secondary/5'
          }`}
        >
          전체 크루
        </button>
        {crews.map((crew) => {
          const isSelected = selectedCrewId === crew.crew_id;
          const branding = getCrewBrandingColor(crew.crew_id);
          
          return (
            <button
              key={crew.crew_id}
              type="button"
              onClick={() => onSelect(crew.crew_id)}
              aria-pressed={isSelected}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs transition-all active:scale-95 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/50 border ${
                isSelected
                  ? `${branding.bgClass} ${branding.textClass} ${branding.borderClass} border-2 font-extrabold shadow-sm`
                  : 'bg-card border-text-secondary/15 text-text-secondary hover:bg-text-secondary/5 font-semibold'
              }`}
            >
              {crew.crew_name}
            </button>
          );
        })}
      </div>
      
      {/* 우측 스크롤 힌트 인디케이터 (더 많은 데이터 표시용) */}
      <div className="absolute right-2 pointer-events-none flex items-center justify-center w-6 h-6 rounded-full bg-card/90 backdrop-blur-sm border border-text-secondary/10 shadow-sm text-text-secondary/60 animate-pulse">
        <ChevronRight size={13} strokeWidth={2.5} />
      </div>
    </div>
  );
}
