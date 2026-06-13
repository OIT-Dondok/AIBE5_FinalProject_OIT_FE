'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/common/Button';
import { 
  SettlementBatchErrorView,
  SettlementResultCard,
  SettlementSkeleton,
  SettlementStatusPanel,
} from '@/components/domain/settlement';
import {
  shouldFetchSettlementMe,
  toSettlementMeViewModel,
} from '@/components/domain/settlement/settlementViewModel';
import { getCrewSettlementSummary, getSettlementMe } from '@/services/settlement';
import type { ErrorResponse } from '@/types/common';
import type { CrewSettlementSummary, SettlementMe } from '@/types/domain';

interface SettlementPageError {
  title: string;
  description: string;
}

function getSettlementError(err: unknown): SettlementPageError {
  if (isAxiosError<ErrorResponse>(err)) {
    const code = err.response?.data?.code;
    if (code === 'CREW_ACCESS_DENIED') {
      return {
        title: '정산을 볼 수 없어요',
        description: '방장이거나 예치금이 확정된 참여자만 정산 결과를 확인할 수 있어요.',
      };
    }
    if (code === 'CREW_NOT_FOUND') {
      return {
        title: '크루를 찾을 수 없어요',
        description: '삭제됐거나 접근할 수 없는 크루예요.',
      };
    }
    if (code === 'INVALID_INPUT') {
      return {
        title: '잘못된 정산 요청이에요',
        description: '주소의 크루 또는 정산 식별자를 다시 확인해 주세요.',
      };
    }
  }

  return {
    title: '정산 정보를 불러오지 못했어요',
    description: '네트워크 상태를 확인한 뒤 다시 시도해 주세요.',
  };
}

export default function CrewSettlementPage() {
  const params = useParams();
  const router = useRouter();
  const crewId = Number(params.crewId);

  const [summary, setSummary] = useState<CrewSettlementSummary | null>(null);
  const [mySettlement, setMySettlement] = useState<SettlementMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<SettlementPageError | null>(null);

  const fetchSettlement = useCallback(async () => {
    if (!Number.isFinite(crewId) || crewId <= 0) {
      setError({
        title: '잘못된 크루 주소예요',
        description: '크루 식별자는 1 이상의 숫자여야 해요.',
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const summaryResponse = await getCrewSettlementSummary(crewId);
      const nextSummary = summaryResponse.data;
      setSummary(nextSummary);

      if (shouldFetchSettlementMe(nextSummary) && nextSummary.settlement_id !== null) {
        const mySettlementResponse = await getSettlementMe(nextSummary.settlement_id);
        setMySettlement(mySettlementResponse.data);
      } else {
        setMySettlement(null);
      }
    } catch (err) {
      setSummary(null);
      setMySettlement(null);
      setError(getSettlementError(err));
    } finally {
      setIsLoading(false);
    }
  }, [crewId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchSettlement();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchSettlement]);

  const detailViewModel = useMemo(
    () => (mySettlement ? toSettlementMeViewModel(mySettlement) : null),
    [mySettlement],
  );

  if (isLoading) {
    return (
      <>
        <Header showBackButton title="정산" />
        <SettlementSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header showBackButton title="정산" />
        <main className="w-full max-w-[430px] mx-auto px-5 py-8">
          <section className="rounded-card bg-card p-6 text-center shadow-card">
            <p className="text-4xl" aria-hidden>
              ⚠️
            </p>
            <h1 className="mt-4 text-lg font-bold text-text-primary">{error.title}</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{error.description}</p>
            <div className="mt-6 flex gap-2">
              <Button type="button" variant="outline" fullWidth onClick={() => router.back()}>
                <ArrowLeft size={16} />
                돌아가기
              </Button>
              <Button type="button" variant="primary-green" fullWidth onClick={() => void fetchSettlement()}>
                <RefreshCw size={16} />
                다시 시도
              </Button>
            </div>
          </section>
        </main>
      </>
    );
  }

  if (!summary) return null;

  if (summary.status === 'FAILED' || summary.status === 'RETRY_WAIT') {
    return (
      <>
        <Header showBackButton title="처리 오류" />
        <SettlementBatchErrorView
          summary={summary}
          onRetry={() => void fetchSettlement()}
          onDismiss={() => router.push(`/crews/${crewId}`)}
        />
      </>
    );
  }

  return (
    <>
      <Header showBackButton title="정산" />
      <main className="w-full max-w-[430px] mx-auto px-5 py-6 pb-24">
        <div className="flex flex-col gap-4">
          {detailViewModel ? (
            <SettlementResultCard
              viewModel={detailViewModel}
              onPrimaryAction={() => router.push(`/crews/${crewId}`)}
            />
          ) : (
            <>
              <SettlementStatusPanel summary={summary} onRetry={() => void fetchSettlement()} />
              <Button type="button" variant="outline" fullWidth onClick={() => router.push(`/crews/${crewId}`)}>
                크루로 돌아가기
              </Button>
            </>
          )}
        </div>
      </main>
    </>
  );
}
