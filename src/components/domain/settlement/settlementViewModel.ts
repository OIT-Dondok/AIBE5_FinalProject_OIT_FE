import type {
  CrewSettlementSummary,
  SettlementDetail,
  SettlementFailureCode,
  SettlementItem,
  SettlementMe,
  SettlementStatus,
} from '@/types/domain';

export type SettlementTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface SettlementStatusCopy {
  tone: SettlementTone;
  title: string;
  description: string;
}

export interface SettlementParticipantViewItem {
  id: number;
  participantLabel: string;
  statusLabel: string;
  successLabel: string;
  shareRatioRaw: string;
  shareRatioPercent: string;
  depositAmount: string;
  baseRefundAmount: string;
  remainderBonusAmount: string;
  refundAmount: string;
  hasRemainderBonus: boolean;
  pointHistoryLabel: string;
  includedDatesCount: number;
  excludedLogsCount: number;
}

export interface SettlementDetailViewModel {
  title: string;
  subtitle: string;
  status: SettlementStatus;
  isAllFail: boolean;
  totalRefundAmount: string;
  totalLockedAmount: string;
  totalRemainderAmount: string;
  totalRecognizedSuccess: string;
  totalParticipants: string;
  finishedAtLabel: string;
  remainderPolicyLabel: string;
  crewName?: string;
  missionPeriod?: string;
  myShareRatioPercent?: string;
  participants: SettlementParticipantViewItem[];
}

export const SETTLEMENT_STATUS_COPY: Record<SettlementStatus, SettlementStatusCopy> = {
  NONE: {
    tone: 'neutral',
    title: '아직 정산 전이에요',
    description: '크루가 종료되고 정산 배치가 시작되면 결과를 확인할 수 있어요.',
  },
  PENDING: {
    tone: 'neutral',
    title: '정산을 준비하고 있어요',
    description: '참여 내역과 예치금 정보를 모으는 중이에요.',
  },
  RUNNING: {
    tone: 'warning',
    title: '정산을 계산하고 있어요',
    description: '인정 성공 수와 환급액을 계산하는 중이에요. 잠시 후 다시 확인해 주세요.',
  },
  SUCCEEDED: {
    tone: 'success',
    title: '정산이 완료됐어요',
    description: '참여자별 최종 환급 내역을 확인할 수 있어요.',
  },
  FAILED: {
    tone: 'danger',
    title: '정산 처리에 실패했어요',
    description: '기록은 보존되어 있어요. 잠시 후 다시 시도하거나 안내를 확인해 주세요.',
  },
  RETRY_WAIT: {
    tone: 'warning',
    title: '정산 재시도를 기다리고 있어요',
    description: '일시적인 문제로 자동 재시도를 기다리는 상태예요.',
  },
};

const FAILURE_CODE_LABELS: Record<SettlementFailureCode, string> = {
  INPUT_LOAD_FAILED: '입력 데이터 로드 실패',
  CALCULATION_FAILED: '정산 계산 실패',
  POINT_CREDIT_FAILED: '포인트 환급 실패',
  DUPLICATE_SETTLEMENT: '중복 정산 감지',
  LOCK_ACQUIRE_FAILED: '정산 잠금 획득 실패',
  UNKNOWN: '알 수 없는 오류',
};

const PARTICIPANT_STATUS_LABELS: Record<string, string> = {
  PENDING: '승인 대기',
  LOCKED: '참여 확정',
  REJECTED: '거절',
  CANCELLED: '취소',
  EXPIRED: '만료',
};


export function shouldFetchSettlementDetail(summary: CrewSettlementSummary): boolean {
  return summary.status === 'SUCCEEDED' && summary.settlement_id !== null;
}

export function shouldFetchSettlementMe(summary: CrewSettlementSummary): boolean {
  return summary.status === 'SUCCEEDED' && summary.settlement_id !== null;
}

export function formatKrw(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

export function formatCount(value: number, unit = '회'): string {
  return `${value.toLocaleString('ko-KR')}${unit}`;
}

export function formatDateTime(value: string | null): string {
  if (!value) return '기록 없음';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatYmd(value: string | null): string {
  if (!value) return '-';
  // 'YYYY-MM-DD' → 'YYYY.MM.DD' (date-only는 new Date() 타임존 보정 회피 위해 문자열 치환)
  return value.replaceAll('-', '.');
}

export function formatMissionPeriod(startedAt: string | null, endedAt: string | null): string {
  return `${formatYmd(startedAt)} ~ ${formatYmd(endedAt)}`;
}

export function formatShareRatioPercent(shareRatio: string): string {
  const value = Number(shareRatio);
  if (!Number.isFinite(value)) return '-';

  return `${(value * 100).toFixed(2)}%`;
}

export function getFailureLabel(code: SettlementFailureCode | null): string {
  if (!code) return '오류 코드 없음';
  return FAILURE_CODE_LABELS[code] ?? code;
}

export function getSettlementStatusCopy(status: SettlementStatus): SettlementStatusCopy {
  return SETTLEMENT_STATUS_COPY[status];
}

export function isAllFailSettlement(detail: SettlementDetail): boolean {
  return (
    detail.total_recognized_success === 0 &&
    detail.total_remainder_amount === 0 &&
    detail.items.length > 0 &&
    detail.items.every(
      (item) =>
        item.share_ratio === '0.000000' &&
        item.base_refund_amount === item.deposit_amount &&
        item.remainder_bonus_amount === 0 &&
        item.refund_amount === item.deposit_amount,
    )
  );
}

export function getTotalRefundAmount(items: SettlementItem[]): number {
  return items.reduce((sum, item) => sum + item.refund_amount, 0);
}

export function toParticipantViewItem(item: SettlementItem): SettlementParticipantViewItem {
  const includedDates = Array.isArray(item.calculation_reason?.included_dates)
    ? item.calculation_reason.included_dates
    : [];
  const excludedLogs = Array.isArray(item.calculation_reason?.excluded_logs)
    ? item.calculation_reason.excluded_logs
    : [];

  return {
    id: item.settlement_item_id,
    participantLabel: `참여자 #${item.crew_participant_id}`,
    statusLabel: PARTICIPANT_STATUS_LABELS[item.participant_status_snapshot] ?? item.participant_status_snapshot,
    successLabel: `${item.recognized_success_count.toLocaleString('ko-KR')}회 인정`,
    shareRatioRaw: item.share_ratio,
    shareRatioPercent: formatShareRatioPercent(item.share_ratio),
    depositAmount: formatKrw(item.deposit_amount),
    baseRefundAmount: formatKrw(item.base_refund_amount),
    remainderBonusAmount: formatKrw(item.remainder_bonus_amount),
    refundAmount: formatKrw(item.refund_amount),
    hasRemainderBonus: item.remainder_bonus_amount > 0,
    pointHistoryLabel: item.point_history_id === null ? '지급 대기' : `원장 #${item.point_history_id}`,
    includedDatesCount: includedDates.length,
    excludedLogsCount: excludedLogs.length,
  };
}

export function toSettlementDetailViewModel(detail: SettlementDetail): SettlementDetailViewModel {
  const isAllFail = isAllFailSettlement(detail);
  const participants = detail.items.map(toParticipantViewItem);

  return {
    title: isAllFail ? '전원 원금 환급이 완료됐어요' : '정산이 완료됐어요',
    subtitle: isAllFail
      ? '인정된 성공 기록이 없어 지분 정산 없이 예치금 전액을 돌려드렸어요.'
      : '인정 성공 비율에 따라 최종 환급액이 확정됐어요.',
    status: detail.status,
    isAllFail,
    totalRefundAmount: formatKrw(getTotalRefundAmount(detail.items)),
    totalLockedAmount: formatKrw(detail.total_locked_amount),
    totalRemainderAmount: formatKrw(detail.total_remainder_amount),
    totalRecognizedSuccess: formatCount(detail.total_recognized_success),
    totalParticipants: formatCount(detail.total_participants, '명'),
    finishedAtLabel: formatDateTime(detail.finished_at),
    remainderPolicyLabel: detail.remainder_policy === 'HOST_REMAINDER' ? '방장 잔여금 배정' : detail.remainder_policy,
    participants,
  };
}

export function isAllFailMySettlement(item: SettlementItem): boolean {
  return (
    item.share_ratio === '0.000000' &&
    item.base_refund_amount === item.deposit_amount &&
    item.remainder_bonus_amount === 0 &&
    item.refund_amount === item.deposit_amount
  );
}

export function toSettlementMeViewModel(response: SettlementMe): SettlementDetailViewModel | null {
  if (!response.my_item) return null;

  const item = response.my_item;
  const isAllFail = isAllFailMySettlement(item);

  return {
    title: '미션이 종료되었어요',
    subtitle: isAllFail
      ? '인정된 성공 기록이 없어 예치금 전액이 환급됐어요.'
      : '최종 정산까지 완료됐어요. 내 결과를 확인해 보세요.',
    status: response.status,
    isAllFail,
    totalRefundAmount: formatKrw(item.refund_amount),
    totalLockedAmount: formatKrw(item.deposit_amount),
    totalRemainderAmount: formatKrw(item.remainder_bonus_amount),
    totalRecognizedSuccess: formatCount(item.recognized_success_count),
    totalParticipants: '내 정산 결과',
    finishedAtLabel: formatDateTime(response.finished_at),
    remainderPolicyLabel: item.remainder_bonus_amount > 0 ? '방장 잔여금 포함' : '개인 환급액',
    crewName: response.crew_name,
    missionPeriod: formatMissionPeriod(response.crew_started_at, response.crew_ended_at),
    myShareRatioPercent: formatShareRatioPercent(item.share_ratio),
    participants: [],
  };
}
