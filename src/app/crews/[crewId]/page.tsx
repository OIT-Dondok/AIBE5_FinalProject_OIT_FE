'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { MoreHorizontal } from 'lucide-react';
import { Header } from '@/components/common/Header';
import CrewDetailTabs from '@/components/domain/crew/CrewDetailTabs';
import CrewJoinButton from '@/components/domain/crew/CrewJoinButton';
import { getCrew } from '@/services/crew';
import type { CrewDetail, DailySettlementType } from '@/types/domain';
import type { ErrorResponse } from '@/types/common';

const CATEGORY_EMOJI: Record<string, string> = {
  MORNING: '🌅',
  READING: '📚',
  EXERCISE: '💪',
  STUDY: '📝',
  DIET: '🥗',
  MIND: '🧘',
  HEALTH: '❤️',
};

const CATEGORY_LABEL: Record<string, string> = {
  MORNING: '기상',
  READING: '독서',
  EXERCISE: '운동',
  STUDY: '공부',
  DIET: '식단',
  MIND: '마음',
  HEALTH: '건강',
};

const CATEGORY_BG: Record<string, string> = {
  MORNING: 'bg-orange-100',
  READING: 'bg-amber-100',
  EXERCISE: 'bg-blue-100',
  STUDY: 'bg-violet-100',
  DIET: 'bg-green-100',
  MIND: 'bg-teal-100',
  HEALTH: 'bg-rose-100',
};

const SETTLEMENT_TYPE_LABEL: Record<DailySettlementType, string> = {
  A: '아침형',
  B: '표준형',
  C: '올빼미형',
};

export default function CrewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const crewId = Number(params.crewId);

  const [crew, setCrew] = useState<CrewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchCrew = async () => {
      setIsLoading(true);
      try {
        const res = await getCrew(crewId);
        setCrew(res.data);
      } catch (err) {
        if (isAxiosError<ErrorResponse>(err) && err.response?.data?.code === 'CREW_NOT_FOUND') {
          setNotFound(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (crewId) fetchCrew();
  }, [crewId]);

  if (notFound) {
    return (
      <>
        <Header showBackButton />
        <div className="w-full max-w-[430px] mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5">
          <p className="text-5xl">🔍</p>
          <p className="text-base font-bold text-text-primary">크루를 찾을 수 없습니다</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-primary-green font-semibold hover:opacity-75 transition-opacity"
          >
            뒤로 가기
          </button>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Header showBackButton />
        <div className="w-full max-w-[430px] mx-auto">
          <div className="w-full h-52 bg-text-secondary/10 animate-pulse" />
          <div className="px-5 py-4 flex flex-col gap-3">
            <div className="h-5 w-2/3 bg-text-secondary/10 rounded-full animate-pulse" />
            <div className="h-4 w-1/3 bg-text-secondary/10 rounded-full animate-pulse" />
            <div className="mt-2 h-[1px] w-full bg-text-secondary/10" />
            <div className="h-40 w-full bg-text-secondary/10 rounded-card animate-pulse" />
          </div>
        </div>
      </>
    );
  }

  if (!crew) return null;

  const emoji = CATEGORY_EMOJI[crew.category] ?? '📌';
  const categoryLabel = CATEGORY_LABEL[crew.category] ?? crew.category;
  const categoryBg = CATEGORY_BG[crew.category] ?? 'bg-gray-100';

  return (
    <>
      <Header
        showBackButton
        title={crew.title}
        rightElement={
          <button
            type="button"
            aria-label="더보기"
            className="p-1 -mr-1 hover:opacity-75 active:scale-95 transition-all"
          >
            <MoreHorizontal size={22} className="text-text-primary" />
          </button>
        }
      />

      <div className="w-full max-w-[430px] mx-auto pb-32">
        {/* 크루 이미지 */}
        <div className="w-full h-52 overflow-hidden">
          {crew.image_url ? (
            <img
              src={crew.image_url}
              alt={crew.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${categoryBg}`}>
              <span className="text-8xl">{emoji}</span>
            </div>
          )}
        </div>

        {/* 배지 */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-green/10 text-primary-green text-xs font-semibold">
            {emoji} {categoryLabel}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-text-secondary/10 text-text-secondary text-xs font-semibold">
            {crew.daily_settlement_type} · {SETTLEMENT_TYPE_LABEL[crew.daily_settlement_type]}
          </span>
        </div>

        {/* 탭 */}
        <CrewDetailTabs crew={crew} />
      </div>

      {/* 하단 고정 입장 버튼 */}
      <div className="fixed bottom-24 left-0 right-0 z-30 flex justify-center px-5">
        <div className="w-full max-w-[430px]">
          <CrewJoinButton
            depositAmount={crew.deposit_amount}
            myParticipation={crew.my_participation}
            onJoin={() => {}}
          />
        </div>
      </div>
    </>
  );
}
