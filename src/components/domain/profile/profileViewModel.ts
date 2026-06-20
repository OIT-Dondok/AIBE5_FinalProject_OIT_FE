import type {
  MeActivitySummaryResponse,
  MemberProfileResponse,
  ProfileUpdateResponse,
  UpdateProfileRequest,
} from "@/types/domain";

export type ProfileStatTone = "gold" | "green" | "blue" | "mint" | "neutral";

export type ProfileStat = {
  label: string;
  value: string;
  caption: string;
  tone: ProfileStatTone;
};

export type ProfileViewModel = {
  initials: string;
  avatarImageUrl: string | null;
  nickname: string;
  statusMessage: string | null;
  joinedAt: string;
  isHostEver: boolean;
  hostedCrewCount: number;
  unreadNotificationCount: number;
  hostOperationPendingCount: number;
  hostCrewId: number | null;
  stats: ProfileStat[];
};

export type ProfileFormState = {
  initials: string;
  avatarImageUrl: string | null;
  avatarImageS3Key?: string | null;
  nickname: string;
  statusMessage: string;
};

const EMPTY_VALUE = "-";

export function normalizeInitials(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed ? Array.from(trimmed).slice(0, 1).join("") : fallback;
}

export function formatDecimalRatioAsPercent(value: string | null): string {
  if (!value) return EMPTY_VALUE;

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return EMPTY_VALUE;

  return `${(numericValue * 100).toFixed(1)}%`;
}

export function buildProfileViewModel(
  profile: MemberProfileResponse,
  activitySummary: MeActivitySummaryResponse,
  hostOperationPendingCount = 0,
  hostCrewId: number | null = null,
): ProfileViewModel {
  const crew = activitySummary.activity_info.crew;
  const stats = activitySummary.activity_stats;

  return {
    initials: normalizeInitials(profile.nickname, "?"),
    avatarImageUrl: profile.profile_image_url,
    nickname: profile.nickname,
    statusMessage: profile.status_message,
    joinedAt: profile.created_at,
    isHostEver: profile.is_host_ever,
    hostedCrewCount: profile.hosted_crew_count,
    unreadNotificationCount: activitySummary.activity_info.unread_notification_count,
    hostOperationPendingCount,
    hostCrewId,
    stats: [
      {
        label: "참여 크루 수",
        value: `${crew.total_crew_count}개`,
        caption: `진행 ${crew.active_crew_count} · 종료 ${crew.completed_crew_count}`,
        tone: "gold",
      },
      {
        label: "총 성공 횟수",
        value: `${stats.total_recognized_success_count}회`,
        caption: "인정된 인증 기준",
        tone: "green",
      },
      {
        label: "최고 지분율",
        value: formatDecimalRatioAsPercent(stats.highest_share_ratio),
        caption: stats.highest_share_ratio_crew_title ?? "정산 완료 크루 없음",
        tone: "blue",
      },
      {
        label: "평균 성공률",
        value: formatDecimalRatioAsPercent(stats.average_success_rate),
        caption: "종료 크루 평균",
        tone: "mint",
      },
    ],
  };
}

export function applyProfileUpdateResponse(
  current: ProfileViewModel,
  response: ProfileUpdateResponse,
): ProfileViewModel {
  return {
    ...current,
    initials: normalizeInitials(response.nickname, current.initials),
    avatarImageUrl: response.profile_image_url,
    nickname: response.nickname,
    statusMessage: response.status_message,
  };
}

export function createProfileFormState(profile: ProfileViewModel | null): ProfileFormState {
  return {
    initials: profile?.initials ?? "",
    avatarImageUrl: profile?.avatarImageUrl ?? null,
    nickname: profile?.nickname ?? "",
    statusMessage: profile?.statusMessage ?? "",
  };
}

export function createProfileUpdatePayload(form: ProfileFormState): UpdateProfileRequest {
  const payload: UpdateProfileRequest = {
    nickname: form.nickname.trim(),
    status_message: form.statusMessage.trim() || null,
  };

  if (form.avatarImageS3Key !== undefined) {
    payload.profile_image_s3_key = form.avatarImageS3Key;
  }

  return payload;
}
