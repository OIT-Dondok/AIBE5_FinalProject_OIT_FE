'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { Trash2 } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { Toast } from '@/components/common/Toast';
import { HostMoreMenu } from '@/components/domain/host/common/HostMoreMenu';
import CrewDetailTabs from '@/components/domain/crew/CrewDetailTabs';
import CrewJoinButton from '@/components/domain/crew/CrewJoinButton';
import { getCrew, disbandCrew } from '@/services/crew';
import { useAuthStore } from '@/store/authStore';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import type { CrewDetail } from '@/types/domain';
import type { ErrorResponse } from '@/types/common';
import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  CATEGORY_GRADIENT,
  SETTLEMENT_TYPE_LABEL,
} from '@/constants/crew';

export default function CrewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const crewId = Number(params.crewId);

  const [crew, setCrew] = useState<CrewDetail | null>(null);
  const [confirmedCount, setConfirmedCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { user } = useAuthStore();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isDisbandModalOpen, setIsDisbandModalOpen] = useState(false);
  const [isDisbanding, setIsDisbanding] = useState(false);
  const [isDisbandErrorToastOpen, setIsDisbandErrorToastOpen] = useState(false);
  const [disbandErrorMessage, setDisbandErrorMessage] = useState(
    '크루 해체에 실패했어요. 다시 시도해 주세요.'
  );

  const handleDisband = async () => {
    if (!Number.isFinite(crewId) || crewId <= 0 || isDisbanding) return;
    setIsDisbanding(true);
    try {
      await disbandCrew(crewId);
      router.push('/crews');
    } catch (error) {
      setIsDisbanding(false);
      setDisbandErrorMessage(
        getApiErrorMessage(
          error,
          {
            FORBIDDEN_NOT_HOST: '방장만 크루를 해체할 수 있어요.',
            CREW_NOT_FOUND: '크루를 찾을 수 없어요.',
            CREW_NOT_RECRUITING: '모집 중인 크루만 해체할 수 있어요.',
          },
          '크루 해체에 실패했어요. 다시 시도해 주세요.'
        )
      );
      setIsDisbandErrorToastOpen(true);
    }
  };

  const fetchCrew = useCallback(async () => {
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
  }, [crewId]);

  useEffect(() => {
    if (Number.isFinite(crewId) && crewId > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchCrew();
    } else {
      setNotFound(true);
      setIsLoading(false);
    }
  }, [crewId, fetchCrew]);

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
          <div className="w-full h-72 bg-text-secondary/10 animate-pulse" />
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
  const categoryGradient = CATEGORY_GRADIENT[crew.category] ?? 'from-gray-300 to-gray-200';
  const isMinAchieved = crew.current_participants >= crew.min_participants;

  return (
    <>
      <Header
        showBackButton
        title={crew.title}
        rightElement={
          crew.host_member_uuid === user?.member_uuid ? (
            <HostMoreMenu
              isOpen={isMoreMenuOpen}
              onToggle={() => setIsMoreMenuOpen((prev) => !prev)}
              items={[
                {
                  label: '크루 해체',
                  icon: <Trash2 size={15} strokeWidth={2.2} />,
                  tone: 'danger',
                  disabled: crew.status !== 'RECRUITING',
                  onClick: () => {
                    setIsMoreMenuOpen(false);
                    setIsDisbandModalOpen(true);
                  },
                },
              ]}
            />
          ) : null
        }
      />

      <div className="w-full max-w-[430px] mx-auto pb-32">
        {/* Hero image / category gradient */}
        <div className="relative w-full h-72 overflow-hidden">
          {crew.image_url ? (
            <img src={crew.image_url} alt={crew.title} className="w-full h-full object-cover" />
          ) : (
            <>
              <div className={`w-full h-full bg-gradient-to-br ${categoryGradient}`} />
              <span className="absolute inset-0 flex items-center justify-center text-[160px] opacity-[0.15] select-none leading-none pointer-events-none">
                {emoji}
              </span>
            </>
          )}

          {/* Bottom gradient overlay for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          {/* Category badge + title overlay */}
          <div className="absolute bottom-0 left-0 px-5 pb-5 flex flex-col gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold w-fit">
              {categoryDisplay}
            </span>
            <h1 className="text-xl font-bold text-white leading-tight drop-shadow-sm">
              {crew.title}
            </h1>
          </div>

          {/* Settlement type badge — top right */}
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-semibold">
              {crew.daily_settlement_type} · {SETTLEMENT_TYPE_LABEL[crew.daily_settlement_type]}
            </span>
          </div>

          {/* Minimum participants achieved badge — top left */}
          {isMinAchieved && (
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-primary-green text-white text-xs font-extrabold shadow-md transform hover:scale-105 transition-transform duration-200">
                최소 인원 달성! 🎉
              </span>
            </div>
          )}
        </div>

        <CrewDetailTabs crew={crew} crewId={crewId} onConfirmedCountLoaded={setConfirmedCount} />
      </div>

      <div className="fixed bottom-24 left-0 right-0 z-30 flex justify-center px-5">
        <div className="w-full max-w-[430px]">
          <CrewJoinButton
            crewId={crewId}
            depositAmount={crew.deposit_amount}
            crewStatus={crew.status}
            myParticipation={crew.my_participation}
            onSuccess={() => void fetchCrew()}
          />
        </div>
      </div>
      <Toast
        isOpen={isDisbandErrorToastOpen}
        onClose={() => setIsDisbandErrorToastOpen(false)}
        message={disbandErrorMessage}
        type="error"
      />

      <ConfirmModal
        isOpen={isDisbandModalOpen}
        onClose={() => setIsDisbandModalOpen(false)}
        onConfirm={handleDisband}
        title="크루를 해체할까요?"
        description={'해체한 크루는 복구할 수 없어요.\n모든 멤버의 참여가 종료됩니다.'}
        confirmText="해체하기"
        cancelText="취소"
        isLoading={isDisbanding}
        confirmVariant="danger"
        iconType="warning"
      />
    </>
  );
}
