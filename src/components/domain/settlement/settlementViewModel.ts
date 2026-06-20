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

  // 정수 퍼센트(예: 0%, 100%)는 소수점 생략, 그 외에는 소수점 2자리
  const percent = Math.round(value * 100 * 100) / 100;
  return Number.isInteger(percent) ? `${percent}%` : `${percent.toFixed(2)}%`;
}

// 크루 전체 성공률(decimal scale 4 string). 레거시 정산 행은 null → 표시용 '-'
export function formatSuccessRatePercent(value: string | null): string {
  if (value === null) return '-';
  return formatShareRatioPercent(value);
}

export function formatRankLabel(rank: number | null): string {
  return rank === null ? '-' : `${rank}위`;
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

// ─── 미션 결과 화면 (/settlements/[settlementId]) ───────────────────────────

export interface SettlementResultMyView {
  nickname: string;
  rankLabel: string;
  shareRatioPercent: string;
  refundAmount: string;
  recognizedSuccessLabel: string;
}

export interface SettlementResultCrewView {
  crewName: string;
  missionPeriod: string;
  missionDaysLabel: string;
  successRatePercent: string;
  totalRecognizedSuccessLabel: string;
  totalParticipantsLabel: string;
}

export interface SettlementResultRankRow {
  id: number;
  rank: number;
  rankLabel: string;
  nickname: string;
  shareRatioPercent: string;
  refundAmount: string;
  isMe: boolean;
}

// 크루 전체 성공률(상생/유대 지표) 기준 축하 티어. ALL_FAIL은 전원 원금 환급(0%) 특수 케이스
export type CrewCelebrationTier = 'PERFECT' | 'EXCELLENT' | 'GREAT' | 'NEUTRAL' | 'ALL_FAIL';

interface CrewCelebrationCopy {
  summaryHeading: string;
  closingMessage: string;
  showCelebration: boolean; // 크루 요약 통계에 축하 이모지 노출 여부
}

const CREW_CELEBRATION_COPY: Record<CrewCelebrationTier, CrewCelebrationCopy> = {
  PERFECT: {
    summaryHeading: '우리 크루가 함께 만든 결과',
    closingMessage: '한 명도 빠짐없이 완주했어요 — 완벽한 시즌이었어요 🎉',
    showCelebration: true,
  },
  EXCELLENT: {
    summaryHeading: '우리 크루가 함께 만든 결과',
    closingMessage: '끝까지 함께한 우리, 정말 멋진 크루예요 👏',
    showCelebration: true,
  },
  GREAT: {
    summaryHeading: '우리 크루가 함께 만든 결과',
    closingMessage: '함께라서 끝까지 올 수 있었어요 🙌',
    showCelebration: true,
  },
  NEUTRAL: {
    summaryHeading: '이번 시즌 크루 기록',
    closingMessage: '끝까지 달려온 당신, 수고했어요 👍',
    showCelebration: false,
  },
  ALL_FAIL: {
    summaryHeading: '이번 시즌 크루 기록',
    closingMessage: '예치금은 그대로 돌려드렸어요 — 다음엔 함께 완주해요 💪',
    showCelebration: false,
  },
};

// 80%가 축하 분기선. 레거시(성공률 null)는 측정 불가 → NEUTRAL 폴백
export function getCrewCelebrationTier(detail: SettlementDetail, isAllFail: boolean): CrewCelebrationTier {
  if (isAllFail) return 'ALL_FAIL';
  if (detail.crew_success_rate === null) return 'NEUTRAL';
  const rate = Number(detail.crew_success_rate);
  if (!Number.isFinite(rate)) return 'NEUTRAL';
  if (rate >= 1) return 'PERFECT';
  if (rate >= 0.9) return 'EXCELLENT';
  if (rate >= 0.8) return 'GREAT';
  return 'NEUTRAL';
}

export interface SettlementResultViewModel {
  settlementId: number;
  crewId: number;
  isAllFail: boolean;
  crewTier: CrewCelebrationTier;
  showCelebration: boolean;
  crewSummaryHeading: string;
  heroHeadline: string;
  heroRefundAmount: string | null;
  heroCrewName: string | null; // 긴 이름 대응을 위해 별도 줄로 노출
  heroSubMeta: string; // "기간 · 일수" 보조 줄
  closingMessage: string;
  my: SettlementResultMyView | null;
  crew: SettlementResultCrewView;
  rankRows: SettlementResultRankRow[];
}

// items[]는 settlement_item_id ASC 안정 정렬 → rank 기준 표시 정렬(동률 시 원본 순서 유지, JS sort는 stable)
export function sortItemsByRank(items: SettlementItem[]): SettlementItem[] {
  return [...items].sort((a, b) => a.rank - b.rank);
}

export function toSettlementResultRankRow(item: SettlementItem): SettlementResultRankRow {
  return {
    id: item.settlement_item_id,
    rank: item.rank,
    rankLabel: formatRankLabel(item.rank),
    nickname: item.nickname,
    shareRatioPercent: formatShareRatioPercent(item.share_ratio),
    refundAmount: formatKrw(item.refund_amount),
    isMe: item.is_me,
  };
}

// 히어로 보조 줄 "2026.05.01 ~ 2026.05.30 · 30일" (크루명은 별도 줄, 레거시 null 필드는 생략)
export function buildCrewSubMeta(detail: SettlementDetail): string {
  const parts: string[] = [];
  if (detail.crew_started_at || detail.crew_ended_at) {
    parts.push(formatMissionPeriod(detail.crew_started_at, detail.crew_ended_at));
  }
  if (detail.mission_days !== null) parts.push(`${detail.mission_days}일`);
  return parts.join(' · ');
}

function buildHeroHeadline(isAllFail: boolean, myRank: number | null): string {
  if (isAllFail) return '원금을 모두 돌려받았어요';
  if (myRank !== null) return `${myRank}위로 완주했어요!`;
  return '미션이 마무리됐어요';
}

export function toSettlementResultViewModel(detail: SettlementDetail): SettlementResultViewModel {
  const isAllFail = isAllFailSettlement(detail);
  const myItem = detail.items.find((item) => item.is_me) ?? null;
  const myRank = detail.my_rank ?? myItem?.rank ?? null;

  const my: SettlementResultMyView | null = myItem
    ? {
        nickname: myItem.nickname,
        rankLabel: formatRankLabel(myRank),
        shareRatioPercent: formatShareRatioPercent(myItem.share_ratio),
        refundAmount: formatKrw(myItem.refund_amount),
        recognizedSuccessLabel: formatCount(myItem.recognized_success_count),
      }
    : null;

  const tier = getCrewCelebrationTier(detail, isAllFail);
  const celebration = CREW_CELEBRATION_COPY[tier];

  return {
    settlementId: detail.settlement_id,
    crewId: detail.crew_id,
    isAllFail,
    crewTier: tier,
    showCelebration: celebration.showCelebration,
    crewSummaryHeading: celebration.summaryHeading,
    heroHeadline: buildHeroHeadline(isAllFail, myRank),
    heroRefundAmount: my ? my.refundAmount : null,
    heroCrewName: detail.crew_name,
    heroSubMeta: buildCrewSubMeta(detail),
    closingMessage: celebration.closingMessage,
    my,
    crew: {
      crewName: detail.crew_name ?? '크루 정보 없음',
      missionPeriod: formatMissionPeriod(detail.crew_started_at, detail.crew_ended_at),
      missionDaysLabel: detail.mission_days !== null ? `${detail.mission_days}일` : '-',
      successRatePercent: formatSuccessRatePercent(detail.crew_success_rate),
      totalRecognizedSuccessLabel: formatCount(detail.total_recognized_success),
      totalParticipantsLabel: formatCount(detail.total_participants, '명'),
    },
    rankRows: sortItemsByRank(detail.items).map(toSettlementResultRankRow),
  };
}

// ─── 결과 카드 화면 (/settlements/[settlementId]/card) ──────────────────────

export type RefundDeltaSign = 'up' | 'down' | 'flat';

export interface SettlementResultCardViewModel {
  brand: string;
  periodLabel: string; // 미션 기간 'YYYY.MM.DD ~ YYYY.MM.DD' (스냅샷 없으면 '')
  crewName: string;
  rankLabel: string; // "1위"
  totalParticipantsLabel: string; // "5명"
  refundAmount: string;
  depositComparePrefix: string; // "보증금 100,000원 대비"
  refundDeltaLabel: string; // "+3,080원" / "-1,000원" / "±0원"
  refundDeltaSign: RefundDeltaSign;
  successRateLabel: string | null; // "100%" (미션일수 없으면 null)
  successCountLabel: string; // "30 / 30일" (미션일수 없으면 "30회")
  fileName: string;
  isAllFail: boolean;
}

// 파일명 안전화: 공백→_, 경로/특수문자 제거
function sanitizeForFileName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[\\/:*?"<>|]/g, '');
}

// 스냅샷 종료일 우선, 없으면 정산 완료일. ISO 'YYYY-MM-DD' (파일명 폴백용)
function toRawDate(detail: SettlementDetail): string {
  if (detail.crew_ended_at) return detail.crew_ended_at;
  if (detail.finished_at) return detail.finished_at.slice(0, 10);
  return '';
}

// Date → 로컬 'YYYY-MM-DD' (파일명에 오늘 날짜를 주입할 때 사용)
export function toLocalYmd(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function buildRefundDeltaLabel(delta: number): { label: string; sign: RefundDeltaSign } {
  if (delta > 0) return { label: `+${formatKrw(delta)}`, sign: 'up' };
  if (delta < 0) return { label: formatKrw(delta), sign: 'down' }; // formatKrw가 음수 부호 포함
  return { label: '±0원', sign: 'flat' };
}

// fileNameDate: 파일명에 쓸 날짜(ISO 'YYYY-MM-DD'). 보통 다운로드 시점의 오늘 날짜를 주입.
// 생략 시 정산 스냅샷 종료일/완료일로 폴백한다.
export function toSettlementResultCardViewModel(
  detail: SettlementDetail,
  fileNameDate?: string,
): SettlementResultCardViewModel | null {
  const myItem = detail.items.find((item) => item.is_me);
  if (!myItem) return null;

  const myRank = detail.my_rank ?? myItem.rank;
  const delta = myItem.refund_amount - myItem.deposit_amount;
  const { label: refundDeltaLabel, sign: refundDeltaSign } = buildRefundDeltaLabel(delta);
  const fileDate = fileNameDate ?? toRawDate(detail);
  const crewName = detail.crew_name ?? '우리 크루';
  const hasMissionDays = detail.mission_days !== null && detail.mission_days > 0;
  const successRateLabel = hasMissionDays
    ? formatShareRatioPercent(String(myItem.recognized_success_count / (detail.mission_days as number)))
    : null;
  const successCountLabel = hasMissionDays
    ? `${myItem.recognized_success_count} / ${detail.mission_days}일`
    : formatCount(myItem.recognized_success_count);

  return {
    brand: 'dondok',
    periodLabel:
      detail.crew_started_at || detail.crew_ended_at
        ? formatMissionPeriod(detail.crew_started_at, detail.crew_ended_at)
        : '',
    crewName,
    rankLabel: formatRankLabel(myRank),
    totalParticipantsLabel: formatCount(detail.total_participants, '명'),
    refundAmount: formatKrw(myItem.refund_amount),
    depositComparePrefix: `보증금 ${formatKrw(myItem.deposit_amount)} 대비`,
    refundDeltaLabel,
    refundDeltaSign,
    successRateLabel,
    successCountLabel,
    fileName: `dondok_result_${sanitizeForFileName(crewName)}${fileDate ? `_${fileDate}` : ''}.png`,
    isAllFail: isAllFailSettlement(detail),
  };
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
