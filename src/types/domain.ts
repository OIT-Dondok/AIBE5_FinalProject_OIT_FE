// src/types/domain.ts
import type { CursorPageResponse } from './common';
// 전체 도메인 타입 정의
// [기준] API-spec-dondok.md
// - 응답 필드: snake_case (명세와 동일)
// - 식별자: member_uuid (외부 노출용), member.id는 내부 FK 전용
// - 시간: ISO-8601 with offset (예: "2026-05-07T00:05:00+09:00")
// - 금액: integer (원 단위)

// ════════════════════════════════════════════════════════════
// § 3. Enum
// ════════════════════════════════════════════════════════════

// § 3.0 MemberStatus
export const MEMBER_STATUS = {
  ACTIVE: 'ACTIVE',
  DEACTIVATED: 'DEACTIVATED',
} as const;
export type MemberStatus = (typeof MEMBER_STATUS)[keyof typeof MEMBER_STATUS];

// § 3.1 CrewStatus
export const CREW_STATUS = {
  RECRUITING: 'RECRUITING',
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
} as const;
export type CrewStatus = (typeof CREW_STATUS)[keyof typeof CREW_STATUS];

// § 3.1a CrewCategory
export const CREW_CATEGORY = {
  MORNING: 'MORNING',
  READING: 'READING',
  EXERCISE: 'EXERCISE',
  STUDY: 'STUDY',
  DIET: 'DIET',
  ETC: 'ETC',
} as const;
export type CrewCategory = (typeof CREW_CATEGORY)[keyof typeof CREW_CATEGORY];

// § 3.2 ParticipantStatus
export const PARTICIPANT_STATUS = {
  PENDING: 'PENDING',       // 신청 대기, 보증금 reserve 상태
  LOCKED: 'LOCKED',         // 방장 승인 완료, 보증금 확정
  REJECTED: 'REJECTED',     // 방장 거절 (terminal)
  CANCELLED: 'CANCELLED',   // 사용자 신청 취소. terminal 아님 → 재신청(reopen) 가능
  EXPIRED: 'EXPIRED',       // 미검토 자동 만료 (terminal)
} as const;
export type ParticipantStatus = (typeof PARTICIPANT_STATUS)[keyof typeof PARTICIPANT_STATUS];

// § 3.3 FrequencyType
export const FREQUENCY_TYPE = {
  DAILY: 'DAILY',
  SPECIFIC_DAYS: 'SPECIFIC_DAYS',
  // WEEKLY_N: Phase 2 / deferred
} as const;
export type FrequencyType = (typeof FREQUENCY_TYPE)[keyof typeof FREQUENCY_TYPE];

// § 3.4 SettlementType
export const SETTLEMENT_TYPE = {
  NORMAL: 'NORMAL',
  CANCELLED_BEFORE_START: 'CANCELLED_BEFORE_START',
} as const;
export type SettlementType = (typeof SETTLEMENT_TYPE)[keyof typeof SETTLEMENT_TYPE];

// § 3.5 SettlementStatus
export const SETTLEMENT_STATUS = {
  NONE: 'NONE',           // API projection only (DB에 저장 안 됨)
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  RETRY_WAIT: 'RETRY_WAIT',
} as const;
export type SettlementStatus = (typeof SETTLEMENT_STATUS)[keyof typeof SETTLEMENT_STATUS];

// § 3.6 PointTransactionType
export const POINT_TRANSACTION_TYPE = {
  POINT_CHARGE: 'POINT_CHARGE',
  CREW_DEPOSIT_RESERVE: 'CREW_DEPOSIT_RESERVE',   // 보증금 예약 (reserve)
  CREW_DEPOSIT_LOCK: 'CREW_DEPOSIT_LOCK',         // 보증금 예약 확정 (lock)
  CREW_RESERVE_RELEASE: 'CREW_RESERVE_RELEASE',   // 예약 해제 (취소/거절/만료)
  CREW_SETTLEMENT_REFUND: 'CREW_SETTLEMENT_REFUND', // 최종 정산 환급
  POINT_WITHDRAWAL: 'POINT_WITHDRAWAL', // 출금 요청(현재 UI/목데이터)
} as const;
export type PointTransactionType = (typeof POINT_TRANSACTION_TYPE)[keyof typeof POINT_TRANSACTION_TYPE];

// § 3.7 MissionLogFailureReason
export const MISSION_LOG_FAILURE_REASON = {
  EXIF_MISSING: 'EXIF_MISSING',           // risk signal only, 자동 실패 아님
  EXIF_TIME_INVALID: 'EXIF_TIME_INVALID', // risk signal only, 자동 실패 아님
  BEFORE_START: 'BEFORE_START',
  AFTER_END: 'AFTER_END',
  // AFTER_WITHDRAWN: brownfield/deferred
} as const;
export type MissionLogFailureReason = (typeof MISSION_LOG_FAILURE_REASON)[keyof typeof MISSION_LOG_FAILURE_REASON];

// § 3.8 DailySettlementType
export const DAILY_SETTLEMENT_TYPE = {
  A: 'A', // 인증마감 09:00 KST / 정산 12:00 KST
  B: 'B', // 인증마감 21:00 KST / 정산 00:00 KST (익일)
  C: 'C', // 인증마감 23:59 KST / 정산 익일 12:00 KST
} as const;
export type DailySettlementType = (typeof DAILY_SETTLEMENT_TYPE)[keyof typeof DAILY_SETTLEMENT_TYPE];

// § 3.9 MissionLogDecisionType
export const MISSION_LOG_DECISION_TYPE = {
  MANUAL_APPROVE: 'MANUAL_APPROVE',
  MANUAL_REJECT: 'MANUAL_REJECT',
  AUTO_APPROVE: 'AUTO_APPROVE',
  AUTO_REJECT: 'AUTO_REJECT',
} as const;
export type MissionLogDecisionType = (typeof MISSION_LOG_DECISION_TYPE)[keyof typeof MISSION_LOG_DECISION_TYPE];

// § 3.10 MissionLogRejectReasonCode
export const REJECT_REASON_CODE = {
  TIME_VIOLATION: 'TIME_VIOLATION',
  DUPLICATE: 'DUPLICATE',
  MISSION_MISMATCH: 'MISSION_MISMATCH',
  UNCLEAR: 'UNCLEAR',
  INAPPROPRIATE: 'INAPPROPRIATE',
  OTHER: 'OTHER',
} as const;
export type RejectReasonCode = (typeof REJECT_REASON_CODE)[keyof typeof REJECT_REASON_CODE];

// § 3.11 SettlementFailureCode
export const SETTLEMENT_FAILURE_CODE = {
  INPUT_LOAD_FAILED: 'INPUT_LOAD_FAILED',
  CALCULATION_FAILED: 'CALCULATION_FAILED',
  POINT_CREDIT_FAILED: 'POINT_CREDIT_FAILED',
  DUPLICATE_SETTLEMENT: 'DUPLICATE_SETTLEMENT',
  LOCK_ACQUIRE_FAILED: 'LOCK_ACQUIRE_FAILED',
  UNKNOWN: 'UNKNOWN',
} as const;
export type SettlementFailureCode = (typeof SETTLEMENT_FAILURE_CODE)[keyof typeof SETTLEMENT_FAILURE_CODE];

// § 3.14 ProjectionStatus (API 응답 전용, DB 저장 안 됨)
export const PROJECTION_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  LIVE: 'LIVE',
  CLOSED_ESTIMATE: 'CLOSED_ESTIMATE',
  NOT_PROVIDED: 'NOT_PROVIDED',
  SETTLEMENT_SUCCEEDED: 'SETTLEMENT_SUCCEEDED',
} as const;
export type ProjectionStatus = (typeof PROJECTION_STATUS)[keyof typeof PROJECTION_STATUS];

// § 3.15 ProjectionNotice (API 응답 전용, DB 저장 안 됨)
export const PROJECTION_NOTICE = {
  ESTIMATED_NOT_FINAL: 'ESTIMATED_NOT_FINAL',
  NOT_STARTED: 'NOT_STARTED',
  NOT_PROVIDED: 'NOT_PROVIDED',
  SETTLEMENT_RESULT_AVAILABLE: 'SETTLEMENT_RESULT_AVAILABLE',
  INSUFFICIENT_PROJECTION_INPUT: 'INSUFFICIENT_PROJECTION_INPUT',
} as const;
export type ProjectionNotice = (typeof PROJECTION_NOTICE)[keyof typeof PROJECTION_NOTICE];

// § 3.16 PointHistoryReferenceType
export const POINT_HISTORY_REFERENCE_TYPE = {
  POINT_CHARGE: 'POINT_CHARGE',
  CREW_PARTICIPANT: 'CREW_PARTICIPANT',
  SETTLEMENT_ITEM: 'SETTLEMENT_ITEM',
} as const;
export type PointHistoryReferenceType = (typeof POINT_HISTORY_REFERENCE_TYPE)[keyof typeof POINT_HISTORY_REFERENCE_TYPE];

export interface PointHistoryReferenceMeta {
  crew_id?: number;
  crew_title?: string;
  crew_participant_id?: number;
  settlement_id?: number;
  settlement_item_id?: number;
}

// CertificationStatus (mission_log.certification_status)
// PENDING_REVIEW: 업로드 직후 검수 대기
// SUCCESS: 인증 성공 (최종 정산 인정 보장 아님)
// FAILED: 인증 실패
export const CERTIFICATION_STATUS = {
  PENDING_REVIEW: 'PENDING_REVIEW',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const;
export type CertificationStatus = (typeof CERTIFICATION_STATUS)[keyof typeof CERTIFICATION_STATUS];


// ════════════════════════════════════════════════════════════
// § 5.1 인증 / 회원
// ════════════════════════════════════════════════════════════

// POST /api/auth/signup → 201
export interface SignupResponse {
  member_uuid: string;
  email: string;
  nickname: string;
  status: MemberStatus;
  created_at: string;
}

// POST /api/auth/login → 200
// [명세] refresh_token은 Set-Cookie HttpOnly로만 전달, response body에 없음
export interface LoginResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number; // 초 단위 (현재 1800 = 30분)
  member: {
    member_uuid: string;
    email: string;
    nickname: string;
  };
}

// POST /api/auth/refresh → 200
// [명세] body 없음 요청, 쿠키 자동 전송. 응답도 access_token만 반환
export interface RefreshResponse {
  access_token: string;
  // refresh token rotate 시 Set-Cookie로만 전달 (JS 접근 불가)
}

// GET /api/me → 200
export interface MemberProfileResponse {
  member_uuid: string;
  email: string;
  nickname: string;
  profile_image_url: string | null;
  status_message: string | null;
  is_host_ever: boolean;
  hosted_crew_count: number;
  status: MemberStatus;
  created_at: string;
}

// auth 전용 최소 타입 — authStore(zustand persist) 저장 기준
// 전체 프로필 필요 시 MemberProfileResponse 사용
export interface Member {
  member_uuid: string;
  nickname: string;
}

// PATCH /api/me/profile → 200
export interface ProfileUpdateResponse {
  member_uuid: string;
  email: string;
  nickname: string;
  profile_image_url: string | null;
  status_message: string | null;
  updated_at: string;
}

// PATCH /api/me/profile Request
export interface UpdateProfileRequest {
  nickname?: string;
  profile_image_s3_key?: string | null;
  status_message?: string | null;
}

// GET /api/me/activity-summary → 200
export interface ActivitySummaryCrewInfo {
  total_crew_count: number;
  active_crew_count: number;
  completed_crew_count: number;
}

export interface ActivitySummaryInfo {
  crew: ActivitySummaryCrewInfo;
  total_verification_count: number;
  unread_notification_count: number;
}

export interface ActivitySummaryStats {
  total_recognized_success_count: number;
  // 최고 지분율: Settlement.status=SUCCEEDED 항목 중 최대 share_ratio(문자열, scale 6 decimal 또는 null)
  highest_share_ratio: string | null;
  highest_share_ratio_crew_id: number | null;
  highest_share_ratio_crew_title: string | null;
  // 평균 성공률: 정산 컨텍스트 기반 계산값(문자열, scale 6 decimal 또는 null)
  average_success_rate: string | null;
}

export interface MeActivitySummaryResponse {
  member_uuid: string;
  activity_info: ActivitySummaryInfo;
  activity_stats: ActivitySummaryStats;
  generated_at: string;
}

// GET /api/me/host-operation-summary → 200
export interface HostOperationSummaryResponse {
  member_uuid: string;
  total_pending_count: number;
  generated_at: string;
}


// ════════════════════════════════════════════════════════════
// § 5.2 크루 / 참여
// ════════════════════════════════════════════════════════════

// GET /api/crews → items[]
export interface CrewListItem {
  crew_id: number;
  title: string;
  image_url: string | null;
  category: string;
  status: CrewStatus;
  deposit_amount: number;
  min_participants: number;
  max_participants: number;
  frequency_type: FrequencyType;
  frequency_count: number | null;
  mission_schedule_days: string[];
  recruitment_deadline: string;
  start_at: string;
  activated_at: string | null;
  end_at: string;
}

// GET /api/crews → 200
export interface CrewListResponse {
  items: CrewListItem[];
  next_cursor: string | null;
}

// GET /api/crews/{crewId} → 200
export interface CrewDetail {
  crew_id: number;
  host_member_uuid: string;
  host_nickname: string;
  title: string;
  description: string;
  image_url: string | null;
  category: string;
  status: CrewStatus;
  settlement_status: SettlementStatus;
  deposit_amount: number;
  min_participants: number;
  max_participants: number;
  frequency_type: FrequencyType;
  frequency_count: number | null;
  mission_schedule_days: string[];
  daily_settlement_type: DailySettlementType;
  current_participants: number;
  host_agreement_version: string;
  host_agreed_at: string;
  recruitment_deadline: string;
  start_at: string;
  activated_at: string | null;
  end_at: string;
  my_participation: MyParticipation | null;
}

export interface MyParticipation {
  crew_participant_id: number;
  status: ParticipantStatus;
  deposit_locked_amount: number;
  locked_at: string | null;
  withdrawn_at: string | null;
}

// POST /api/crews → 201
// [명세] 크루 생성 시 호스트 LOCKED participant 자동 생성됨
export interface CreateCrewResponse {
  crew_id: number;
  title: string;
  description: string;
  image_url: string | null;
  category: string;
  status: CrewStatus;
  deposit_amount: number;
  min_participants: number;
  max_participants: number;
  frequency_type: FrequencyType;
  frequency_count: number | null;
  mission_schedule_days: string[];
  daily_settlement_type: DailySettlementType;
  host_agreement_version: string;
  host_agreed_at: string;
  recruitment_deadline: string;
  start_at: string;
  activated_at: string | null;
  end_at: string;
  created_at: string;
  my_participation: MyParticipation; // 호스트 자동 LOCKED participant
}

// POST /api/crews Request
export interface CreateCrewRequest {
  title: string;
  description: string;
  image_s3_key?: string | null;
  category: string;
  deposit_amount: number;
  min_participants?: number;
  max_participants: number;
  frequency_type: FrequencyType;
  frequency_count?: number;
  mission_schedule_days?: string[];
  daily_settlement_type: DailySettlementType;
  host_agreement: Record<string, unknown>;
  recruitment_deadline: string;
  start_date: string;
  end_date: string;
}

// POST /api/crews/{crewId}/participants → 201
export interface ParticipantApplyResponse {
  crew_participant_id: number;
  crew_id: number;
  member_uuid: string;
  status: ParticipantStatus;
  deposit_reserved_amount: number;
  deposit_locked_amount: number;
  locked_at: string | null;
  pending_at: string;
}

// DELETE /api/crews/{crewId}/participants/me → 200
export interface ParticipantCancelResponse {
  crew_participant_id: number;
  crew_id: number;
  status: 'CANCELLED';
  cancelled_at: string;
}

// GET /api/crews/{crewId}/applications → 200 [김한비 담당]
export interface ApplicationListItem {
  crew_participant_id: number;
  member_uuid: string;
  nickname: string;
  profile_image_url: string | null;
  status: ParticipantStatus;
  applied_at: string;
  decided_at: string | null;
}

export type ApplicationListResponse = CursorPageResponse<ApplicationListItem>;

// POST /api/crews/{crewId}/applications/{crewParticipantId}/approve → 200 [김한비 담당]
export interface ApproveApplicationResponse {
  crew_participant_id: number;
  crew_id: number;
  status: 'LOCKED';
  deposit_locked_amount: number;
  locked_at: string;
}

// POST /api/crews/{crewId}/applications/{crewParticipantId}/reject → 200 [김한비 담당]
export interface RejectApplicationResponse {
  crew_participant_id: number;
  crew_id: number;
  status: 'REJECTED';
  rejected_at: string;
}

// GET /api/crews/{crewId}/members → 200
export interface CrewMember {
  crew_participant_id: number;
  member_uuid: string;
  nickname: string;
  profile_image_url: string | null;
  role: 'HOST' | 'MEMBER';
  status: ParticipantStatus;
  joined_at: string;
}

export type CrewMembersResponse = CursorPageResponse<CrewMember>;


// ════════════════════════════════════════════════════════════
// § 5.3 미션 인증
// ════════════════════════════════════════════════════════════

// POST /api/uploads/presigned-url Request
export interface PresignedUrlRequest {
  purpose: 'MISSION_IMAGE' | 'PROFILE_IMAGE' | 'CREW_IMAGE';
  crew_id?: number;
  crew_participant_id?: number;
  content_type: string;
  content_length: number;
}

// POST /api/uploads/presigned-url → 200
export interface PresignedUrlResponse {
  upload_url: string;
  s3_key: string;
  expires_at: string;
}

// POST /api/mission-logs Request
export interface CreateMissionLogRequest {
  crew_id: number;
  image_s3_key: string;
  caption: string; // 5~100자 필수
}

// POST /api/mission-logs → 201
// GET /api/crews/{crewId}/mission-logs/me items[]
export interface MissionLog {
  mission_log_id: number;
  crew_id: number;
  crew_participant_id: number;
  image_url: string | null;
  image_s3_key: string;
  caption: string | null;
  image_hash: string;
  server_time: string;
  exif_taken_at?: string | null;
  certification_status: CertificationStatus;
  failure_reason: MissionLogFailureReason | null;
  decision_type: MissionLogDecisionType | null;
  reject_reason_code: RejectReasonCode | null;
}

// GET /api/crews/{crewId}/mission-logs/me → 200
export interface MissionLogListResponse {
  items: MissionLog[];
}

// GET /api/crews/{crewId}/moderation-logs → 200 [서일현 담당]
export interface ModerationHistoryItem {
  moderation_history_id: number;
  mission_log_id: number;
  before_state: { decision_type: MissionLogDecisionType | null };
  after_state: { decision_type: MissionLogDecisionType };
  decision_type: MissionLogDecisionType;
  reject_reason_code: RejectReasonCode | null;
  moderator_member_uuid: string;
  changed_at: string;
}

export type ModerationHistoryResponse = CursorPageResponse<ModerationHistoryItem>;

// POST /api/mission-logs/{missionLogId}/moderation/approve → 200 [서일현 담당]
export interface ModerationApproveResponse {
  mission_log_id: number;
  crew_id: number;
  crew_participant_id: number;
  certification_status: 'SUCCESS';
  decision_type: 'MANUAL_APPROVE';
  reject_reason_code: null;
  decided_at: string;
  moderation_history_id: number;
}

// POST /api/mission-logs/{missionLogId}/moderation/reject Request [서일현 담당]
export interface ModerationRejectRequest {
  reject_reason_code: RejectReasonCode;
  reject_memo?: string; // OTHER일 때 필수, 최대 50자, internal/private
}

// POST /api/mission-logs/{missionLogId}/moderation/reject → 200 [서일현 담당]
export interface ModerationRejectResponse {
  mission_log_id: number;
  crew_id: number;
  crew_participant_id: number;
  certification_status: 'FAILED';
  decision_type: 'MANUAL_REJECT';
  reject_reason_code: RejectReasonCode;
  decided_at: string;
  moderation_history_id: number;
}

// GET /api/me/verification-history items[] [문창현 담당]
export interface VerificationHistoryItem {
  verification_history_item_id: string;
  perspective: 'participant' | 'host';
  crew_id: number;
  crew_title: string;
  mission_log_id: number;
  occurred_at: string;
  verification_status: CertificationStatus;
  reject_reason_code: RejectReasonCode | null;
  signal_summary: {
    exif: string;
    reviewer: string;
  };
  links: {
    feed: string;
    settlement: string | null;
  };
}

export type VerificationHistoryResponse = CursorPageResponse<VerificationHistoryItem>;


// ════════════════════════════════════════════════════════════
// § 5.4 인증 피드 / 리액션
// ════════════════════════════════════════════════════════════

// reaction_counts: emoji grapheme → count 동적 map
// 예: { "👏": 2, "🔥": 1 }
export type ReactionCounts = Record<string, number>;

// GET /api/crews/{crewId}/feed feed_items[]
export interface FeedItem {
  mission_log_id: number;
  crew_participant_id: number;
  member_uuid: string;
  nickname: string;
  profile_image_url: string | null;
  image_url: string | null;
  caption: string | null;
  server_time: string;
  created_at: string;
  certification_status: CertificationStatus;
  reject_reason_code: RejectReasonCode | null;
  reaction_counts: ReactionCounts; // SUCCESS만 리액션 허용. FAILED/PENDING_REVIEW는 빈 map {}
  my_reactions: string[]; // 내가 누른 emoji token 목록. FAILED/PENDING_REVIEW는 빈 list []
}

// GET /api/crews/{crewId}/feed day_statuses[]
export interface DayStatus {
  date: string; // YYYY-MM-DD
  status: CertificationStatus | 'NOT_SUBMITTED';
  representative_mission_log_id: number | null;
}

// GET /api/crews/{crewId}/feed participant_day_slots[]
export interface ParticipantDaySlot {
  crew_participant_id: number;
  member_uuid: string;
  date: string;
  status: CertificationStatus | 'NOT_SUBMITTED';
  representative_mission_log_id: number | null;
}

// GET /api/crews/{crewId}/feed → 200
export interface FeedResponse {
  crew_id: number;
  feed_items: FeedItem[];
  next_cursor: string | null;
  day_statuses: DayStatus[];
  participant_day_slots: ParticipantDaySlot[];
}

// POST /api/mission-logs/{missionLogId}/reactions Request
export interface AddReactionRequest {
  reaction_type: string; // FE-selected emoji grapheme/token string
}

// POST /api/mission-logs/{missionLogId}/reactions → 200
// DELETE /api/mission-logs/{missionLogId}/reactions/me → 200
export interface ReactionResponse {
  mission_log_id: number;
  my_reactions: string[];
  reaction_counts: ReactionCounts;
}


// ════════════════════════════════════════════════════════════
// § 5.5 크루 대시보드
// ════════════════════════════════════════════════════════════

// GET /api/crews/{crewId}/dashboard → 200
export interface DashboardResponse {
  crew_id: number;
  crew_participant_id: number;
  settlement_id: number | null;
  crew_status: CrewStatus;
  settlement_status: SettlementStatus;
  projection_status: ProjectionStatus;
  projection_notice: ProjectionNotice;
  my_deposit_amount: number;
  my_success_count: number;
  my_recognized_success_count_estimated: number | null;
  total_recognized_success_count_estimated: number | null;
  my_share_ratio_estimated: string | null; // 소수 정밀도 오해 방지용 string decimal
  my_expected_refund_amount: number | null;
  my_expected_refund_delta_amount: number | null;
  rank_estimated: number | null;
  updated_at: string;
}


// ════════════════════════════════════════════════════════════
// § 5.6 정산
// ════════════════════════════════════════════════════════════

// GET /api/crews/{crewId}/settlement → 200
export interface CrewSettlementSummary {
  crew_id: number;
  settlement_id: number | null;
  settlement_type: SettlementType | null;
  status: SettlementStatus;
  retry_count: number;
  failure_code: SettlementFailureCode | null;
  failure_message: string | null;
  started_at: string | null;
  finished_at: string | null;
}

// GET /api/settlements/{settlementId} → 200
export interface SettlementDetail {
  settlement_id: number;
  crew_id: number;
  settlement_type: SettlementType;
  status: SettlementStatus;
  retry_count: number;
  total_participants: number;
  total_locked_amount: number;
  total_recognized_success: number;
  total_base_refund_amount: number;
  total_remainder_amount: number;
  remainder_policy: 'HOST_REMAINDER'; // floor 연산 후 잔액 전액을 방장에게 추가 지급
  remainder_winner_crew_participant_id: number | null;
  failure_code: SettlementFailureCode | null;
  failure_message: string | null;
  started_at: string;
  finished_at: string | null;
  items: SettlementItem[];
}

export interface SettlementItem {
  settlement_item_id: number;
  crew_participant_id: number;
  participant_status_snapshot: ParticipantStatus;
  deposit_amount: number;
  success_count_raw: number;
  recognized_success_count: number;
  recognized_dates_count: number;
  excluded_success_count: number;
  // withdrawn_at_snapshot 제거됨 (API 문서 확정)
  share_ratio: string; // string decimal
  base_refund_amount: number;
  remainder_bonus_amount: number; // HOST_REMAINDER 정책에서 방장에게만 지급, 나머지는 0
  refund_amount: number; // base_refund_amount + remainder_bonus_amount (최종 환급 source of truth)
  // reward_amount, final_amount 제거됨 (API 문서 확정)
  point_history_id: number | null;
  calculation_reason: {
    included_dates: string[];   // snake_case로 변경
    excluded_logs: Array<{
      server_time: string;      // snake_case로 변경
      code: string;
    }>;
  };
}


// ════════════════════════════════════════════════════════════
// § 5.7 AI
// ════════════════════════════════════════════════════════════

// POST /api/ai/mission-recommendations Request
export interface AiRecommendationRequest {
  seed_text: string;
  title?: string;
  description?: string;
  frequency_type?: FrequencyType;
  frequency_count?: number;
  mission_schedule_days?: string[];
  deposit_amount?: number;
  duration_days?: number;
}

// POST /api/ai/mission-recommendations → 200
export interface AiRecommendationResponse {
  draft: {
    title: string;
    description: string;
    frequency_type: FrequencyType;
    frequency_count: number;
    mission_schedule_days: string[];
    daily_settlement_type: DailySettlementType;
    deposit_amount: number;
    duration_days: number;
  };
  validation_warnings: Array<{
    field: string;
    message: string;
  }>;
}


// ─── 알림 event_type 확정 목록 ──────────────────────────────────────────────
export const NOTIFICATION_EVENT_TYPE = {
  MISSION_LOG_VERIFICATION_RESULT: 'MISSION_LOG_VERIFICATION_RESULT', // 인증 검수 결과
  CREW_APPLICATION_APPROVED: 'CREW_APPLICATION_APPROVED',             // 참여 신청 승인
  CREW_APPLICATION_REJECTED: 'CREW_APPLICATION_REJECTED',             // 참여 신청 거절
  CREW_ACTIVATED: 'CREW_ACTIVATED',                                   // 크루 활성화(미션 시작)
  SETTLEMENT_COMPLETED: 'SETTLEMENT_COMPLETED',                       // 정산 완료
} as const;
export type NotificationEventType = (typeof NOTIFICATION_EVENT_TYPE)[keyof typeof NOTIFICATION_EVENT_TYPE];

// ════════════════════════════════════════════════════════════
// § 5.8 포인트
// ════════════════════════════════════════════════════════════

// POST /api/points/charges Request
export interface PointChargeRequest {
  payment_id: string; // TossPayments paymentKey
  order_id: string;   // TossPayments orderId
  amount: number;
}

// POST /api/points/charges → 201
export interface PointChargeResponse {
  point_history_id: number;
  member_uuid: string;
  amount: number;
  balance_after: number;
  transaction_type: 'POINT_CHARGE';
  created_at: string;
}

// GET /api/points → 200
export interface PointAccountResponse {
  available_balance: number;
  reserved_balance: number;        // PENDING reserve
  active_locked_amount: number;    // LOCKED, 진행/모집 중
  settlement_pending_amount: number; // unpaid settlement refunds in normal processing/retry states
  settlement_failed_amount: number; // unpaid settlement refunds requiring failure recovery
  locked_balance: number;          // persisted locked principal bucket
  total_balance: number;           // available + reserved + locked
  updated_at: string;
}

// GET /api/points/history items[]
export interface PointHistoryItem {
  point_history_id: number;
  amount: number;
  balance_after: number;
  transaction_type: PointTransactionType;
  reference_type: PointHistoryReferenceType;
  reference_id: number;
  reference_meta?: PointHistoryReferenceMeta | null;
  created_at: string;
}

// GET /api/points/history → 200
export type PointHistoryResponse = CursorPageResponse<PointHistoryItem>;

export type WalletDisplayType =
  | 'DODIN_CHARGE'
  | 'DODIN_DEPOSIT'
  | 'DODIN_DEPOSIT_REFUND'
  | 'SETTLEMENT_REFUND';

export type WalletEventStatus = 'COMPLETED' | 'PENDING' | 'CONFIRMED' | 'RELEASED';

// GET /api/points/wallet-history items[]
export interface WalletHistoryItem {
  wallet_event_id: string;
  amount: number;
  balance_after: number;
  display_type: WalletDisplayType | (string & {});
  status: WalletEventStatus;
  reference_type: PointHistoryReferenceType;
  reference_id: number;
  reference_meta?: Record<string, unknown> | null;
  created_at: string;
}

// GET /api/points/wallet-history → 200
export type WalletHistoryResponse = CursorPageResponse<WalletHistoryItem>;
