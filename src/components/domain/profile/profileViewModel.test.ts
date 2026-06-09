import assert from "node:assert/strict";
import test from "node:test";

import type { MeActivitySummaryResponse, MemberProfileResponse } from "@/types/domain";
import {
  buildProfileViewModel,
  createProfileFormState,
  createProfileUpdatePayload,
  formatDecimalRatioAsPercent,
  normalizeInitials,
} from "./profileViewModel";

const member: MemberProfileResponse = {
  member_uuid: "018f4fd2-6d7a-7a41-9f58-6d07f5c3c901",
  email: "user@example.com",
  nickname: "김도전",
  profile_image_url: null,
  status_message: "오늘도 한 걸음",
  is_host_ever: true,
  hosted_crew_count: 2,
  status: "ACTIVE",
  created_at: "2026-05-01T12:00:00+09:00",
};

const summary: MeActivitySummaryResponse = {
  member_uuid: member.member_uuid,
  activity_info: {
    crew: {
      total_crew_count: 17,
      active_crew_count: 3,
      completed_crew_count: 14,
    },
    total_verification_count: 24,
    unread_notification_count: 2,
  },
  activity_stats: {
    total_recognized_success_count: 450,
    highest_share_ratio: "0.250000",
    highest_share_ratio_crew_id: 42,
    highest_share_ratio_crew_title: "새벽 기상 챌린지",
    average_success_rate: null,
  },
  generated_at: "2026-06-01T09:00:00+09:00",
};

test("normalizes nickname initials without adding API types", () => {
  assert.equal(normalizeInitials("김도전", "?"), "김");
  assert.equal(normalizeInitials("", "김"), "김");
});

test("formats decimal ratio strings as display percentages with null fallback", () => {
  assert.equal(formatDecimalRatioAsPercent("0.250000"), "25.0%");
  assert.equal(formatDecimalRatioAsPercent(null), "-");
  assert.equal(formatDecimalRatioAsPercent("not-a-number"), "-");
});

test("maps existing profile API types to profile view model", () => {
  const viewModel = buildProfileViewModel(member, summary, 6);

  assert.equal(viewModel.nickname, "김도전");
  assert.equal(viewModel.initials, "김도");
  assert.equal(viewModel.unreadNotificationCount, 2);
  assert.equal(viewModel.hostOperationPendingCount, 6);
  assert.deepEqual(
    viewModel.stats.map((stat) => stat.value),
    ["17개", "450회", "25.0%", "-"],
  );
  assert.equal(viewModel.initials, "김");
});

test("builds PATCH payload from profile form without profile_image_url", () => {
  const form = createProfileFormState(buildProfileViewModel(member, summary, 0));

  const payload = createProfileUpdatePayload({
    ...form,
    nickname: "  새닉네임  ",
    statusMessage: "   ",
  });

  assert.deepEqual(payload, {
    nickname: "새닉네임",
    status_message: null,
  });
});
