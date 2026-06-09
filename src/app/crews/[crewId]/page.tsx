'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { MoreHorizontal } from 'lucide-react';
import { Header } from '@/components/common/Header';
import CrewDetailTabs from '@/components/domain/crew/CrewDetailTabs';
import CrewJoinButton from '@/components/domain/crew/CrewJoinButton';
import { getCrew } from '@/services/crew';
import type { CrewDetail } from '@/types/domain';
import type { ErrorResponse } from '@/types/common';
import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  CATEGORY_BG,
  SETTLEMENT_TYPE_LABEL,
} from '@/constants/crew';

export default function CrewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const crewId = Number(params.crewId);

  const [crew, setCrew] = useState<CrewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchCrew = async () => {
      setIsLoading(true);
      try {
        const res = await getCrew(crewId);
        setCrew(res.data);
      } catch (err) {
        if (isAxiosError<ErrorResponse>(err) && err.response?.data?.code === 'CREW_NOT_FOUND') {
          setNotFound(true);
        } else {
          setHasError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (crewId) fetchCrew();
  }, [crewId]);

  if (notFound || hasError) {
    return (
      <>
        <Header showBackButton />
        <div className="w-full max-w-[430px] mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5">
          <p className="text-5xl">🔍</p>
          <p className="text-base font-bold text-text-primary">
            {notFound ? '크루를 찾을 수 없습니다' : '크루 정보를 불러오지 못했습니다'}
          </p>
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
            <div className="mt-2 h-px w-full bg-text-secondary/10" />
            <div className="h-40 w-full bg-text-secondary/10 rounded-card animate-pulse" />
          </div>
        </div>
      </>
    );
  }

  if (!crew) return null;

  const emoji = CATEGORY_EMOJI[crew.category] ?? '📌';
  const categoryDisplay = CATEGORY_LABEL[crew.category] ?? crew.category;
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
        <div className="w-full h-52 overflow-hidden">
          {crew.image_url ? (
            <img src={crew.image_url} alt={crew.title} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${categoryBg}`}>
              <span className="text-8xl">{emoji}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-5 pt-4 pb-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-green/10 text-primary-green text-xs font-semibold">
            {categoryDisplay}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-text-secondary/10 text-text-secondary text-xs font-semibold">
            {crew.daily_settlement_type} · {SETTLEMENT_TYPE_LABEL[crew.daily_settlement_type]}
          </span>
        </div>

        <CrewDetailTabs crew={crew} />
      </div>

      <div className="fixed bottom-24 left-0 right-0 z-30 flex justify-center px-5">
        <div className="w-full max-w-[430px]">
          <CrewJoinButton
            depositAmount={crew.deposit_amount}
            myParticipation={crew.my_participation}
          />
        </div>
      </div>
    </>
  );
}
