import type { CrewStatus, ParticipantStatus } from '@/types/domain';

export type CrewJoinButtonState =
  | { variant: 'JOIN' }
  | { variant: 'PENDING' }
  | { variant: 'PARTICIPATING' }
  | { variant: 'DISABLED'; label: string };

export function getCrewJoinButtonState(
  crewStatus: CrewStatus,
  participationStatus: ParticipantStatus | null
): CrewJoinButtonState {
  switch (crewStatus) {
    case 'CLOSED':
      return { variant: 'DISABLED', label: '완료된 크루' };
    case 'CANCELLED':
      return { variant: 'DISABLED', label: '해체된 크루' };
    case 'ACTIVE':
      if (participationStatus === 'LOCKED') return { variant: 'PARTICIPATING' };
      return { variant: 'DISABLED', label: '진행 중인 크루' };
    case 'RECRUITING':
      if (participationStatus === null || participationStatus === 'CANCELLED') return { variant: 'JOIN' };
      if (participationStatus === 'PENDING') return { variant: 'PENDING' };
      if (participationStatus === 'LOCKED') return { variant: 'PARTICIPATING' };
      return { variant: 'DISABLED', label: '입장 불가' };
    default: {
      const exhaustive: never = crewStatus;
      return exhaustive;
    }
  }
}
