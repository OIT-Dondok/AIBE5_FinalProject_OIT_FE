"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';

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
        // 추가 로딩(cursor) 실패는 기존 목록을 유지한 채 중단한다.
        if (cursor) return;
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

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    await fetchFeed(nextCursor);
    setIsLoadingMore(false);
  };

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
                {nextCursor && (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="mt-1 w-full py-2.5 text-sm font-semibold text-text-secondary border border-text-secondary/20 rounded-button hover:bg-text-secondary/5 transition-colors disabled:opacity-50"
                  >
                    {isLoadingMore ? '불러오는 중...' : '더 보기'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
