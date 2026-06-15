'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, Plus, Search } from 'lucide-react';
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
  { label: '기상', value: 'MORNING' },
  { label: '독서', value: 'READING' },
  { label: '운동', value: 'EXERCISE' },
  { label: '공부', value: 'STUDY' },
  { label: '식단', value: 'DIET' },
  { label: '기타', value: 'ETC' },
];

const CATEGORY_CHIP_STYLE: Record<CategoryFilter, { base: string; active: string }> = {
  ALL:      { base: 'bg-slate-100 text-slate-600',  active: 'bg-slate-200 text-slate-700 border border-slate-400' },
  MORNING:  { base: 'bg-amber-100 text-amber-700',  active: 'bg-amber-200 text-amber-800 border border-amber-400' },
  READING:  { base: 'bg-blue-100 text-blue-700',    active: 'bg-blue-200 text-blue-800 border border-blue-400' },
  EXERCISE: { base: 'bg-green-100 text-green-700',  active: 'bg-green-200 text-green-800 border border-green-400' },
  STUDY:    { base: 'bg-violet-100 text-violet-700', active: 'bg-violet-200 text-violet-800 border border-violet-400' },
  DIET:     { base: 'bg-orange-100 text-orange-700', active: 'bg-orange-200 text-orange-800 border border-orange-400' },
  ETC:      { base: 'bg-gray-100 text-gray-600',    active: 'bg-gray-200 text-gray-700 border border-gray-400' },
};

type GroupedCrews = {
  RECRUITING: CrewListItem[];
  ACTIVE: CrewListItem[];
  CLOSED: CrewListItem[];
};

const SECTION_ORDER: (keyof GroupedCrews)[] = ['RECRUITING', 'ACTIVE', 'CLOSED'];

const SECTION_CONFIG: Record<keyof GroupedCrews, { label: string; badgeClass: string }> = {
  RECRUITING: { label: '모집중', badgeClass: 'bg-primary-green text-white' },
  ACTIVE: { label: '진행중', badgeClass: 'bg-primary-blue text-white' },
  CLOSED: { label: '종료됨', badgeClass: 'bg-text-secondary/20 text-text-secondary' },
};

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

        {/* 카테고리 탭 (가로 스크롤, 파스텔 칩 스타일) */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 px-5 py-3">
          {CATEGORIES.map((cat) => {
            const style = CATEGORY_CHIP_STYLE[cat.value];
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
                  activeCategory === cat.value ? style.active : style.base
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 검색바 */}
        <div className="px-5 pt-3">
          <div className="relative flex items-center">
            <Search
              size={15}
              strokeWidth={2.5}
              className="absolute left-3.5 text-text-secondary/50 pointer-events-none"
            />
            <input
              type="text"
              placeholder="크루 이름으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-card text-text-primary rounded-2xl border border-text-secondary/15 shadow-sm focus:border-primary-green focus:outline-none placeholder:text-text-secondary/40 transition-colors"
            />
          </div>
        </div>

        {/* 결과 카운트 + 상태 드롭다운 */}
        <div className="px-5 pt-3 pb-2 flex items-center justify-between">
          <span className="text-xs text-text-secondary">
            총{' '}
            <span className="font-bold text-text-primary">{totalCount}</span>
            개의 크루
          </span>
          <div className="relative">
            <select
              aria-label="크루 상태 필터"
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value as StatusFilter)}
              className="appearance-none text-xs font-semibold text-text-primary bg-card border border-text-secondary/20 rounded-xl pl-3 pr-7 py-1.5 cursor-pointer focus:outline-none focus:border-primary-green transition-colors"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown
              size={12}
              strokeWidth={2.5}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
            />
          </div>
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
