"use client";

import type { MyCrewItem } from '@/mocks/data/feed';

interface FeedCrewFilterProps {
  crews: MyCrewItem[];
  selectedCrewId: number | null;
  onSelect: (crewId: number | null) => void;
}

export function FeedCrewFilter({ crews, selectedCrewId, onSelect }: FeedCrewFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-5 py-3">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
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
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 whitespace-nowrap ${
            selectedCrewId === crew.crew_id
              ? 'bg-primary-green text-white shadow-sm shadow-primary-green/30'
              : 'bg-card border border-text-secondary/20 text-text-secondary hover:bg-text-secondary/5'
          }`}
        >
          {crew.crew_title}
        </button>
      ))}
    </div>
  );
}
