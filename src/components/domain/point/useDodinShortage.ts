'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPointAccount } from '@/services/point';

interface DodinShortageState {
  requiredAmount: number;
  currentBalance: number;
}

// 도딘 부족 모달(DodinShortageModal) 제어 공용 훅.
// 크루 생성 / 크루 참여 등 INSUFFICIENT_BALANCE 상황에서 재사용한다.
export function useDodinShortage() {
  const router = useRouter();
  const [state, setState] = useState<DodinShortageState | null>(null);

  // 필요 금액으로 모달을 연다. 잔액 조회 성공 시 true, 실패 시 false 반환(호출부가 토스트 등으로 폴백).
  const open = useCallback(async (requiredAmount: number): Promise<boolean> => {
    try {
      const { data } = await getPointAccount();
      setState({ requiredAmount, currentBalance: data.available_balance });
      return true;
    } catch {
      return false;
    }
  }, []);

  // 잔액을 사전 확인해 부족할 때만 모달을 연다.
  // 부족 → true(차단), 충분하거나 조회 실패 → false(진행 허용; 실패 시 후속 단계에서 폴백 처리).
  const checkAndOpen = useCallback(async (requiredAmount: number): Promise<boolean> => {
    try {
      const { data } = await getPointAccount();
      if (data.available_balance < requiredAmount) {
        setState({ requiredAmount, currentBalance: data.available_balance });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const close = useCallback(() => setState(null), []);

  const goToCharge = useCallback(() => {
    setState(null);
    router.push('/my/dodin');
  }, [router]);

  return {
    isOpen: state !== null,
    requiredAmount: state?.requiredAmount ?? 0,
    currentBalance: state?.currentBalance ?? 0,
    open,
    checkAndOpen,
    close,
    goToCharge,
  };
}
