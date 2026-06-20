'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/common/Button';
import { MissionResultView, SettlementSkeleton } from '@/components/domain/settlement';
import { toSettlementResultViewModel } from '@/components/domain/settlement/settlementViewModel';
import { getSettlementDetail } from '@/services/settlement';
import type { ErrorResponse } from '@/types/common';
import type { SettlementDetail } from '@/types/domain';

interface SettlementResultError {
  title: string;
  description: string;
}

function getSettlementResultError(err: unknown): SettlementResultError {
  if (isAxiosError<ErrorResponse>(err)) {
    const code = err.response?.data?.code;
    if (code === 'CREW_ACCESS_DENIED') {
      return {
        title: '결과 조회 권한 없음',
        description: '이 정산 결과를 볼 수 있는 권한이 없어요.',
      };
    }
    if (code === 'INVALID_INPUT') {
      return {
        title: '요청 파라미터 오류',
        description: '요청 값이 올바르지 않습니다. 다시 시도해주세요.',
      };
    }
  }

  return {
    title: '결과를 불러오지 못했어요',
    description: '일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.',
  };
}

export default function SettlementResultPage() {
  const params = useParams();
  const router = useRouter();
  const settlementId = Number(params.settlementId);

  const [detail, setDetail] = useState<SettlementDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<SettlementResultError | null>(null);
  const latestRequestIdRef = useRef(0);

  const fetchDetail = useCallback(async () => {
    const requestId = ++latestRequestIdRef.current;

    if (!Number.isFinite(settlementId) || settlementId <= 0) {
      setError({
        title: '잘못된 접근이에요',
        description: 'settlementId가 1 이상의 숫자가 아니에요.',
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getSettlementDetail(settlementId);
      if (requestId !== latestRequestIdRef.current) return;
      setDetail(response.data);
    } catch (err) {
      if (requestId !== latestRequestIdRef.current) return;
      setDetail(null);
      setError(getSettlementResultError(err));
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [settlementId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchDetail();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchDetail]);

  const viewModel = useMemo(
    () => (detail ? toSettlementResultViewModel(detail) : null),
    [detail],
  );

  if (isLoading) {
    return (
      <>
        <Header showBackButton title="미션 결과" />
        <SettlementSkeleton />
      </>
    );
  }

  if (error || !viewModel) {
    const resolved = error ?? {
      title: '결과를 불러오지 못했어요',
      description: '정산 결과가 비어 있어요.',
    };

    return (
      <>
        <Header showBackButton title="미션 결과" />
        <main className="w-full max-w-[430px] mx-auto px-5 py-8">
          <section className="rounded-card bg-card p-6 text-center shadow-card">
            <p className="text-4xl" aria-hidden>
              ⚠
            </p>
            <h1 className="mt-4 text-lg font-bold text-text-primary">{resolved.title}</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{resolved.description}</p>
            <div className="mt-6 flex gap-2">
              <Button type="button" variant="outline" fullWidth onClick={() => router.back()}>
                <ArrowLeft size={16} />
                뒤로가기
              </Button>
              <Button type="button" variant="primary-green" fullWidth onClick={() => void fetchDetail()}>
                <RefreshCw size={16} />
                다시 시도
              </Button>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Header showBackButton title="미션 결과" />
      <main className="w-full max-w-[430px] mx-auto px-5 py-6 pb-16">
        <MissionResultView
          viewModel={viewModel}
          onViewFeed={() => router.push(`/feed?crew=${viewModel.crewId}`)}
          onCreateCard={() => router.push(`/settlements/${viewModel.settlementId}/card`)}
        />
      </main>
    </>
  );
}