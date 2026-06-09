'use client';

import { Button } from '@/components/common/Button';
import type { MyParticipation } from '@/types/domain';

interface CrewJoinButtonProps {
  depositAmount: number;
  myParticipation: MyParticipation | null;
  onJoin: () => void;
  isLoading?: boolean;
}

export default function CrewJoinButton({
  depositAmount,
  myParticipation,
  onJoin,
  isLoading = false,
}: CrewJoinButtonProps) {
  const status = myParticipation?.status ?? null;

  if (status === null) {
    return (
      <Button variant="primary-green" size="lg" fullWidth onClick={onJoin} isLoading={isLoading}>
        🔒 입장 신청 · 보증금 {depositAmount.toLocaleString()}원
      </Button>
    );
  }

  if (status === 'PENDING') {
    return (
      <Button variant="outline" size="lg" fullWidth disabled>
        신청 완료 · 승인 대기 중
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
}
