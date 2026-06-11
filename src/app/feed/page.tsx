"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { Loader2 } from 'lucide-react';

import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { FeedCalendar } from '@/components/domain/feed/FeedCalendar';
import { FeedCrewFilter } from '@/components/domain/feed/FeedCrewFilter';
import { FeedItem } from '@/components/domain/feed/FeedItem';
import { FeedSkeletonList } from '@/components/domain/feed/FeedItemSkeleton';
import { FeedPeriodCard } from '@/components/domain/feed/FeedPeriodCard';
import { getFeed } from '@/services/feed';
import type { AvailableCrew, FeedItem as FeedItemType, FeedPeriod } from '@/types/domain';
import type { ErrorResponse } from '@/types/common';

export default function FeedPage() {
  const router = useRouter();
  const [selectedCrewId, setSelectedCrewId] = useState<number | null>(null);
  // null = 전체 기간(날짜 필터 없음). 달력에서 선택 시 from/to 적용
  const [period, setPeriod] = useState<FeedPeriod | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [items, setItems] = useState<FeedItemType[]>([]);
  const [availableCrews, setAvailableCrews] = useState<AvailableCrew[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // 무한 스크롤: 동시 호출 가드 + 옵저버 인스턴스
  const isFetchingMoreRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // cursor가 있으면 다음 페이지 append, 없으면 첫 페이지 조회
  const fetchFeed = useCallback(
    async (cursor?: string) => {
      try {
        const { data } = await getFeed({
          crew_id: selectedCrewId ?? undefined,
          from: period?.start_date,
          to: period?.end_date,
          cursor,
        });
        // 서버가 server_time + mission_log_id 기준 최신순 정렬 → 그대로 append
        setItems((prev) => (cursor ? [...prev, ...data.feed_items] : data.feed_items));
        setAvailableCrews(data.available_crews);
        setNextCursor(data.next_cursor);
      } catch (err) {
        // 추가 로딩(cursor) 실패(INVALID_CURSOR 등): 기존 목록은 유지하되,
        // next_cursor를 비워 센티넬을 해제하고 같은 커서로의 재요청 루프를 막는다.
        if (cursor) {
          setNextCursor(null);
          return;
        }
        if (isAxiosError<ErrorResponse>(err) && err.response?.data?.code === 'CREW_ACCESS_DENIED') {
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
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setAccessDenied(false);
      setHasError(false);
      setItems([]);
      setNextCursor(null);
      await fetchFeed();
      if (!cancelled) setIsLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchFeed, reloadKey]);

  // 다음 페이지 로드. ref 가드로 옵저버의 연속 콜백에 의한 중복 호출을 막는다.
  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isFetchingMoreRef.current) return;
    isFetchingMoreRef.current = true;
    setIsLoadingMore(true);
    await fetchFeed(nextCursor);
    setIsLoadingMore(false);
    isFetchingMoreRef.current = false;
  }, [nextCursor, fetchFeed]);

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

  const hasCrews = availableCrews.length > 0;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
        <Header showLogo />

        {/* 크루 필터 칩 */}
        <FeedCrewFilter
          crews={availableCrews}
          selectedCrewId={selectedCrewId}
          onSelect={setSelectedCrewId}
        />

        <div className="px-5 flex flex-col gap-4">
          {/* 기간 카드 */}
          <FeedPeriodCard
            period={period}
            isCalendarOpen={isCalendarOpen}
            onOpenCalendar={() => setIsCalendarOpen((v) => !v)}
          />

          {/* 캘린더 */}
          {isCalendarOpen && (
            <FeedCalendar
              currentPeriod={period}
              onApply={(newPeriod) => {
                setPeriod(newPeriod);
                setIsCalendarOpen(false);
              }}
              onClear={() => {
                setPeriod(null);
                setIsCalendarOpen(false);
              }}
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
                  onActionClick={() => setIsCalendarOpen(true)}
                />
              )
            ) : (
              <>
                {items.map((item) => (
                  <FeedItem key={item.mission_log_id} item={item} />
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
        </div>
      </div>
    </main>
  );
}
