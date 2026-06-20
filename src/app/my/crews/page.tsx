'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, Pin } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Skeleton } from '@/components/common/Skeleton';
import { getMyCrew } from '@/services/crew';
import { CATEGORY_EMOJI, CATEGORY_BG } from '@/constants/crew';
import { HostBadge } from '@/components/common/HostBadge';
import { formatShortDate } from '@/utils/date';
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

// ─── 커스텀 드롭다운 ──────────────────────────────────────────

interface StatusDropdownProps {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
}

function StatusDropdown({ value, onChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const selectedLabel = STATUS_OPTIONS.find((o) => o.value === value)?.label ?? '전체';
  const isFiltered = value !== 'ALL';

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        id="my-status-dropdown-btn"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="my-status-dropdown-list"
        onClick={() => setIsOpen((v) => !v)}
        className={`h-9 px-4 flex items-center gap-1.5 text-xs font-bold rounded-full border shadow-sm transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-1 ${
          isFiltered
            ? 'bg-primary-green/10 border-primary-green/30 text-primary-green'
            : 'bg-card border-text-secondary/15 text-text-primary'
        }`}
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          size={12}
          className={`shrink-0 text-text-secondary/60 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id="my-status-dropdown-list"
          role="listbox"
          aria-labelledby="my-status-dropdown-btn"
          tabIndex={-1}
          className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[100px] bg-card border border-text-secondary/10 rounded-2xl shadow-xl py-1 overflow-hidden origin-top-right focus:outline-none animate-dropdown-open"
        >
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-left transition-colors focus:outline-none hover:bg-text-secondary/5 active:bg-text-secondary/10 ${
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

// ─── 상수 ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CrewStatus, { dot: string; text: string; label: string }> = {
  RECRUITING: { dot: 'bg-primary-blue', text: 'text-primary-blue', label: '모집중' },
  ACTIVE: { dot: 'bg-primary-green animate-pulse', text: 'text-primary-green', label: '진행중' },
  CLOSED: { dot: 'bg-text-secondary/50', text: 'text-text-secondary', label: '종료됨' },
  CANCELLED: { dot: 'bg-red-400', text: 'text-red-500', label: '취소됨' },
};

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
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.key === ' ') e.preventDefault();
          router.push(`/crews/${crew.crew_id}`);
        }
      }}
      className={`bg-card rounded-[24px] p-5 flex flex-col gap-4 border border-text-secondary/10 shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-[0.985] transition-all duration-300 cursor-pointer group relative overflow-hidden ${
        isClosed ? 'opacity-60' : ''
      }`}
    >
      {/* 상단: 썸네일 + 크루명 + 상태/역할 배지 + 보증금 */}
      <div className="flex items-center gap-3.5">
        <div
          className={`w-12 h-12 rounded-2xl flex-shrink-0 overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${
            showImage ? '' : `${categoryBg} flex items-center justify-center text-2xl`
          }`}
        >
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
          <p className="text-[15px] font-bold text-text-primary leading-tight truncate mb-1.5 group-hover:text-primary-green transition-colors duration-200">
            {crew.title}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {isPending ? (
              <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm leading-none shrink-0">
                승인 대기
              </span>
            ) : (
              <>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
                <span className={`text-xs font-semibold ${status.text}`}>{status.label}</span>
              </>
            )}
            {!isPending && (
              <>
                <span className="text-text-secondary/30 text-[10px]">·</span>
                {crew.my_role === 'HOST' ? (
                  <HostBadge label="방장" className="shrink-0" />
                ) : (
                  <span className="bg-gradient-to-r from-green-50 to-emerald-100/60 text-green-900 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-200/60 shadow-sm leading-none shrink-0">
                    크루원
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-[15px] font-extrabold text-primary-green leading-tight">
            {crew.deposit_amount.toLocaleString()}
            <span className="text-xs font-semibold ml-0.5">원</span>
          </p>
          <p className="text-[10px] text-text-secondary mt-0.5 tracking-tight">보증금 💰</p>
        </div>
      </div>

      {/* 하단: 미션 수행 기간 카드 (Stationery Motif) */}
      <div className="flex items-center justify-between pt-2.5 border-t border-text-secondary/10">
        <div className="relative bg-[#FFFEEA] border border-amber-200/50 shadow-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 rotate-[-1deg] hover:rotate-0 transition-transform duration-300 shrink-0">
          <Pin size={11} className="text-amber-600/70 rotate-45 shrink-0" />
          <span className="text-[11px] font-bold text-amber-800 tracking-tight">
            {formatShortDate(crew.start_at)} ~ {formatShortDate(crew.end_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

function MyCrewCardSkeleton() {
  return (
    <div className="bg-card rounded-[24px] p-5 flex flex-col gap-4 border border-text-secondary/10 shadow-sm">
      <div className="flex items-center gap-3.5">
        <Skeleton variant="rect" width={48} height={48} className="rounded-2xl flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
          <Skeleton variant="text" height={16} className="w-3/4" />
          <Skeleton variant="text" height={12} className="w-1/3" />
        </div>
        <div className="flex flex-col gap-1 items-end">
          <Skeleton variant="text" width={50} height={16} />
          <Skeleton variant="text" width={35} height={12} />
        </div>
      </div>
      <div className="flex items-center justify-between pt-2.5 border-t border-text-secondary/10">
        <Skeleton variant="rect" width={140} height={26} className="rounded-lg" />
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

    const loadData = async () => {
      setIsLoading(true);
      setCrews([]);
      setNextCursor(null);
      setCrewsError(false);
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
    };

    const timer = setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      controller.abort();
      clearTimeout(timer);
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
        <div className="mx-5 mt-4 mb-3 flex items-center gap-1.5">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            let activeClass = 'bg-primary-green text-white border-primary-green/20 shadow-sm font-bold';
            
            if (tab.value === 'HOST') {
              activeClass = 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border-amber-200/60 shadow-sm font-bold';
            } else if (tab.value === 'MEMBER') {
              activeClass = 'bg-gradient-to-r from-green-50 to-emerald-100/60 text-green-900 border-green-200/60 shadow-sm font-bold';
            }

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 border ${
                  isActive
                    ? activeClass
                    : 'bg-card text-text-secondary border-text-secondary/20 hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 카운트 + 상태 드롭다운 */}
        <div className="px-5 pb-2 flex items-center justify-between">
          <span className="text-xs text-text-secondary font-medium">
            총 <span className="font-extrabold text-text-primary bg-text-secondary/10 px-2 py-0.5 rounded-full">{applyStatusFilter(crews, statusFilter).length}</span>개의 크루
          </span>
          <StatusDropdown value={statusFilter} onChange={setStatusFilter} />
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
              className="w-full py-3 text-sm font-semibold text-primary-green border border-primary-green/30 rounded-2xl hover:bg-primary-green/5 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoadingMore ? '불러오는 중...' : '더 보기'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
