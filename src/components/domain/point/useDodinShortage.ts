'use client';

import { useCallback, useRef, useState } from 'react';
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
  // 훅 인스턴스(=화면) 생존 동안 잔액 캐시. 같은 플로우 내 반복 조회 방지용.
  const balanceRef = useRef<number | null>(null);

  // 사용가능 도딘 조회. useCache=true면 캐시 우선. 실패 시 null.
  const fetchBalance = useCallback(async (useCache: boolean): Promise<number | null> => {
    if (useCache && balanceRef.current !== null) return balanceRef.current;
    try {
      const { data } = await getPointAccount();
      balanceRef.current = data.available_balance;
      return data.available_balance;
    } catch {
      return null;
    }
  }, []);

  // 잔액이 부족할 때만 모달을 연다.
  // 부족 → true(모달 표시), 충분하거나 조회 실패 → false(호출부가 진행/토스트 등으로 폴백).
  const openIfInsufficient = useCallback(
    async (requiredAmount: number, options?: { useCache?: boolean }): Promise<boolean> => {
      const balance = await fetchBalance(options?.useCache ?? false);
      if (balance === null) return false; // 조회 실패 → 폴백
      if (balance >= requiredAmount) return false; // 부족하지 않음
      setState({ requiredAmount, currentBalance: balance });
      return true;
    },
    [fetchBalance],
  );

  const close = useCallback(() => setState(null), []);

  const goToCharge = useCallback(() => {
    setState(null);
    router.push('/my/dodin');
  }, [router]);

  return {
    isOpen: state !== null,
    requiredAmount: state?.requiredAmount ?? 0,
    currentBalance: state?.currentBalance ?? 0,
    openIfInsufficient,
    close,
    goToCharge,
  };
}
