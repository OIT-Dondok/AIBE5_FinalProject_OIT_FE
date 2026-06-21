export type HostTab = "verification" | "applications" | "notices";

export type VerificationExifStatus = "NORMAL" | "MISSING" | "FAILED";

import type {
  CertificationStatus,
  MissionLogDecisionType,
  MissionLogReviewBucket,
  RejectReasonCode,
} from "@/types/domain";

export interface VerificationCardItem {
  mission_log_id: number;
  crew_id: number;
  member_uuid: string;
  nickname: string;
  profile_image_url?: string | null;
  image_url: string | null;
  submitted_at: string;
  captured_at: string;
  exif_status: VerificationExifStatus;
  is_duplicate: boolean;
  comment: string;
  review_bucket: MissionLogReviewBucket;
  certification_status: CertificationStatus;
  decision_type?: MissionLogDecisionType | null;
  reject_reason_code: RejectReasonCode | null;
}
