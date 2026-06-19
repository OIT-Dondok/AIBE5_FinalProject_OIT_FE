'use client';

import { useState, useCallback } from 'react';
import { Toast } from '@/components/common/Toast';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { DodinShortageModal } from '@/components/domain/point/DodinShortageModal';
import { useDodinShortage } from '@/components/domain/point/useDodinShortage';
import type { MyParticipation } from '@/types/domain';
import { useCrewJoinFlow } from './useCrewJoinFlow';

interface CrewJoinButtonProps {
  crewId: number;
  depositAmount: number;
  myParticipation: MyParticipation | null;
  onSuccess?: () => void;
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default function CrewJoinButton({ crewId, depositAmount, myParticipation, onSuccess }: CrewJoinButtonProps) {
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [isToastOpen, setIsToastOpen] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setIsToastOpen(true);
  }, []);

  const shortage = useDodinShortage();

  const {
    step,
    isLoading,
    handleJoin,
    handleCancel,
    openJoinConfirm,
    openCancelConfirm,
    close,
  } = useCrewJoinFlow({
    crewId,
    onSuccess,
    showToast,
    onInsufficientBalance: () => shortage.openIfInsufficient(depositAmount),
  });

  const status = myParticipation?.status ?? null;

  const renderButton = () => {
    /* ── 신청 전 / 취소 후 재신청 (CANCELLED는 terminal 아님 → reopen 허용) ── */
    if (status === null || status === 'CANCELLED') {
      return (
        <button
          type="button"
          onClick={openJoinConfirm}
          disabled={isLoading}
          className="relative w-full py-4 px-6 rounded-2xl bg-pastel-yellow overflow-hidden shadow-lg shadow-pastel-yellow/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none select-none"
        >
          <div className="absolute inset-[6px] rounded-xl border border-dashed border-black/15 pointer-events-none" />

          <div className="relative flex items-center justify-center gap-2 text-text-primary font-bold text-base">
            {isLoading ? <><Spinner /><span>처리 중...</span></> : <span>🔒 입장 신청 · 보증금 {depositAmount.toLocaleString()}원</span>}
          </div>
        </button>
      );
    }

    /* ── 신청 완료 (PENDING) ──────────────────────── */
    if (status === 'PENDING') {
      return (
        <div className="flex flex-col gap-2">
          {/* 상태 표시 */}
          <div className="relative w-full py-3.5 px-6 rounded-2xl bg-success-green overflow-hidden">
            <div className="absolute inset-[5px] rounded-xl border border-dashed border-primary-green/30 pointer-events-none" />

            <div className="relative flex items-center justify-center gap-2">
              <span className="text-primary-green font-bold text-sm">✓ 신청 완료</span>
              <span className="text-primary-green/40 text-xs">·</span>
              <span className="text-primary-green/70 text-xs font-medium">승인 대기 중</span>
            </div>
          </div>
          {/* 취소 버튼 */}
          <button
            type="button"
            onClick={openCancelConfirm}
            disabled={isLoading}
            className="relative w-full py-3 px-6 rounded-2xl bg-card overflow-hidden border border-text-secondary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none select-none"
          >
            <div className="absolute inset-[5px] rounded-xl border border-dashed border-text-secondary/15 pointer-events-none" />

            <div className="relative flex items-center justify-center gap-2 text-text-secondary font-semibold text-sm">
              {isLoading ? <><Spinner /><span>처리 중...</span></> : <span>신청 취소하기</span>}
            </div>
          </button>
        </div>
      );
    }

    /* ── 참여 중 (LOCKED) ────────────────────────── */
    if (status === 'LOCKED') {
      return (
        <div className="relative w-full py-4 px-6 rounded-2xl bg-primary-green overflow-hidden shadow-lg shadow-primary-green/30 opacity-90 select-none">
          <div className="absolute inset-[6px] rounded-xl border border-dashed border-white/40 pointer-events-none" />

          <p className="relative text-center text-base font-bold text-white">✓ 참여 중</p>
        </div>
      );
    }

    /* ── 입장 불가 ────────────────────────────────── */
    return (
      <div className="relative w-full py-4 px-6 rounded-2xl bg-text-secondary/10 overflow-hidden select-none">
        <div className="absolute inset-[6px] rounded-xl border border-dashed border-text-secondary/20 pointer-events-none" />

        <p className="relative text-center text-base font-bold text-text-secondary/50">입장 불가</p>
      </div>
    );
  };

  return (
    <>
      {renderButton()}

      {/* 신청 완료 모달 */}
      {step === 'SUCCESS_MODAL' && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          onClick={close}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-[320px] bg-primary-green rounded-3xl px-6 py-8 shadow-2xl shadow-primary-green/40 overflow-hidden animate-feed-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-[8px] rounded-2xl border-2 border-dashed border-white/30 pointer-events-none" />

            <div className="relative flex flex-col items-center gap-4 text-center">
              <span className="text-4xl leading-none">🙌</span>
              <div className="flex flex-col gap-1.5">
                <p className="text-lg font-bold text-white">신청이 완료됐어요!</p>
                <p className="text-sm text-white/75 leading-snug">방장 승인 전까지 취소할 수 있어요</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="mt-1 w-full py-2.5 rounded-xl bg-white/20 text-sm font-semibold text-white hover:bg-white/30 active:scale-[0.98] transition-all"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 신청 취소 컨펌 모달 */}
      <ConfirmModal
        isOpen={step === 'CANCEL_CONFIRM'}
        onClose={close}
        onConfirm={handleCancel}
        title="정말 신청을 취소하시겠어요?"
        description={
          <span>
            예약된 보증금은 즉시 해제되며, <strong className="text-primary-green font-bold">취소 후 다시 신청</strong>할 수 있어요.
          </span>
        }
        confirmText="네, 취소할게요"
        cancelText="아니오"
        confirmVariant="danger"
        iconType="warning"
        isLoading={isLoading}
      />

      {/* 입장 신청 컨펌 모달 */}
      <ConfirmModal
        isOpen={step === 'JOIN_CONFIRM'}
        onClose={close}
        onConfirm={handleJoin}
        title="크루에 입장 신청을 하시겠어요?"
        description={
          <span>
            방장 승인 시 보증금 <strong className="text-primary-green font-bold">{depositAmount.toLocaleString()}원</strong>이 예약 잠금 처리됩니다.
          </span>
        }
        confirmText="네, 신청할게요"
        cancelText="아니오"
        confirmVariant="primary-green"
        iconType="none"
        isLoading={isLoading}
      />

      <Toast
        message={toastMessage}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
        type={toastType}
      />

      <DodinShortageModal
        isOpen={shortage.isOpen}
        onClose={shortage.close}
        onCharge={shortage.goToCharge}
        requiredAmount={shortage.requiredAmount}
        currentBalance={shortage.currentBalance}
      />
    </>
  );
}
