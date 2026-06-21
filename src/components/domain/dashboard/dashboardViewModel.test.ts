import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { DashboardResponse } from "@/types/domain";

import { mapCrewDashboard } from "./dashboardViewModel";

// LIVE 정상 케이스 기준 fixture. 케이스별로 필요한 필드만 덮어쓴다.
const baseRes: DashboardResponse = {
  crew_id: 1,
  crew_name: "아침 갓생 30일",
  crew_participant_id: 10,
  settlement_id: null,
  crew_status: "ACTIVE",
  settlement_status: "NONE",
  projection_status: "LIVE",
  projection_notice: "ESTIMATED_NOT_FINAL",
  days_until_end: 5,
  my_deposit_amount: 10000,
  my_success_count: 12,
  my_expected_refund_amount: 13000,
  my_expected_refund_delta_amount: 3000,
  rank: 2,
  participant_count: 5,
  rank_delta: 1,
  next_settlement_at: null,
  participants: [
    { crew_participant_id: 10, nickname: "나", share_ratio: "0.25", is_me: true },
    { crew_participant_id: 11, nickname: "동료", share_ratio: "0.75", is_me: false },
  ],
  updated_at: "2026-06-19T17:40:00+09:00",
};

function makeRes(overrides: Partial<DashboardResponse>): DashboardResponse {
  return { ...baseRes, ...overrides };
}

describe("mapCrewDashboard — 보증금 대비 손익 보조줄", () => {
  it("예상 환급금이 보증금보다 크면 상승 손익으로 표기한다", () => {
    const vm = mapCrewDashboard(baseRes);
    assert.equal(vm.depositComparePrefix, "보증금 10,000원 대비");
    assert.equal(vm.depositPnlLabel, "+3,000원");
    assert.equal(vm.depositPnlTrend, "up");
  });

  it("예상 환급금이 보증금보다 작으면 하락 손익으로 표기한다", () => {
    const vm = mapCrewDashboard(makeRes({ my_expected_refund_amount: 8000 }));
    assert.equal(vm.depositComparePrefix, "보증금 10,000원 대비");
    assert.equal(vm.depositPnlLabel, "-2,000원");
    assert.equal(vm.depositPnlTrend, "down");
  });

  it("예상 환급금이 보증금과 같으면 ±0원으로 표기한다", () => {
    const vm = mapCrewDashboard(makeRes({ my_expected_refund_amount: 10000 }));
    assert.equal(vm.depositPnlLabel, "±0원");
    assert.equal(vm.depositPnlTrend, "flat");
  });

  it("예상 환급금이 null이면 prefix를 null로 두어 보조줄을 숨긴다", () => {
    const vm = mapCrewDashboard(
      makeRes({
        projection_notice: "NOT_PROVIDED",
        my_expected_refund_amount: null,
        my_expected_refund_delta_amount: null,
      }),
    );
    assert.equal(vm.depositComparePrefix, null);
    assert.equal(vm.depositPnlLabel, "");
    assert.equal(vm.expectedRefund, "집계 전");
  });
});

describe("mapCrewDashboard — 오늘 변동(직전 배치 대비) 헤더", () => {
  it("변동액과 직전값 기준 변동률을 함께 표기한다", () => {
    // 직전값 = 13,000 − 3,000 = 10,000 → 3,000 / 10,000 = +30.0%
    const vm = mapCrewDashboard(baseRes);
    assert.equal(vm.todayDeltaLabel, "+3,000원 (+30.0%)");
    assert.equal(vm.todayDeltaTrend, "up");
  });

  it("하락 변동도 변동률과 함께 표기한다", () => {
    // 직전값 = 7,000 − (−3,000) = 10,000 → −3,000 / 10,000 = −30.0%
    const vm = mapCrewDashboard(
      makeRes({ my_expected_refund_amount: 7000, my_expected_refund_delta_amount: -3000 }),
    );
    assert.equal(vm.todayDeltaLabel, "-3,000원 (-30.0%)");
    assert.equal(vm.todayDeltaTrend, "down");
  });

  it("첫 정산 등 변동액이 null이면 라벨을 null로 두어 헤더에서 숨긴다", () => {
    const vm = mapCrewDashboard(makeRes({ my_expected_refund_delta_amount: null }));
    assert.equal(vm.todayDeltaLabel, null);
    assert.equal(vm.todayDeltaTrend, "flat");
  });

  it("변동액이 0이면 % 없이 0원만 표기한다", () => {
    const vm = mapCrewDashboard(makeRes({ my_expected_refund_delta_amount: 0 }));
    assert.equal(vm.todayDeltaLabel, "0원");
    assert.equal(vm.todayDeltaTrend, "flat");
  });

  it("직전값이 0이면(현재값 = 변동액) % 산출이 불가하므로 금액만 표기한다", () => {
    const vm = mapCrewDashboard(
      makeRes({ my_expected_refund_amount: 3000, my_expected_refund_delta_amount: 3000 }),
    );
    assert.equal(vm.todayDeltaLabel, "+3,000원");
    assert.equal(vm.todayDeltaTrend, "up");
  });
});

describe("mapCrewDashboard — 데이터 기준 시각", () => {
  it("updated_at을 KST 기준 'YYYY.M.D HH:mm'으로 노출한다", () => {
    const vm = mapCrewDashboard(baseRes);
    assert.equal(vm.updatedAtLabel, "2026.6.19 17:40");
  });
});
