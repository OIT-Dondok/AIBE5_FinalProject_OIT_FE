'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Chip } from '@/components/common/Chip';
import { EmptyState } from '@/components/common/EmptyState';
import CrewCard from '@/components/domain/crew/CrewCard';
import { MOCK_CREWS } from '@/mocks/data/crews';
import type { CrewStatus, CrewCategory } from '@/mocks/data/crews';

type StatusFilter = CrewStatus | 'ALL';
type CategoryFilter = CrewCategory | 'ALL';

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
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
];

export default function CrewsPage() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('ALL');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCrews = MOCK_CREWS.filter((crew) => {
    if (activeStatus !== 'ALL' && crew.status !== activeStatus) return false;
    if (activeCategory !== 'ALL' && crew.category !== activeCategory) return false;
    if (searchQuery.trim() && !crew.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
      <>
        <Header showLogo={true} />

        <div className="w-full max-w-[430px] mx-auto flex flex-col">

          {/* 상태 탭 */}
          <div className="mx-5 mt-5 flex items-center bg-text-secondary/8 rounded-2xl p-1.5 gap-1">
            {STATUS_TABS.map((tab) => (
                <Chip
                    key={tab.value}
                    label={tab.label}
                    chipType="status"
                    isActive={activeStatus === tab.value}
                    onClick={() => setActiveStatus(tab.value)}
                    className="flex-1 justify-center text-[13px]"
                />
            ))}
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

          {/* 카테고리 칩 필터 */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-5 pt-3 pb-1">
            {CATEGORIES.map((cat) => (
                <Chip
                    key={cat.value}
                    label={cat.label}
                    chipType="category"
                    isActive={activeCategory === cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className="whitespace-nowrap flex-shrink-0"
                />
            ))}
          </div>

          {/* 결과 카운트 */}
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <span className="text-xs text-text-secondary">
            총{' '}
            <span className="font-bold text-text-primary">{filteredCrews.length}</span>
            개의 크루
          </span>
            {activeStatus !== 'ALL' || activeCategory !== 'ALL' || searchQuery ? (
                <button
                    type="button"
                    onClick={() => {
                      setActiveStatus('ALL');
                      setActiveCategory('ALL');
                      setSearchQuery('');
                    }}
                    className="text-[11px] text-primary-green font-semibold hover:opacity-75 transition-opacity"
                >
                  필터 초기화
                </button>
            ) : null}
          </div>

          {/* 크루 카드 리스트 */}
          <div className="flex flex-col gap-3 px-5 pb-10">
            {filteredCrews.length === 0 ? (
                <EmptyState
                    icon="🔍"
                    title="조건에 맞는 크루가 없어요"
                    description="다른 필터를 선택하거나 검색어를 바꿔보세요"
                />
            ) : (
                filteredCrews.map((crew) => (
                    <CrewCard key={crew.crew_id} crew={crew} />
                ))
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