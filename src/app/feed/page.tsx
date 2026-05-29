"use client";

import { useState } from 'react';

import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { FeedCalendar } from '@/components/domain/feed/FeedCalendar';
import { FeedCertifyButton } from '@/components/domain/feed/FeedCertifyButton';
import { FeedCrewFilter } from '@/components/domain/feed/FeedCrewFilter';
import { FeedItem } from '@/components/domain/feed/FeedItem';
import { FeedPeriodCard } from '@/components/domain/feed/FeedPeriodCard';
import { MOCK_FEED_ITEMS, MOCK_FEED_PERIOD, MOCK_MY_CREWS } from '@/mocks/data/feed';
import type { FeedPeriod } from '@/mocks/data/feed';

export default function FeedPage() {
  const [selectedCrewId, setSelectedCrewId] = useState<number | null>(null);
  const [period, setPeriod] = useState<FeedPeriod>(MOCK_FEED_PERIOD);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const filteredItems = MOCK_FEED_ITEMS.filter((item) => {
    if (selectedCrewId !== null && item.crew_id !== selectedCrewId) return false;
    const certDate = item.certified_at.substring(0, 10);
    if (certDate < period.start_date || certDate > period.end_date) return false;
    return true;
  });

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

          {/* 피드 목록 */}
          {filteredItems.length === 0 ? (
            <EmptyState
              icon="📭"
              title="이 기간에 인증 내역이 없어요"
              description="기간이나 크루 필터를 바꿔보세요"
            />
          ) : (
            filteredItems.map((item) => (
              <FeedItem key={item.feed_id} item={item} />
            ))
          )}
        </div>
      </div>

      <FeedCertifyButton selectedCrewId={selectedCrewId} crews={MOCK_MY_CREWS} />
    </main>
  );
}
