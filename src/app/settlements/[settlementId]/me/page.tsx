'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSettlementMe } from '@/services/settlement';

export default function SettlementMeBridgePage() {
  const router = useRouter();
  const params = useParams();
  const settlementId = Number(params.settlementId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(settlementId)) {
      setError('잘못된 정산 ID입니다.');
      return;
    }

    let active = true;
    getSettlementMe(settlementId)
      .then((res) => {
        if (!active) return;
        const crewId = res.data.crew_id;
        if (crewId) {
          router.replace(`/crews/${crewId}/settlement`);
        } else {
          setError('해당 정산의 크루 정보를 찾을 수 없습니다.');
        }
      })
      .catch((err) => {
        if (!active) return;
        console.error('[SettlementMeBridge] Error fetching settlement:', err);
        setError('정산 정보를 불러오지 못했습니다.');
      });

    return () => {
      active = false;
    };
  }, [settlementId, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <p className="text-sm font-bold text-text-secondary">{error}</p>
        <button
          type="button"
          onClick={() => router.replace('/dashboard')}
          className="mt-4 rounded-xl bg-[#5E9B73] px-4 py-2 text-xs font-bold text-white shadow-sm"
        >
          대시보드로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        {/* 심플한 로딩 스피너 및 메시지 */}
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5E9B73] border-t-transparent" />
        <p className="text-xs font-bold text-text-secondary">정산 페이지로 이동 중...</p>
      </div>
    </div>
  );
}
