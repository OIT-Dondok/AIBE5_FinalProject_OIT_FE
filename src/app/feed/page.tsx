"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { FeedCalendar } from '@/components/domain/feed/FeedCalendar';
import { FeedCrewFilter } from '@/components/domain/feed/FeedCrewFilter';
import { FeedItem } from '@/components/domain/feed/FeedItem';
import { FeedSkeletonList } from '@/components/domain/feed/FeedItemSkeleton';
import { FeedPeriodCard } from '@/components/domain/feed/FeedPeriodCard';
import { MOCK_FEED_ITEMS, MOCK_FEED_PERIOD, MOCK_MY_CREWS } from '@/mocks/data/feed';
import type { FeedPeriod } from '@/mocks/data/feed';

export default function FeedPage() {
  const router = useRouter();
  const [selectedCrewId, setSelectedCrewId] = useState<number | null>(null);
  const [period, setPeriod] = useState<FeedPeriod>(MOCK_FEED_PERIOD);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  // TODO: API - 피드 fetch 로딩 상태로 교체 (true면 스켈레톤 노출)
  const isLoading = false;

  // TODO: API - 내 가입 크루 목록을 GET /me/crews 응답으로 교체 (필터 칩 + 가입 여부 판단)
  const hasCrews = MOCK_MY_CREWS.length > 0;

  // TODO: API - MOCK_FEED_ITEMS를 GET /feeds?crewId={selectedCrewId}&startDate={}&endDate={} 응답으로 교체.
  //            아래 필터/정렬(최신순)은 서버 쿼리 파라미터·정렬로 이관 예정.
  const filteredItems = MOCK_FEED_ITEMS.filter((item) => {
    if (selectedCrewId !== null && item.crew_id !== selectedCrewId) return false;
    const certDate = item.certified_at.substring(0, 10);
    if (certDate < period.start_date || certDate > period.end_date) return false;
    return true;
  }).sort(
    // 최신 인증부터 노출 (certified_at 내림차순)
    (a, b) => b.certified_at.localeCompare(a.certified_at),
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
        <Header showLogo />

        {/* 크루 필터 칩 */}
        <FeedCrewFilter
          crews={MOCK_MY_CREWS}
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
              onClose={() => setIsCalendarOpen(false)}
            />
          )}

          {/* 피드 목록 (필터/기간 변경 시 key 변경으로 재진입 애니메이션) */}
          <div
            key={`${selectedCrewId ?? 'all'}-${period.start_date}-${period.end_date}`}
            aria-busy={isLoading}
            className="flex flex-col gap-4"
          >
          {isLoading ? (
            <FeedSkeletonList count={3} />
          ) : !hasCrews ? (
            // 케이스 1: 가입한 크루가 없음
            <EmptyState
              icon="🫥"
              title="아직 가입한 크루가 없어요"
              description="크루에 가입하고 인증을 시작해보세요"
              actionButtonText="크루 둘러보기"
              onActionClick={() => router.push('/crews')}
            />
          ) : filteredItems.length === 0 ? (
            selectedCrewId !== null ? (
              // 케이스 2: 특정 크루 필터인데 이 기간에 결과 없음
              <EmptyState
                icon="📭"
                title="이 크루는 이 기간에 인증 내역이 없어요"
                description="다른 크루를 보거나 기간을 바꿔보세요"
                actionButtonText="전체 크루 보기"
                onActionClick={() => setSelectedCrewId(null)}
              />
            ) : (
              // 케이스 3: 전체 크루인데 이 기간에 결과 없음
              <EmptyState
                icon="📭"
                title="이 기간에 인증 내역이 없어요"
                description="기간을 바꿔서 다시 확인해보세요"
                actionButtonText="기간 변경"
                onActionClick={() => setIsCalendarOpen(true)}
              />
            )
          ) : (
            filteredItems.map((item) => (
              <FeedItem key={item.feed_id} item={item} />
            ))
          )}
          </div>
        </div>
      </div>

    </main>
  );
}
