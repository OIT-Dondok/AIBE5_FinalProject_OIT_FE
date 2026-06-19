'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { ArrowLeft, Download, RefreshCw, Share2 } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/common/Button';
import { Toast, type ToastType } from '@/components/common/Toast';
import { SettlementResultCard, SettlementSkeleton } from '@/components/domain/settlement';
import { toLocalYmd, toSettlementResultCardViewModel } from '@/components/domain/settlement/settlementViewModel';
import { getSettlementDetail } from '@/services/settlement';
import { captureNodeToPngBlob, downloadBlob, sharePngFile } from '@/lib/shareImage';
import type { ErrorResponse } from '@/types/common';
import type { SettlementDetail } from '@/types/domain';

interface ResultCardError {
  title: string;
  description: string;
}

function getResultCardError(err: unknown): ResultCardError {
  if (isAxiosError<ErrorResponse>(err)) {
    const code = err.response?.data?.code;
    if (code === 'CREW_ACCESS_DENIED') {
      return { title: '결과 조회 권한 없음', description: '이 정산 결과를 볼 수 있는 권한이 없어요.' };
    }
    if (code === 'INVALID_INPUT') {
      return { title: '요청 파라미터 오류', description: '요청 값이 올바르지 않습니다. 다시 시도해주세요.' };
    }
  }
  return { title: '결과를 불러오지 못했어요', description: '일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.' };
}

export default function SettlementResultCardPage() {
  const params = useParams();
  const router = useRouter();
  const settlementId = Number(params.settlementId);

  const [detail, setDetail] = useState<SettlementDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ResultCardError | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const latestRequestIdRef = useRef(0);
  // 파일명에 다운로드(=오늘) 날짜 사용. 페이지 진입 시점으로 고정
  const [todayYmd] = useState(() => toLocalYmd(new Date()));

  const fetchDetail = useCallback(async () => {
    const requestId = ++latestRequestIdRef.current;

    if (!Number.isFinite(settlementId) || settlementId <= 0) {
      setError({ title: '잘못된 접근이에요', description: 'settlementId가 1 이상의 숫자가 아니에요.' });
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
      setError(getResultCardError(err));
    } finally {
      if (requestId === latestRequestIdRef.current) setIsLoading(false);
    }
  }, [settlementId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchDetail();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchDetail]);

  const cardViewModel = useMemo(
    () => (detail ? toSettlementResultCardViewModel(detail, todayYmd) : null),
    [detail, todayYmd],
  );

  const handleSave = useCallback(async () => {
    if (!cardRef.current || !cardViewModel || isExporting) return;
    setIsExporting(true);
    try {
      const blob = await captureNodeToPngBlob(cardRef.current);
      downloadBlob(blob, cardViewModel.fileName);
      setToast({ message: '결과 카드를 저장했어요.', type: 'success' });
    } catch {
      setToast({ message: '이미지 저장에 실패했어요. 다시 시도해주세요.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  }, [cardViewModel, isExporting]);

  const handleShare = useCallback(async () => {
    if (!cardRef.current || !cardViewModel || isExporting) return;
    setIsExporting(true);
    try {
      const blob = await captureNodeToPngBlob(cardRef.current);
      const result = await sharePngFile(blob, cardViewModel.fileName, {
        title: '돈독 미션 결과',
        text: `${cardViewModel.crewName} 미션 완료!`,
      });
      if (result === 'downloaded') {
        setToast({ message: '공유를 지원하지 않아 이미지로 저장했어요.', type: 'success' });
      }
    } catch {
      setToast({ message: '이미지 공유에 실패했어요. 다시 시도해주세요.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  }, [cardViewModel, isExporting]);

  if (isLoading) {
    return (
      <>
        <Header showBackButton title="결과 카드" />
        <SettlementSkeleton />
      </>
    );
  }

  if (error || !cardViewModel) {
    const resolved = error ?? {
      title: '공유할 결과가 없어요',
      description: '이 정산에 내 참여 기록이 없어 결과 카드를 만들 수 없어요.',
    };

    return (
      <>
        <Header showBackButton title="결과 카드" />
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
              {error && (
                <Button type="button" variant="primary-green" fullWidth onClick={() => void fetchDetail()}>
                  <RefreshCw size={16} />
                  다시 시도
                </Button>
              )}
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Header showBackButton title="결과 카드" />
      <main className="w-full max-w-[430px] mx-auto px-5 py-6 pb-16">
        <p className="px-1 text-xs font-semibold text-text-secondary">공유 카드 미리보기 · 1:1</p>

        <div className="mt-3 overflow-hidden rounded-[24px] shadow-[0_8px_28px_rgba(34,30,20,0.1)]">
          <SettlementResultCard ref={cardRef} viewModel={cardViewModel} />
        </div>

        <p className="mt-3 truncate px-1 text-xs text-text-secondary" title={cardViewModel.fileName}>
          {cardViewModel.fileName}
        </p>

        <div className="mt-6 flex gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            className="gap-1.5"
            isLoading={isExporting}
            onClick={() => void handleShare()}
          >
            <Share2 size={16} />
            공유
          </Button>
          <Button
            type="button"
            variant="primary-green"
            size="lg"
            fullWidth
            className="gap-1.5"
            isLoading={isExporting}
            onClick={() => void handleSave()}
          >
            <Download size={16} />
            저장하기
          </Button>
        </div>
      </main>

      <Toast
        message={toast?.message ?? ''}
        type={toast?.type ?? 'success'}
        isOpen={toast !== null}
        onClose={() => setToast(null)}
      />
    </>
  );
}
