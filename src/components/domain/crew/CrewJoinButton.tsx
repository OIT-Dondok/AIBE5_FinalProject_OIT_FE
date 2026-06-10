'use client';

import { useState, useCallback } from 'react';
import { isAxiosError } from 'axios';
import { Button } from '@/components/common/Button';
import { Toast } from '@/components/common/Toast';
import { joinCrew, cancelJoinCrew } from '@/services/crew';
import type { MyParticipation } from '@/types/domain';
import type { ErrorResponse } from '@/types/common';

interface CrewJoinButtonProps {
  crewId: number;
  depositAmount: number;
  myParticipation: MyParticipation | null;
  onSuccess?: () => void;
}

export default function CrewJoinButton({ crewId, depositAmount, myParticipation, onSuccess }: CrewJoinButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastOpen, setIsToastOpen] = useState(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setIsToastOpen(true);
  }, []);

  const status = myParticipation?.status ?? null;

  const handleJoin = async () => {
    setIsLoading(true);
    try {
      await joinCrew(crewId);
      onSuccess?.();
    } catch (err) {
      if (isAxiosError<ErrorResponse>(err)) {
        const code = err.response?.data?.code;
        if (code === 'INSUFFICIENT_BALANCE') {
          showToast('포인트가 부족합니다.');
        } else if (code === 'CAPACITY_FULL') {
          showToast('정원이 가득 찼습니다.');
        } else if (code === 'CREW_NOT_RECRUITING') {
          showToast('모집이 마감되었습니다.');
        } else {
          showToast('입장 신청에 실패했습니다.');
        }
      } else {
        showToast('입장 신청에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await cancelJoinCrew(crewId);
      onSuccess?.();
    } catch (err) {
      if (isAxiosError<ErrorResponse>(err)) {
        const code = err.response?.data?.code;
        if (code === 'APPLICATION_NOT_CANCELLABLE') {
          showToast('신청 취소가 불가능한 상태입니다.');
        } else {
          showToast('신청 취소에 실패했습니다.');
        }
      } else {
        showToast('신청 취소에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderButton = () => {
    if (status === null) {
      return (
        <Button variant="primary-green" size="lg" fullWidth isLoading={isLoading} onClick={handleJoin}>
          🔒 입장 신청 · 보증금 {depositAmount.toLocaleString()}원
        </Button>
      );
    }
    if (status === 'PENDING') {
      return (
        <Button variant="outline" size="lg" fullWidth isLoading={isLoading} onClick={handleCancel}>
          신청 완료 · 승인 대기 중 (취소하기)
        </Button>
      );
    }
    if (status === 'LOCKED') {
      return (
        <Button variant="primary-green" size="lg" fullWidth disabled>
          ✓ 참여 중
        </Button>
      );
    }
    return (
      <Button variant="outline" size="lg" fullWidth disabled>
        입장 불가
      </Button>
    );
  };

  return (
    <>
      {renderButton()}
      <Toast
        message={toastMessage}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
      />
    </>
  );
}
