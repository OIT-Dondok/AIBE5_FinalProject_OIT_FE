"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAxiosError } from 'axios';
import { Loader2, Plus } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { FeedCalendar } from '@/components/domain/feed/FeedCalendar';
import { FeedCrewFilter } from '@/components/domain/feed/FeedCrewFilter';
import { FeedDateFilter } from '@/components/domain/feed/FeedDateFilter';
import type { FeedDateMode } from '@/components/domain/feed/FeedDateFilter';
import { FeedItem } from '@/components/domain/feed/FeedItem';
import { FeedSkeletonList } from '@/components/domain/feed/FeedItemSkeleton';
import FeedNoticeList from '@/components/domain/feed/FeedNoticeList';
import { Toast } from '@/components/common/Toast';
import type { ToastType } from '@/components/common/Toast';
import { getFeed } from '@/services/feed';
import { getCrewNotices, getMyCrew } from '@/services/crew';
import type { AvailableCrew, FeedItem as FeedItemType, FeedPeriod, CrewNotice, MyCrew } from '@/types/domain';
import { useAuthStore } from '@/store/authStore';
import { ERROR_CODE } from '@/types/common';
import type { ErrorResponse } from '@/types/common';
import { getKstTodayYmd, getMonthPeriod, toMonthValue } from '@/utils/date';

export default function FeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  // ?crew={crewId}로 진입 시 해당 크루 필터로 초기화 (예: 정산 결과 → 피드 보기)
  const crewParam = Number(searchParams.get('crew'));
  const initialCrewId = Number.isInteger(crewParam) && crewParam > 0 ? crewParam : null;

  const [selectedCrewId, setSelectedCrewId] = useState<number | null>(initialCrewId);
  // null = 전체 기간(날짜 필터 없음). 달력에서 선택 시 from/to 적용
  const [period, setPeriod] = useState<FeedPeriod | null>(null);
  const [dateMode, setDateMode] = useState<FeedDateMode>('period');
  const [selectedDay, setSelectedDay] = useState(() => getKstTodayYmd());
  const [selectedMonth, setSelectedMonth] = useState(() => toMonthValue(getKstTodayYmd()));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 뷰 모드 및 공지사항 관련 상태
  const [viewMode, setViewMode] = useState<'feed' | 'notice'>('feed');
  const [notices, setNotices] = useState<CrewNotice[]>([]);
  const [isNoticesLoading, setIsNoticesLoading] = useState(false);
  const [hostCrews, setHostCrews] = useState<MyCrew[]>([]);
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  // 방장 권한을 가진 크루 목록 로드
  useEffect(() => {
    if (!isInitialized || !user) {
      setHostCrews([]);
      return;
    }
    let active = true;
    getMyCrew('HOST')
      .then((res) => {
        if (active) {
          setHostCrews(res.data.items);
        }
      })
      .catch(() => {
        if (active) {
          setHostCrews([]);
        }
      });
    return () => {
      active = false;
    };
  }, [user, isInitialized]);

  const handleCreateNoticeClick = useCallback(() => {
    // 만약 현재 필터링된 크루가 있고, 내가 그 크루의 방장이라면 즉시 이동
    const isHostOfSelected = selectedCrewId !== null && hostCrews.some((c) => c.crew_id === selectedCrewId);
    if (isHostOfSelected) {
      router.push(`/crews/${selectedCrewId}/host-console/notices/new?from=feed`);
    } else if (hostCrews.length > 0) {
      router.push(`/crews/${hostCrews[0].crew_id}/host-console/notices/new?from=feed`);
    }
  }, [selectedCrewId, hostCrews, router]);

  // URL 쿼리 스트링과 동기화하여 뷰 전환 상태 제어
  const handleSetViewMode = useCallback((mode: 'feed' | 'notice') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (mode === 'notice') {
        params.set('tab', 'notice');
      } else {
        params.delete('tab');
      }
      const newSearch = params.toString();
      const newPath = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      window.history.replaceState(null, '', newPath);
    }
  }, []);

  // 최초 진입 시 또는 URL 쿼리 파라미터가 명시적으로 존재할 때 로드
  useEffect(() => {
    if (tabParam === 'notice') {
      setViewMode('notice');
    } else {
      setViewMode('feed');
    }
  }, [tabParam]);

  const [items, setItems] = useState<FeedItemType[]>([]);
  const [availableCrews, setAvailableCrews] = useState<AvailableCrew[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // 페이지 레벨 토스트: 아이템 제거처럼 하위 컴포넌트가 언마운트되는 경우의 안내를 여기서 띄운다.
  const [toastMessage, setToastMessage] = useState('');
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');

  // 무한 스크롤: 동시 호출 가드 + 옵저버 인스턴스
  const isFetchingMoreRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  // 필터 변경(또는 재시도)마다 증가. 응답 도착 시 epoch가 바뀌었으면 stale 응답으로 보고 폐기한다.
  const requestEpochRef = useRef(0);

  // cursor가 있으면 다음 페이지 append, 없으면 첫 페이지 조회
  const fetchFeed = useCallback(
    async (cursor?: string) => {
      const epoch = requestEpochRef.current;
      try {
        const { data } = await getFeed({
          crew_id: selectedCrewId ?? undefined,
          from: period?.start_date,
          to: period?.end_date,
          cursor,
        });
        // 응답 도착 사이 필터가 바뀌었으면(=다른 쿼리) stale 응답이므로 폐기한다.
        if (epoch !== requestEpochRef.current) return;
        // 서버가 server_time + mission_log_id 기준 최신순 정렬 → 그대로 append
        setItems((prev) => (cursor ? [...prev, ...data.feed_items] : data.feed_items));
        // available_crews는 호출자 참여 크루 목록(페이지네이션 중 불변) → 첫 페이지에서만 갱신
        if (!cursor) setAvailableCrews(data.available_crews);
        setNextCursor(data.next_cursor);
      } catch (err) {
        if (epoch !== requestEpochRef.current) return;
        const code = isAxiosError<ErrorResponse>(err) ? err.response?.data?.code : undefined;
        if (cursor) {
          // 추가 로딩(cursor) 실패. 기존 목록은 그대로 유지한다.
          // INVALID_CURSOR는 커서 자체가 무효이므로 next_cursor를 비워
          // 센티넬을 해제하고 같은 커서로의 재요청 루프를 막는다(=페이지네이션 종료).
          // 그 외(네트워크 일시 오류·5xx 등)는 재시도 가능하므로 커서를 유지해,
          // 다음 스크롤로 센티넬이 재진입하면 같은 커서로 다시 시도한다.
          if (code === ERROR_CODE.INVALID_CURSOR) setNextCursor(null);
          return;
        }
        if (code === ERROR_CODE.CREW_ACCESS_DENIED) {
          setAccessDenied(true);
        } else {
          setHasError(true);
        }
      }
    },
    [selectedCrewId, period],
  );

  // 크루/기간 필터 변경(또는 재시도) 시 처음부터 다시 조회
  useEffect(() => {
    // epoch를 올려 in-flight 요청(첫 페이지·loadMore 모두)을 무효화한다.
    const epoch = (requestEpochRef.current += 1);
    const load = async () => {
      setIsLoading(true);
      setAccessDenied(false);
      setHasError(false);
      setItems([]);
      setNextCursor(null);
      await fetchFeed();
      if (epoch === requestEpochRef.current) setIsLoading(false);
    };
    load();
  }, [fetchFeed, reloadKey]);

  const availableCrewIdsStr = availableCrews.map((c) => c.crew_id).join(',');

  // 크루 선택 변경 시 공지사항 목록 조회 및 뷰모드 초기화
  useEffect(() => {
    let active = true;
    const fetchNotices = async () => {
      setIsNoticesLoading(true);
      try {
        if (selectedCrewId === null) {
          if (availableCrews.length === 0) {
            setNotices([]);
            return;
          }
          const promises = availableCrews.map((crew) =>
            getCrewNotices(crew.crew_id)
              .then((res) => res.data.items)
              .catch(() => {
                return [];
              })
          );
          const allNoticesLists = await Promise.all(promises);
          if (!active) return;
          const flatNotices = allNoticesLists.flat();
          setNotices(flatNotices);
        } else {
          const res = await getCrewNotices(selectedCrewId);
          if (!active) return;
          setNotices(res.data.items);
        }
      } catch {
        if (!active) return;
        setNotices([]);
      } finally {
        if (active) setIsNoticesLoading(false);
      }
    };
    void fetchNotices();
    return () => {
      active = false;
    };
  }, [selectedCrewId, availableCrewIdsStr]);

  // 다음 페이지 로드. ref 가드로 옵저버의 연속 콜백에 의한 중복 호출을 막는다.
  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isFetchingMoreRef.current) return;
    isFetchingMoreRef.current = true;
    setIsLoadingMore(true);
    await fetchFeed(nextCursor);
    setIsLoadingMore(false);
    isFetchingMoreRef.current = false;
  }, [nextCursor, fetchFeed]);

  // 리액션 시 인증 로그가 사라진 경우(MISSION_LOG_NOT_FOUND) 해당 아이템을 목록에서 제거한다.
  // 안내 토스트는 페이지 레벨에서 띄운다. FeedReactionBar에서 띄우면 이 제거로 즉시 언마운트되어
  // 토스트가 보이지 않기 때문이다.
  const handleRemoveItem = useCallback((missionLogId: number) => {
    setItems((prev) => prev.filter((it) => it.mission_log_id !== missionLogId));
    setToastMessage('삭제된 인증이에요.');
    setToastType('warning');
    setIsToastOpen(true);
  }, []);

  // 콜백 ref가 stale 클로저를 잡지 않도록 항상 최신 handleLoadMore를 가리킨다.
  const handleLoadMoreRef = useRef(handleLoadMore);
  useEffect(() => {
    handleLoadMoreRef.current = handleLoadMore;
  }, [handleLoadMore]);

  // 하단 센티넬 DOM이 마운트되는 시점에 옵저버를 부착한다(콜백 ref).
  // useEffect 방식은 소프트 내비게이션 시 노드 부착/effect 실행 타이밍이 어긋나 옵저버가
  // 안 붙는 경우가 있어, 노드 생명주기에 직접 묶이는 콜백 ref로 부착한다.
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) handleLoadMoreRef.current();
      },
      { rootMargin: '200px' },
    );
    observerRef.current.observe(node);
  }, []);

  const handleClearPeriod = useCallback(() => {
    setDateMode('period');
    setPeriod(null);
    setIsCalendarOpen(false);
  }, []);

  const handleDayChange = useCallback((day: string) => {
    setSelectedDay(day);
    setPeriod({ start_date: day, end_date: day });
    setIsCalendarOpen(false);
  }, []);

  const handleMonthChange = useCallback((month: string) => {
    setSelectedMonth(month);
    setPeriod(getMonthPeriod(month));
    setIsCalendarOpen(false);
  }, []);

  const handleDateModeChange = useCallback((mode: FeedDateMode) => {
    setDateMode(mode);
    if (mode === 'daily') {
      setPeriod({ start_date: selectedDay, end_date: selectedDay });
      setIsCalendarOpen(true);
      return;
    }
    if (mode === 'monthly') {
      setPeriod(getMonthPeriod(selectedMonth));
      setIsCalendarOpen(true);
      return;
    }
    setIsCalendarOpen(true);
  }, [selectedDay, selectedMonth]);


  const hasCrews = availableCrews.length > 0;

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
        <Header showLogo />

        {/* 크루 필터 칩 */}
        <FeedCrewFilter
          crews={availableCrews}
          selectedCrewId={selectedCrewId}
          onSelect={setSelectedCrewId}
        />

        {/* 뷰 전환 탭 (참여 중인 크루가 있거나 내가 방장인 크루가 있을 때 노출) */}
        {(availableCrews.length > 0 || hostCrews.length > 0) && (
          <div className="px-5 mb-3 mt-1.5">
            <div className="flex bg-text-secondary/10 p-1 rounded-full w-full max-w-[260px] mx-auto border border-text-secondary/5">
              <button
                type="button"
                onClick={() => handleSetViewMode('feed')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  viewMode === 'feed'
                    ? 'bg-card text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                인증 피드
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('notice')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  viewMode === 'notice'
                    ? 'bg-card text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                공지사항 ({notices.length})
              </button>
            </div>
          </div>
        )}

        <div className="px-5 flex flex-col gap-4">
          {viewMode === 'feed' ? (
            <>
              {/* 기간 필터 */}
              <FeedDateFilter
                mode={dateMode}
                period={period}
                selectedDay={selectedDay}
                selectedMonth={selectedMonth}
                isCalendarOpen={isCalendarOpen}
                onDayChange={handleDayChange}
                onMonthChange={handleMonthChange}
                onClear={handleClearPeriod}
                onToggleCalendar={() => setIsCalendarOpen((v) => !v)}
              />

              {/* 캘린더 */}
              {isCalendarOpen && (
                <FeedCalendar
                  key={dateMode}
                  mode={dateMode}
                  currentPeriod={period}
                  selectionMode={dateMode === 'daily' ? 'single' : 'range'}
                  onModeChange={handleDateModeChange}
                  onApply={(newPeriod) => {
                    if (dateMode === 'daily') {
                      handleDayChange(newPeriod.start_date);
                      return;
                    }
                    if (dateMode === 'monthly') {
                      handleMonthChange(newPeriod.start_date.slice(0, 7));
                      return;
                    }
                    setDateMode('period');
                    setPeriod(newPeriod);
                    setIsCalendarOpen(false);
                  }}
                  onClear={handleClearPeriod}
                  onClose={() => setIsCalendarOpen(false)}
                />
              )}

              {/* 피드 목록 (필터/기간 변경 시 key 변경으로 재진입 애니메이션) */}
              <div
                key={`${selectedCrewId ?? 'all'}-${period?.start_date ?? ''}-${period?.end_date ?? ''}`}
                aria-busy={isLoading}
                className="flex flex-col gap-4"
              >
                {isLoading ? (
                  <FeedSkeletonList count={3} />
                ) : hasError ? (
                  // 조회 실패
                  <EmptyState
                    icon="⚠️"
                    title="피드를 불러오지 못했어요"
                    description="잠시 후 다시 시도해주세요"
                    actionButtonText="다시 시도"
                    onActionClick={() => setReloadKey((k) => k + 1)}
                  />
                ) : accessDenied ? (
                  // 참여하지 않는 크루를 필터링한 경우
                  <EmptyState
                    icon="🔒"
                    title="이 크루의 피드는 볼 수 없어요"
                    description="참여 중인 크루의 인증만 조회할 수 있어요"
                    actionButtonText="전체 크루 보기"
                    onActionClick={() => setSelectedCrewId(null)}
                  />
                ) : !hasCrews ? (
                  // 가입한 크루가 없음
                  <EmptyState
                    icon="🫥"
                    title="아직 가입한 크루가 없어요"
                    description="크루에 가입하고 인증을 시작해보세요"
                    actionButtonText="크루 둘러보기"
                    onActionClick={() => router.push('/crews')}
                  />
                ) : items.length === 0 ? (
                  selectedCrewId !== null ? (
                    // 특정 크루 필터인데 결과 없음
                    <EmptyState
                      icon="📭"
                      title="이 크루는 인증 내역이 없어요"
                      description="다른 크루를 보거나 기간을 바꿔보세요"
                      actionButtonText="전체 크루 보기"
                      onActionClick={() => setSelectedCrewId(null)}
                    />
                  ) : (
                    // 전체 크루인데 결과 없음
                    <EmptyState
                      icon="📭"
                      title="아직 인증 내역이 없어요"
                      description="기간을 바꿔서 다시 확인해보세요"
                      actionButtonText="기간 변경"
                      onActionClick={() => {
                        setDateMode('period');
                        setIsCalendarOpen(true);
                      }}
                    />
                  )
                ) : (
                  <>
                    {items.map((item) => (
                      <FeedItem
                        key={`feed-${item.mission_log_id}`}
                        item={item}
                        onRemove={handleRemoveItem}
                      />
                    ))}
                    {/* 무한 스크롤 센티넬 (다음 페이지가 있을 때만) */}
                    {nextCursor && (
                      <div
                        ref={sentinelRef}
                        aria-hidden="true"
                        className="py-3 flex items-center justify-center"
                      >
                        {isLoadingMore && (
                          <Loader2 size={20} className="animate-spin text-text-secondary/60" />
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            /* 공지사항 카드리스트 */
            <FeedNoticeList
              crewId={selectedCrewId ?? 0}
              notices={notices}
              isLoading={isNoticesLoading}
              crewName={availableCrews.find((c) => c.crew_id === selectedCrewId)?.crew_name}
              availableCrews={availableCrews}
              onNoticeUpdate={(updated) => {
                setNotices((prev) => prev.map((n) => n.notice_id === updated.notice_id ? updated : n));
              }}
            />
          )}
        </div>
      </div>

      {/* 공지 작성 플로팅 버튼 (FAB) */}
      {viewMode === 'notice' && hostCrews.length > 0 && (
        <button
          type="button"
          onClick={handleCreateNoticeClick}
          className="fixed bottom-24 right-5 md:left-1/2 md:right-auto md:translate-x-[160px] z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-green text-white shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-primary-green/20"
          aria-label="공지 작성"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      )}



      <Toast
        message={toastMessage}
        isOpen={isToastOpen}
        type={toastType}
        onClose={() => setIsToastOpen(false)}
      />
    </main>
  );
}
