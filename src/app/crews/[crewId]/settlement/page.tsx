'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
        title: '정산 조회 권한 없음',
        description: '현재 정산 대상이 아니거나 접근이 제한된 정산입니다.',
      };
    }
    if (code === 'CREW_NOT_FOUND') {
      return {
        title: '크루를 찾을 수 없음',
        description: '요청한 크루가 존재하지 않습니다.',
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
    title: '정산 정보를 확인할 수 없습니다',
    description: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
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
  const latestRequestIdRef = useRef(0);

  const fetchSettlement = useCallback(async () => {
    const requestId = ++latestRequestIdRef.current;

    if (!Number.isFinite(crewId) || crewId <= 0) {
      if (requestId !== latestRequestIdRef.current) {
        return;
      }
      setError({
        title: '정산 페이지 접근 오류',
        description: 'crewId가 1 이상의 숫자가 아닙니다.',
      });
      setIsLoading(false);
      return;
    }

    if (requestId !== latestRequestIdRef.current) {
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const summaryResponse = await getCrewSettlementSummary(crewId);
      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      const nextSummary = summaryResponse.data;
      if (requestId !== latestRequestIdRef.current) {
        return;
      }
      setSummary(nextSummary);

      if (shouldFetchSettlementMe(nextSummary) && nextSummary.settlement_id !== null) {
        const mySettlementResponse = await getSettlementMe(nextSummary.settlement_id);
        if (requestId !== latestRequestIdRef.current) {
          return;
        }
        setMySettlement(mySettlementResponse.data);
      } else if (requestId === latestRequestIdRef.current) {
        setMySettlement(null);
      }
    } catch (err) {
      if (requestId === latestRequestIdRef.current) {
        setSummary(null);
        setMySettlement(null);
        setError(getSettlementError(err));
      }
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
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
              ⚠
            </p>
            <h1 className="mt-4 text-lg font-bold text-text-primary">{error.title}</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{error.description}</p>
            <div className="mt-6 flex gap-2">
              <Button type="button" variant="outline" fullWidth onClick={() => router.back()}>
                <ArrowLeft size={16} />
                뒤로가기
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

  if (!summary || summary.status === 'NONE') {
    return (
      <>
        <Header showBackButton title="정산" />
        <main className="w-full max-w-[430px] mx-auto px-5 py-8">
          <section className="rounded-card bg-card p-6 text-center shadow-card">
            <p className="text-4xl" aria-hidden>
              ⚠
            </p>
            <h1 className="mt-4 text-lg font-bold text-text-primary">정산 정보를 불러오지 못했어요</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              정산 내역이 비어 있거나 일시적으로 확인되지 않습니다.
            </p>
            <div className="mt-6 flex gap-2">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => router.push(`/crews/${crewId}`)}
              >
                크루로 돌아가기
              </Button>
              <Button
                type="button"
                variant="primary-green"
                fullWidth
                onClick={() => void fetchSettlement()}
              >
                다시 시도
              </Button>
            </div>
          </section>
        </main>
      </>
    );
  }

  if (summary.status === 'FAILED' || summary.status === 'RETRY_WAIT') {
    return (
      <>
        <Header showBackButton title="정산 실패" />
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
              onViewResult={() => {
                if (summary.settlement_id !== null) {
                  router.push(`/settlements/${summary.settlement_id}`);
                }
              }}
              onGoToCrewFeed={() => router.push(`/crews/${crewId}`)}
            />
          ) : (
            <>
              <SettlementStatusPanel summary={summary} onRetry={() => void fetchSettlement()} />
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => router.push(`/crews/${crewId}`)}
              >
                크루로 돌아가기
              </Button>
            </>
          )}
        </div>
      </main>
    </>
  );
}
