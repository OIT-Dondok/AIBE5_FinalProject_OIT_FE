"use client";

import type { AvailableCrew } from '@/types/domain';

interface FeedCrewFilterProps {
  /** 호출자 참여 크루 목록 (GET /api/feed available_crews). "전체 크루" 칩은 이 컴포넌트가 구성 */
  crews: AvailableCrew[];
  selectedCrewId: number | null;
  onSelect: (crewId: number | null) => void;
}

export function FeedCrewFilter({ crews, selectedCrewId, onSelect }: FeedCrewFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-5 py-3">
      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={selectedCrewId === null}
        className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/50 ${
          selectedCrewId === null
            ? 'bg-primary-green text-white shadow-sm shadow-primary-green/30'
            : 'bg-card border border-text-secondary/20 text-text-secondary hover:bg-text-secondary/5'
        }`}
      >
        전체 크루
      </button>
      {crews.map((crew) => (
        <button
          key={crew.crew_id}
          type="button"
          onClick={() => onSelect(crew.crew_id)}
          aria-pressed={selectedCrewId === crew.crew_id}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/50 ${
            selectedCrewId === crew.crew_id
              ? 'bg-primary-green text-white shadow-sm shadow-primary-green/30'
              : 'bg-card border border-text-secondary/20 text-text-secondary hover:bg-text-secondary/5'
          }`}
        >
          {crew.crew_name}
        </button>
      ))}
    </div>
  );
}
