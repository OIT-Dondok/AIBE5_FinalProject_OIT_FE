'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronDown } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Chip } from '@/components/common/Chip';
import { Skeleton } from '@/components/common/Skeleton';
import { getMyCrew } from '@/services/crew';
import { CATEGORY_EMOJI, CATEGORY_BG } from '@/constants/crew';
import type { MyCrew, CrewStatus } from '@/types/domain';

// ─── 탭 정의 (role 기준) ─────────────────────────────────────

type RoleTab = 'ALL' | 'HOST' | 'MEMBER';

const TABS: { label: string; value: RoleTab }[] = [
  { label: '전체', value: 'ALL' },
  { label: '방장', value: 'HOST' },
  { label: '크루원', value: 'MEMBER' },
];

// ─── 드롭다운 상태 필터 (FE 필터링) ──────────────────────────

type StatusFilter = 'ALL' | 'PENDING' | 'RECRUITING' | 'ACTIVE' | 'CLOSED';

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: '전체', value: 'ALL' },
  { label: '승인 대기', value: 'PENDING' },
  { label: '시작 전', value: 'RECRUITING' },
  { label: '진행중', value: 'ACTIVE' },
  { label: '종료됨', value: 'CLOSED' },
];

function applyStatusFilter(items: MyCrew[], filter: StatusFilter): MyCrew[] {
  if (filter === 'PENDING') return items.filter((c) => c.my_status === 'PENDING');
  if (filter === 'RECRUITING') return items.filter((c) => c.my_status === 'LOCKED' && c.status === 'RECRUITING');
  if (filter === 'ACTIVE') return items.filter((c) => c.my_status === 'LOCKED' && c.status === 'ACTIVE');
  if (filter === 'CLOSED') return items.filter((c) => c.my_status === 'LOCKED' && (c.status === 'CLOSED' || c.status === 'CANCELLED'));
  return items;
}

// ─── 상수 ────────────────────────────────────────────────────

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

// ─── 카드 ────────────────────────────────────────────────────

function MyCrewCard({ crew }: { crew: MyCrew }) {
  const router = useRouter();
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = !!crew.image_url && !imgFailed;
  const emoji = CATEGORY_EMOJI[crew.category] ?? '📌';
  const categoryBg = CATEGORY_BG[crew.category] ?? 'bg-slate-100';
  const status = STATUS_CONFIG[crew.status];
  const isPending = crew.my_status === 'PENDING';
  const isClosed = crew.status === 'CLOSED' || crew.status === 'CANCELLED';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/crews/${crew.crew_id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/crews/${crew.crew_id}`); }}
      className={`bg-card rounded-card p-4 flex flex-col gap-3 border border-text-secondary/10 shadow-card hover:shadow-card-elevated active:scale-[0.985] transition-all duration-200 cursor-pointer ${isClosed ? 'opacity-60' : ''}`}
    >
      {/* 상단: 썸네일 + 크루명 + 상태/역할 배지 */}
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
          <p className="text-[15px] font-bold text-text-primary leading-tight truncate mb-1.5">
            {crew.title}
          </p>
          <div className="flex items-center gap-1.5">
            {isPending ? (
              <span className="text-[11px] font-semibold text-amber-600">승인 대기 중</span>
            ) : (
              <>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
                <span className={`text-[11px] font-semibold ${status.text}`}>{status.label}</span>
              </>
            )}
            {crew.my_role === 'HOST' && (
              <>
                <span className="text-text-secondary/30 text-[10px]">·</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  방장
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 하단: 기간 + 보증금 */}
      {/* TODO: 정산 API 완료 후 지분율/예상 수익 추가 예정 */}
      <div className="flex items-center justify-between pt-2.5 border-t border-text-secondary/10">
        <div className="flex items-center gap-1.5">
          <Calendar size={11} strokeWidth={2} className="text-text-secondary/70" />
          <span className="text-[11px] text-text-secondary">
            {formatDate(crew.start_at)} ~ {formatDate(crew.end_at)}
          </span>
        </div>
        <span className="text-[12px] font-bold text-primary-green">
          {crew.deposit_amount.toLocaleString()}
          <span className="text-[10px] font-semibold ml-0.5">원</span>
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
      </div>
      <div className="flex items-center justify-between pt-2.5 border-t border-text-secondary/10">
        <Skeleton variant="text" height={12} className="w-1/3" />
        <Skeleton variant="text" width={56} height={14} />
      </div>
    </div>
  );
}

// ─── 페이지 ──────────────────────────────────────────────────

export default function MyCrewsPage() {
  const [activeTab, setActiveTab] = useState<RoleTab>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [crews, setCrews] = useState<MyCrew[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [crewsError, setCrewsError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleTabChange = (tab: RoleTab) => {
    setActiveTab(tab);
    setStatusFilter('ALL');
  };

  const fetchCrews = useCallback(async (role: RoleTab, cursor?: string, signal?: AbortSignal) => {
    const res = await getMyCrew(role, cursor, signal);
    return res.data;
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setCrews([]);
    setNextCursor(null);
    setCrewsError(false);

    void (async () => {
      try {
        const data = await fetchCrews(activeTab, undefined, controller.signal);
        if (controller.signal.aborted) return;
        setCrews(data.items);
        setNextCursor(data.next_cursor);
      } catch {
        if (controller.signal.aborted) return;
        setCrewsError(true);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [activeTab, fetchCrews, retryCount]);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const data = await fetchCrews(activeTab, nextCursor);
      setCrews((prev) => [...prev, ...data.items]);
      setNextCursor(data.next_cursor);
    } catch {
      // load-more 실패는 기존 목록 유지
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-10">
        <Header title="내 크루" showBackButton />

        {/* 탭 */}
        <div className="mx-5 mt-4 mb-3 flex items-center bg-text-secondary/8 rounded-2xl p-1.5 gap-1">
          {TABS.map((tab) => (
            <Chip
              key={tab.value}
              label={tab.label}
              chipType="status"
              isActive={activeTab === tab.value}
              onClick={() => handleTabChange(tab.value)}
              className="flex-1 justify-center text-[13px]"
            />
          ))}
        </div>

        {/* 카운트 + 상태 드롭다운 */}
        <div className="px-5 pb-2 flex items-center justify-between">
          <span className="text-xs text-text-secondary">
            총 <span className="font-bold text-text-primary">{applyStatusFilter(crews, statusFilter).length}</span>개의 크루
          </span>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
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

        {/* 목록 */}
        <div className="px-5 flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <MyCrewCardSkeleton key={i} />)
          ) : crewsError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-4xl">⚠️</span>
              <p className="text-sm text-text-secondary font-medium text-center">크루 목록을 불러오지 못했어요</p>
              <button
                type="button"
                onClick={() => setRetryCount((c) => c + 1)}
                className="text-sm font-semibold text-primary-green hover:opacity-75 transition-opacity"
              >
                다시 시도
              </button>
            </div>
          ) : applyStatusFilter(crews, statusFilter).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-4xl">🫂</span>
              <p className="text-sm text-text-secondary font-medium">참여 중인 크루가 없어요</p>
            </div>
          ) : (
            applyStatusFilter(crews, statusFilter).map((crew) => <MyCrewCard key={crew.crew_id} crew={crew} />)
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
