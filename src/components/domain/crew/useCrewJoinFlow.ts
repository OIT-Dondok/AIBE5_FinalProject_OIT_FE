'use client';

import { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import { joinCrew, cancelJoinCrew } from '@/services/crew';
import type { ErrorResponse } from '@/types/common';

export type JoinStep = 'IDLE' | 'JOIN_CONFIRM' | 'CANCEL_CONFIRM' | 'SUCCESS_MODAL';

interface UseCrewJoinFlowProps {
  crewId: number;
  onSuccess?: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning') => void;
  // 잔액 부족 시 도딘 부족 모달 노출 시도. 모달을 띄웠으면 true, 아니면 false(토스트로 폴백)
  onInsufficientBalance?: () => Promise<boolean>;
}

export function useCrewJoinFlow({ crewId, onSuccess, showToast, onInsufficientBalance }: UseCrewJoinFlowProps) {
  const [step, setStep] = useState<JoinStep>('IDLE');
  const [isLoading, setIsLoading] = useState(false);

  // SUCCESS_MODAL 상태일 때 4초 뒤 자동으로 IDLE로 환원
  useEffect(() => {
    if (step !== 'SUCCESS_MODAL') return;
    const t = setTimeout(() => setStep('IDLE'), 4000);
    return () => clearTimeout(t);
  }, [step]);

  const handleJoin = async () => {
    setIsLoading(true);
    try {
      await joinCrew(crewId);
      setStep('SUCCESS_MODAL');
      onSuccess?.();
    } catch (err) {
      setStep('IDLE');
      if (isAxiosError<ErrorResponse>(err)) {
        const code = err.response?.data?.code;
        if (code === 'INSUFFICIENT_BALANCE') {
          const handled = onInsufficientBalance ? await onInsufficientBalance() : false;
          if (!handled) {
            showToast('포인트가 부족합니다. 충전 후 다시 시도해주세요.', 'error');
          }
        } else if (code === 'CAPACITY_FULL') {
          showToast('정원이 가득 찼습니다.', 'error');
        } else if (code === 'CREW_NOT_RECRUITING') {
          showToast('모집이 마감되었습니다.', 'error');
        } else {
          showToast('입장 신청에 실패했습니다.', 'error');
        }
      } else {
        showToast('입장 신청에 실패했습니다.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await cancelJoinCrew(crewId);
      showToast('신청이 취소되었습니다.', 'success');
      setStep('IDLE');
      onSuccess?.();
    } catch (err) {
      setStep('IDLE');
      if (isAxiosError<ErrorResponse>(err)) {
        const code = err.response?.data?.code;
        if (code === 'APPLICATION_NOT_CANCELLABLE') {
          showToast('신청 취소가 불가능한 상태입니다.', 'error');
        } else {
          showToast('신청 취소에 실패했습니다.', 'error');
        }
      } else {
        showToast('신청 취소에 실패했습니다.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openJoinConfirm = () => setStep('JOIN_CONFIRM');
  const openCancelConfirm = () => setStep('CANCEL_CONFIRM');
  const close = () => setStep('IDLE');

  return {
    step,
    setStep,
    isLoading,
    handleJoin,
    handleCancel,
    openJoinConfirm,
    openCancelConfirm,
    close,
  };
}
