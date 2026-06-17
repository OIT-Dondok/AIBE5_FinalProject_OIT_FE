'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, Plus, Search, Check, ChevronRight } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';
import CrewCard from '@/components/domain/crew/CrewCard';
import { getCrews } from '@/services/crew';
import type { CrewListItem, CrewStatus, CrewCategory } from '@/types/domain';

type StatusFilter = CrewStatus | 'ALL';
type CategoryFilter = CrewCategory | 'ALL';

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: '전체', value: 'ALL' },
  { label: '모집중', value: 'RECRUITING' },
  { label: '진행중', value: 'ACTIVE' },
  { label: '종료됨', value: 'CLOSED' },
];

const CATEGORIES: { label: string; value: CategoryFilter }[] = [
  { label: '전체', value: 'ALL' },
  { label: '🌅 기상', value: 'MORNING' },
  { label: '📚 독서', value: 'READING' },
  { label: '💪 운동', value: 'EXERCISE' },
  { label: '📝 공부', value: 'STUDY' },
  { label: '🥗 식단', value: 'DIET' },
  { label: '📌 기타', value: 'OTHER' },
];

type GroupedCrews = {
  RECRUITING: CrewListItem[];
  ACTIVE: CrewListItem[];
  CLOSED: CrewListItem[];
};

const SECTION_ORDER: (keyof GroupedCrews)[] = ['RECRUITING', 'ACTIVE', 'CLOSED'];

const SECTION_CONFIG: Record<keyof GroupedCrews, { label: string; badgeClass: string }> = {
  RECRUITING: { label: '모집중', badgeClass: 'bg-blue-500/10 text-blue-600 border border-blue-500/20' },
  ACTIVE: { label: '진행중', badgeClass: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' },
  CLOSED: { label: '종료됨', badgeClass: 'bg-slate-500/10 text-slate-500 border border-slate-500/20' },
};

const CATEGORY_CHIP_STYLES: Record<CategoryFilter, { active: string; inactive: string }> = {
  ALL: {
    active: 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 ring-2 ring-slate-950/20 scale-[1.04] z-10',
    inactive: 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/50',
  },
  MORNING: {
    active: 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 ring-4 ring-orange-500/20 scale-[1.04] z-10',
    inactive: 'bg-orange-50 text-orange-700 hover:bg-orange-100/80 border border-orange-100/30',
  },
  READING: {
    active: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 ring-4 ring-amber-500/20 scale-[1.04] z-10',
    inactive: 'bg-amber-50 text-amber-700 hover:bg-amber-100/80 border border-amber-100/30',
  },
  EXERCISE: {
    active: 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20 scale-[1.04] z-10',
    inactive: 'bg-blue-50 text-blue-700 hover:bg-blue-100/80 border border-blue-100/30',
  },
  STUDY: {
    active: 'bg-violet-500 text-white shadow-lg shadow-violet-500/30 ring-4 ring-violet-500/20 scale-[1.04] z-10',
    inactive: 'bg-violet-50 text-violet-700 hover:bg-violet-100/80 border border-violet-100/30',
  },
  DIET: {
    active: 'bg-green-500 text-white shadow-lg shadow-green-500/30 ring-4 ring-green-500/20 scale-[1.04] z-10',
    inactive: 'bg-green-50 text-green-700 hover:bg-green-100/80 border border-green-100/30',
  },
  OTHER: {
    active: 'bg-slate-600 text-white shadow-lg shadow-slate-600/30 ring-4 ring-slate-600/20 scale-[1.04] z-10',
    inactive: 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/50',
  },
};

interface StatusDropdownProps {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
}

function StatusDropdown({ value, onChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const selectedLabel = STATUS_OPTIONS.find((o) => o.value === value)?.label ?? '전체';
  const isFiltered = value !== 'ALL';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`h-9 px-4 flex items-center gap-1.5 text-xs font-bold rounded-full border shadow-sm transition-all duration-200 active:scale-95 ${
          isFiltered
            ? 'bg-primary-green/10 border-primary-green/30 text-primary-green'
            : 'bg-card border-text-secondary/15 text-text-primary'
        }`}
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          size={12}
          className={`shrink-0 text-text-secondary/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[100px] bg-card border border-text-secondary/10 rounded-2xl shadow-xl py-1 overflow-hidden origin-top-right animate-dropdown-open">
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-left transition-colors hover:bg-text-secondary/5 active:bg-text-secondary/10 ${
                  isSelected ? 'text-primary-green' : 'text-text-primary'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <Check size={12} strokeWidth={3} className="shrink-0 ml-2 text-primary-green" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CrewsPage() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('ALL');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [crews, setCrews] = useState<CrewListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [groupedCrews, setGroupedCrews] = useState<GroupedCrews | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const commonParams = {
      category: activeCategory !== 'ALL' ? activeCategory : undefined,
      keyword: searchQuery.trim() || undefined,
    };

    const fetchCrews = async () => {
      setIsLoading(true);
      try {
        if (activeStatus === 'ALL') {
          const [recruiting, active, closed] = await Promise.all([
            getCrews({ ...commonParams, status: 'RECRUITING' }),
            getCrews({ ...commonParams, status: 'ACTIVE' }),
            getCrews({ ...commonParams, status: 'CLOSED' }),
          ]);
          setGroupedCrews({
            RECRUITING: recruiting.data.items,
            ACTIVE: active.data.items,
            CLOSED: closed.data.items,
          });
          setCrews([]);
          setNextCursor(null);
        } else {
          const res = await getCrews({ ...commonParams, status: activeStatus });
          setCrews(res.data.items);
          setNextCursor(res.data.next_cursor);
          setGroupedCrews(null);
        }
      } catch {
        setCrews([]);
        setNextCursor(null);
        setGroupedCrews(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrews();
  }, [activeStatus, activeCategory, searchQuery]);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoading || activeStatus === 'ALL') return;
    setIsLoading(true);
    try {
      const res = await getCrews({
        status: activeStatus,
        category: activeCategory !== 'ALL' ? activeCategory : undefined,
        keyword: searchQuery.trim() || undefined,
        cursor: nextCursor,
      });
      setCrews((prev) => [...prev, ...res.data.items]);
      setNextCursor(res.data.next_cursor);
    } catch {
      // axios interceptor handles errors
    } finally {
      setIsLoading(false);
    }
  };

  const totalCount =
    activeStatus === 'ALL' && groupedCrews
      ? groupedCrews.RECRUITING.length + groupedCrews.ACTIVE.length + groupedCrews.CLOSED.length
      : crews.length;

  return (
    <>
      <Header showLogo={true} />

      <div className="w-full max-w-[430px] mx-auto flex flex-col">
        {/* 카테고리 탭 (둥근 파스텔 칩 스타일) */}
        <div className="relative w-full overflow-hidden">
          <div className="flex overflow-x-auto no-scrollbar gap-2 px-5 py-4 pr-14">
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.value;
              const chipStyle = CATEGORY_CHIP_STYLES[cat.value];
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setActiveCategory(cat.value)}
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

        {/* 검색바 */}
        <div className="px-5 pt-1 pb-3">
          <div className="relative flex items-center group/search">
            <Search
              size={15}
              strokeWidth={2.5}
              className="absolute left-4 text-text-secondary/40 group-focus-within/search:text-primary-green transition-colors duration-200 pointer-events-none"
            />
            <input
              type="text"
              placeholder="찾고 있는 크루 이름이 있나요?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 text-sm bg-card text-text-primary rounded-full border border-text-secondary/10 shadow-sm focus:border-primary-green focus:ring-4 focus:ring-primary-green/5 focus:outline-none placeholder:text-text-secondary/30 transition-all duration-200"
            />
          </div>
        </div>

        {/* 결과 카운트 + 상태 드롭다운 */}
        <div className="px-5 pt-3 pb-3 flex items-center justify-between">
          <span className="text-xs text-text-secondary font-medium">
            총 <span className="font-extrabold text-text-primary bg-text-secondary/10 px-2 py-0.5 rounded-full">{totalCount}</span>개의 크루
          </span>
          <StatusDropdown value={activeStatus} onChange={setActiveStatus} />
        </div>

        {/* 크루 카드 리스트 */}
        <div className="flex flex-col gap-3 px-5 pb-10">
          {isLoading ? (
            <p className="py-10 text-center text-sm text-text-secondary">불러오는 중...</p>
          ) : activeStatus === 'ALL' && groupedCrews ? (
            totalCount === 0 ? (
              <EmptyState
                icon="🔍"
                title="조건에 맞는 크루가 없어요"
                description="다른 필터를 선택하거나 검색어를 바꿔보세요"
              />
            ) : (
              SECTION_ORDER.filter((key) => groupedCrews[key].length > 0).map((key) => {
                const { label, badgeClass } = SECTION_CONFIG[key];
                const items = groupedCrews[key];
                return (
                  <div key={key} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 pt-1">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                        {label}
                      </span>
                      <span className="text-xs text-text-secondary">{items.length}개</span>
                    </div>
                    {items.map((crew) => (
                      <Link key={crew.crew_id} href={`/crews/${crew.crew_id}`}>
                        <CrewCard crew={crew} />
                      </Link>
                    ))}
                  </div>
                );
              })
            )
          ) : crews.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="조건에 맞는 크루가 없어요"
              description="다른 필터를 선택하거나 검색어를 바꿔보세요"
            />
          ) : (
            crews.map((crew) => (
              <Link key={crew.crew_id} href={`/crews/${crew.crew_id}`}>
                <CrewCard crew={crew} />
              </Link>
            ))
          )}

          {activeStatus !== 'ALL' && nextCursor && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoading}
              className="w-full py-3 text-sm font-semibold text-primary-green border border-primary-green/30 rounded-2xl hover:bg-primary-green/5 transition-colors disabled:opacity-50"
            >
              {isLoading ? '로딩 중...' : '더 보기'}
            </button>
          )}
        </div>
      </div>

      {/* 플로팅 크루 생성 버튼 */}
      <button
        type="button"
        aria-label="크루 생성"
        onClick={() => router.push('/crews/new')}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-primary-green flex items-center justify-center text-white shadow-xl shadow-primary-green/40 hover:opacity-90 active:scale-95 transition-all z-40"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
    </>
  );
}
