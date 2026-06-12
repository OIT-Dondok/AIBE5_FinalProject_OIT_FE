'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Skeleton } from '@/components/common/Skeleton';
import { getMyCrew } from '@/services/crew';
import { CATEGORY_EMOJI, CATEGORY_BG } from '@/constants/crew';
import type { MyCrew, CrewStatus } from '@/types/domain';
import { useEffect } from 'react';

type RoleFilter = 'ALL' | 'HOST' | 'MEMBER';

const STATUS_CONFIG: Record<CrewStatus, { dot: string; text: string; label: string }> = {
  RECRUITING: { dot: 'bg-primary-blue', text: 'text-primary-blue', label: '모집중' },
  ACTIVE: { dot: 'bg-primary-green animate-pulse', text: 'text-primary-green', label: '진행중' },
  CLOSED: { dot: 'bg-text-secondary/50', text: 'text-text-secondary', label: '종료됨' },
  CANCELLED: { dot: 'bg-red-400', text: 'text-red-500', label: '취소됨' },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')}`;
}

function MyCrewCard({ crew }: { crew: MyCrew }) {
  const router = useRouter();
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = !!crew.image_url && !imgFailed;
  const emoji = CATEGORY_EMOJI[crew.category] ?? '📌';
  const categoryBg = CATEGORY_BG[crew.category] ?? 'bg-slate-100';
  const status = STATUS_CONFIG[crew.status];
  const isClosed = crew.status === 'CLOSED' || crew.status === 'CANCELLED';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/crews/${crew.crew_id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/crews/${crew.crew_id}`); }}
      className={`bg-card rounded-card p-4 flex flex-col gap-3 border border-text-secondary/10 shadow-card hover:shadow-card-elevated active:scale-[0.985] transition-all duration-200 cursor-pointer ${isClosed ? 'opacity-60' : ''}`}
    >
      {/* 상단: 썸네일 + 크루명/상태 + 보증금 */}
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-2xl flex-shrink-0 overflow-hidden shadow-sm ${showImage ? '' : `${categoryBg} flex items-center justify-center text-2xl`}`}>
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
          <p className="text-[15px] font-bold text-text-primary leading-tight truncate mb-1">
            {crew.title}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
              <span className={`text-xs font-semibold ${status.text}`}>{status.label}</span>
            </div>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                crew.my_role === 'HOST'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {crew.my_role === 'HOST' ? '방장' : '멤버'}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-[15px] font-extrabold text-primary-green leading-tight">
            {crew.deposit_amount.toLocaleString()}
            <span className="text-xs font-semibold ml-0.5">원</span>
          </p>
          <p className="text-[10px] text-text-secondary mt-0.5 tracking-tight">보증금</p>
        </div>
      </div>

      {/* 하단: 기간 */}
      {/* TODO: 정산 API 완료 후 지분율/예상 수익 추가 예정 */}
      <div className="flex items-center gap-1.5 pt-2.5 border-t border-text-secondary/10">
        <Calendar size={11} strokeWidth={2} className="text-text-secondary/70" />
        <span className="text-[11px] text-text-secondary">
          {formatDate(crew.start_at)} ~ {formatDate(crew.end_at)}
        </span>
      </div>
    </div>
  );
}

function MyCrewCardSkeleton() {
  return (
    <div className="bg-card rounded-card p-4 flex flex-col gap-3 border border-text-secondary/10 shadow-card">
      <div className="flex items-center gap-3">
        <Skeleton variant="rect" width={44} height={44} className="rounded-2xl flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
          <Skeleton variant="text" height={16} className="w-3/4" />
          <Skeleton variant="text" height={12} className="w-1/3" />
        </div>
        <Skeleton variant="text" width={56} height={20} />
      </div>
      <Skeleton variant="text" height={12} className="w-1/2" />
    </div>
  );
}

const TABS: { label: string; value: RoleFilter }[] = [
  { label: '전체', value: 'ALL' },
  { label: '방장', value: 'HOST' },
  { label: '참여중', value: 'MEMBER' },
];

export default function MyCrewsPage() {
  const [activeTab, setActiveTab] = useState<RoleFilter>('ALL');
  const [crews, setCrews] = useState<MyCrew[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchCrews = useCallback(async (role: RoleFilter, cursor?: string) => {
    try {
      const res = await getMyCrew(role, cursor);
      return res.data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setCrews([]);
    setNextCursor(null);

    void fetchCrews(activeTab).then((data) => {
      if (data) {
        setCrews(data.items);
        setNextCursor(data.next_cursor);
      }
      setIsLoading(false);
    });
  }, [activeTab, fetchCrews]);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    const data = await fetchCrews(activeTab, nextCursor);
    if (data) {
      setCrews((prev) => [...prev, ...data.items]);
      setNextCursor(data.next_cursor);
    }
    setIsLoadingMore(false);
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-10">
        <Header title="내 크루" showBackButton />

        {/* 탭 */}
        <div className="flex gap-2 px-5 py-4">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 py-2 rounded-[var(--radius-button)] text-sm font-semibold transition-all ${
                activeTab === tab.value
                  ? 'bg-primary-green text-white shadow-sm'
                  : 'bg-card text-text-secondary border border-text-secondary/15 hover:bg-text-secondary/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 목록 */}
        <div className="px-5 flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <MyCrewCardSkeleton key={i} />)
          ) : crews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-4xl">🫂</span>
              <p className="text-sm text-text-secondary font-medium">참여 중인 크루가 없어요</p>
            </div>
          ) : (
            crews.map((crew) => <MyCrewCard key={crew.crew_id} crew={crew} />)
          )}
        </div>

        {/* 더 보기 */}
        {nextCursor && !isLoading && (
          <div className="px-5 mt-4">
            <button
              type="button"
              onClick={() => void handleLoadMore()}
              disabled={isLoadingMore}
              className="w-full py-3 rounded-[var(--radius-button)] text-sm font-semibold text-text-secondary bg-card border border-text-secondary/15 hover:bg-text-secondary/5 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoadingMore ? '불러오는 중...' : '더 보기'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
