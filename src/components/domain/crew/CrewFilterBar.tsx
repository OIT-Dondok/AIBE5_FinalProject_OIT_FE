'use client';

import { ChevronRight } from 'lucide-react';
import type { CrewCategory } from '@/types/domain';

export type CategoryFilter = CrewCategory | 'ALL';

const CATEGORIES: { label: string; value: CategoryFilter }[] = [
  { label: '전체', value: 'ALL' },
  { label: '🌅 기상', value: 'MORNING' },
  { label: '📚 독서', value: 'READING' },
  { label: '💪 운동', value: 'EXERCISE' },
  { label: '📝 공부', value: 'STUDY' },
  { label: '🥗 식단', value: 'DIET' },
  { label: '📌 기타', value: 'OTHER' },
];

const CATEGORY_CHIP_STYLES: Record<CategoryFilter, { active: string; inactive: string }> = {
  ALL: {
    active: 'bg-[#5E9B73] text-white shadow-lg shadow-[#5E9B73]/20 ring-4 ring-[#5E9B73]/20 scale-[1.04] z-10',
    inactive: 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/50',
  },
  MORNING: {
    active: 'bg-orange-400 text-white shadow-lg shadow-orange-400/30 ring-4 ring-orange-400/20 scale-[1.04] z-10',
    inactive: 'bg-orange-50 text-orange-700 hover:bg-orange-100/80 border border-orange-100/30',
  },
  READING: {
    active: 'bg-amber-400 text-white shadow-lg shadow-amber-400/30 ring-4 ring-amber-400/20 scale-[1.04] z-10',
    inactive: 'bg-amber-50 text-amber-700 hover:bg-amber-100/80 border border-amber-100/30',
  },
  EXERCISE: {
    active: 'bg-blue-400 text-white shadow-lg shadow-blue-400/30 ring-4 ring-blue-400/20 scale-[1.04] z-10',
    inactive: 'bg-blue-50 text-blue-700 hover:bg-blue-100/80 border border-blue-100/30',
  },
  STUDY: {
    active: 'bg-violet-400 text-white shadow-lg shadow-violet-400/30 ring-4 ring-violet-400/20 scale-[1.04] z-10',
    inactive: 'bg-violet-50 text-violet-700 hover:bg-violet-100/80 border border-violet-100/30',
  },
  DIET: {
    active: 'bg-lime-400 text-white shadow-lg shadow-lime-400/30 ring-4 ring-lime-400/20 scale-[1.04] z-10',
    inactive: 'bg-lime-50 text-lime-700 hover:bg-lime-100/80 border border-lime-100/30',
  },
  OTHER: {
    active: 'bg-rose-400 text-white shadow-lg shadow-rose-400/30 ring-4 ring-rose-400/20 scale-[1.04] z-10',
    inactive: 'bg-rose-50 text-rose-700 hover:bg-rose-100/80 border border-rose-100/30',
  },
};

interface CrewFilterBarProps {
  activeCategory: CategoryFilter;
  onChangeCategory: (cat: CategoryFilter) => void;
}

export default function CrewFilterBar({ activeCategory, onChangeCategory }: CrewFilterBarProps) {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex overflow-x-auto no-scrollbar gap-2 px-5 py-4 pr-14">
        {CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.value;
          const chipStyle = CATEGORY_CHIP_STYLES[cat.value];
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onChangeCategory(cat.value)}
              className={`flex-shrink-0 px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 active:scale-95 ${
                isSelected ? chipStyle.active : chipStyle.inactive
              }`}
            >
              {cat.label}
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
