'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';
import CrewCard from '@/components/domain/crew/CrewCard';
import CrewFilterBar, { CategoryFilter } from '@/components/domain/crew/CrewFilterBar';
import StatusDropdown from '@/components/domain/crew/StatusDropdown';
import { getCrews } from '@/services/crew';
import type { CrewListItem, CrewStatus } from '@/types/domain';

type StatusFilter = CrewStatus | 'ALL';

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
        <CrewFilterBar activeCategory={activeCategory} onChangeCategory={setActiveCategory} />

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
          <div className="flex items-center gap-2">
            <Link
              href="/my/crews"
              className="text-xs font-bold text-primary-green bg-primary-green/10 border border-primary-green/30 px-3 py-1.5 rounded-full hover:bg-primary-green/15 active:scale-95 transition-all duration-200"
            >
              내 크루 보러가기 🏃
            </Link>
            <StatusDropdown value={activeStatus} onChange={setActiveStatus} />
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
