import type { CertificationStatus, ParticipantStatus, RejectReasonCode } from "@/types/domain";

export type HostReviewBucket = "urgent" | "warning" | "normal";
export type HostExifStatus = "NORMAL" | "MISSING" | "FAILED";

export interface HostCrewDetailMock {
  crew_id: number;
  title: string;
  status: "ACTIVE" | "RECRUITING" | "CLOSED" | "CANCELLED";
  host_member_uuid: string;
  isHost: boolean;
  my_participation: {
    crew_participant_id: number;
    status: ParticipantStatus;
  };
}

export interface HostCertificationMock {
  mission_log_id: number;
  crew_id: number;
  member_uuid: string;
  nickname: string;
  image_url: string | null;
  submitted_at: string;
  captured_at: string;
  exif_status: HostExifStatus;
  exif_valid: boolean;
  is_duplicate: boolean;
  comment: string;
  first_failed: boolean;
  review_bucket: HostReviewBucket;
  certification_status: CertificationStatus;
  reject_reason_code: RejectReasonCode | null;
}

export interface HostApplicationMock {
  crew_participant_id: number;
  member_uuid: string;
  nickname: string;
  profile_image_url: string | null;
  status: ParticipantStatus;
  applied_at: string;
  decided_at: string | null;
}

export interface HostNoticeMock {
  notice_id: number;
  title: string;
  content: string;
  content_html: string;
  created_at: string;
  updated_at: string | null;
  reaction_count: number;
  comment_count: number;
  reactions: Record<string, number>;
}

export interface HostNoticeCommentMock {
  comment_id: number;
  notice_id: number;
  member_uuid: string;
  nickname: string;
  content: string;
  created_at: string;
}

export const MOCK_HOST_CREW_DETAIL: HostCrewDetailMock = {
  crew_id: 2,
  title: "독서 1챕터",
  status: "ACTIVE",
  host_member_uuid: "018f4fd2-6d7a-7a41-9f58-host00000001",
  isHost: true,
  my_participation: {
    crew_participant_id: 201,
    status: "LOCKED",
  },
};

export const MOCK_HOST_CERTIFICATIONS: HostCertificationMock[] = [
  {
    mission_log_id: 901,
    crew_id: 2,
    member_uuid: "018f4fd2-6d7a-7a41-9f58-member001",
    nickname: "민서",
    image_url: null,
    submitted_at: "2026-06-01T08:42:00+09:00",
    captured_at: "2026-06-01T08:39:00+09:00",
    exif_status: "MISSING",
    exif_valid: false,
    is_duplicate: false,
    comment: "오늘 분량 완료했습니다.",
    first_failed: true,
    review_bucket: "urgent",
    certification_status: "PENDING_REVIEW",
    reject_reason_code: null,
  },
  {
    mission_log_id: 904,
    crew_id: 2,
    member_uuid: "018f4fd2-6d7a-7a41-9f58-member004",
    nickname: "해뜸이",
    image_url: null,
    submitted_at: "2026-06-01T07:31:00+09:00",
    captured_at: "2026-06-01T07:29:00+09:00",
    exif_status: "MISSING",
    exif_valid: false,
    is_duplicate: false,
    comment: "늦게 제출했지만 오늘 분량은 완료했습니다.",
    first_failed: false,
    review_bucket: "urgent",
    certification_status: "PENDING_REVIEW",
    reject_reason_code: null,
  },
  {
    mission_log_id: 902,
    crew_id: 2,
    member_uuid: "018f4fd2-6d7a-7a41-9f58-member002",
    nickname: "주원",
    image_url: null,
    submitted_at: "2026-06-01T08:55:00+09:00",
    captured_at: "2026-06-01T08:54:00+09:00",
    exif_status: "FAILED",
    exif_valid: false,
    is_duplicate: true,
    comment: "어제보다 집중이 잘 됐어요.",
    first_failed: false,
    review_bucket: "warning",
    certification_status: "PENDING_REVIEW",
    reject_reason_code: null,
  },
  {
    mission_log_id: 903,
    crew_id: 2,
    member_uuid: "018f4fd2-6d7a-7a41-9f58-member003",
    nickname: "하린",
    image_url: null,
    submitted_at: "2026-06-01T07:58:00+09:00",
    captured_at: "2026-06-01T07:57:00+09:00",
    exif_status: "NORMAL",
    exif_valid: true,
    is_duplicate: false,
    comment: "출근 전에 인증 완료.",
    first_failed: false,
    review_bucket: "normal",
    certification_status: "PENDING_REVIEW",
    reject_reason_code: null,
  },
];

export const MOCK_CREW_APPLICATIONS: HostApplicationMock[] = [
  {
    crew_participant_id: 301,
    member_uuid: "018f4fd2-6d7a-7a41-9f58-apply001",
    nickname: "한비",
    profile_image_url: null,
    status: "PENDING",
    applied_at: "2026-06-01T13:00:00+09:00",
    decided_at: null,
  },
  {
    crew_participant_id: 302,
    member_uuid: "018f4fd2-6d7a-7a41-9f58-apply002",
    nickname: "도윤",
    profile_image_url: null,
    status: "PENDING",
    applied_at: "2026-06-01T13:20:00+09:00",
    decided_at: null,
  },
  {
    crew_participant_id: 303,
    member_uuid: "018f4fd2-6d7a-7a41-9f58-apply003",
    nickname: "서아",
    profile_image_url: null,
    status: "LOCKED",
    applied_at: "2026-05-31T18:10:00+09:00",
    decided_at: "2026-05-31T19:05:00+09:00",
  },
  {
    crew_participant_id: 304,
    member_uuid: "018f4fd2-6d7a-7a41-9f58-apply004",
    nickname: "이준",
    profile_image_url: null,
    status: "REJECTED",
    applied_at: "2026-05-31T17:45:00+09:00",
    decided_at: "2026-05-31T18:30:00+09:00",
  },
  {
    crew_participant_id: 305,
    member_uuid: "018f4fd2-6d7a-7a41-9f58-apply005",
    nickname: "유나",
    profile_image_url: null,
    status: "EXPIRED",
    applied_at: "2026-05-30T09:10:00+09:00",
    decided_at: "2026-06-01T00:00:00+09:00",
  },
];

export const MOCK_HOST_NOTICES: HostNoticeMock[] = [
  {
    notice_id: 501,
    title: "6월 첫째 주 인증 기준 안내",
    content: "사진에는 오늘 읽은 페이지와 날짜가 함께 보이도록 올려주세요.",
    content_html:
      "<p><strong>사진에는 오늘 읽은 페이지와 날짜</strong>가 함께 보이도록 올려주세요.</p><ul><li>페이지 번호가 보이면 좋아요.</li><li>촬영 시각이 Exif와 크게 다르면 거절될 수 있어요.</li></ul>",
    created_at: "2026-06-01T09:00:00+09:00",
    updated_at: null,
    reaction_count: 6,
    comment_count: 3,
    reactions: {
      "👍": 3,
      "확인": 2,
      "🔥": 1,
    },
  },
  {
    notice_id: 502,
    title: "마감 10분 전 업로드 지양",
    content: "Exif 확인이 늦어질 수 있어 마감 직전 업로드는 피해주세요.",
    content_html:
      "<p>Exif 확인이 늦어질 수 있어 <u>마감 직전 업로드는 피해 주세요.</u></p><ol><li>가능하면 마감 30분 전까지 인증해주세요.</li><li>문제가 있으면 댓글로 남겨주세요.</li></ol>",
    created_at: "2026-05-30T21:00:00+09:00",
    updated_at: "2026-05-31T10:12:00+09:00",
    reaction_count: 3,
    comment_count: 2,
    reactions: {
      "👍": 2,
      "확인": 1,
    },
  },
];

export const MOCK_HOST_NOTICE_COMMENTS: HostNoticeCommentMock[] = [
  {
    comment_id: 7001,
    notice_id: 501,
    member_uuid: "018f4fd2-6d7a-7a41-9f58-comment001",
    nickname: "민서",
    content: "확인했습니다. 오늘 인증부터 날짜가 보이게 찍을게요.",
    created_at: "2026-06-01T09:12:00+09:00",
  },
  {
    comment_id: 7002,
    notice_id: 501,
    member_uuid: "018f4fd2-6d7a-7a41-9f58-comment002",
    nickname: "주원",
    content: "페이지 번호도 같이 보이면 좋을까요?",
    created_at: "2026-06-01T09:18:00+09:00",
  },
  {
    comment_id: 7003,
    notice_id: 501,
    member_uuid: "018f4fd2-6d7a-7a41-9f58-comment003",
    nickname: "하린",
    content: "네, 기준 이해했습니다.",
    created_at: "2026-06-01T09:24:00+09:00",
  },
  {
    comment_id: 7004,
    notice_id: 502,
    member_uuid: "018f4fd2-6d7a-7a41-9f58-comment004",
    nickname: "도윤",
    content: "마감 30분 전에는 올리도록 할게요.",
    created_at: "2026-05-30T21:14:00+09:00",
  },
  {
    comment_id: 7005,
    notice_id: 502,
    member_uuid: "018f4fd2-6d7a-7a41-9f58-comment005",
    nickname: "서아",
    content: "알림 받고 바로 업로드하겠습니다.",
    created_at: "2026-05-30T21:26:00+09:00",
  },
];

export function getHostCrewDetail(crewId: number) {
  return {
    ...MOCK_HOST_CREW_DETAIL,
    crew_id: crewId,
  };
}

export function getHostCertifications(crewId: number, reviewBucket?: HostReviewBucket) {
  return MOCK_HOST_CERTIFICATIONS.filter((item) => {
    if (item.crew_id !== crewId) return false;
    if (reviewBucket && item.review_bucket !== reviewBucket) return false;
    return true;
  });
}

export function getCrewApplications(crewId: number, status?: ParticipantStatus) {
  void crewId;
  return MOCK_CREW_APPLICATIONS.filter((item) => {
    if (status && item.status !== status) return false;
    return true;
  });
}

export function getHostNotices(crewId: number) {
  void crewId;
  return MOCK_HOST_NOTICES;
}

export function getHostNotice(crewId: number, noticeId: number) {
  void crewId;
  return MOCK_HOST_NOTICES.find((notice) => notice.notice_id === noticeId) ?? null;
}

export function getHostNoticeComments(crewId: number, noticeId: number) {
  void crewId;
  return MOCK_HOST_NOTICE_COMMENTS.filter((comment) => comment.notice_id === noticeId);
}

export function deleteHostNotice(crewId: number, noticeId: number) {
  void crewId;
  return MOCK_HOST_NOTICES.some((notice) => notice.notice_id === noticeId);
}

const htmlToPlainText = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export function createHostNotice(crewId: number, payload: { title: string; content_html: string }) {
  void crewId;
  return {
    notice_id: Date.now(),
    title: payload.title,
    content: htmlToPlainText(payload.content_html),
    content_html: payload.content_html,
    created_at: new Date().toISOString(),
    updated_at: null,
    reaction_count: 0,
    comment_count: 0,
    reactions: {},
  } satisfies HostNoticeMock;
}

export function updateHostNotice(crewId: number, noticeId: number, payload: { title: string; content_html: string }) {
  void crewId;
  return {
    notice_id: noticeId,
    title: payload.title,
    content: htmlToPlainText(payload.content_html),
    content_html: payload.content_html,
    updated_at: new Date().toISOString(),
  };
}
