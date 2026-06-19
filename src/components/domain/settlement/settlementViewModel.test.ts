import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { settlementDetailFixtures, settlementSummaryFixtures } from '@/mocks/data/settlements';
import type { CrewSettlementSummary, SettlementDetail, SettlementItem, SettlementMe } from '@/types/domain';
import {
  formatShareRatioPercent,
  formatSuccessRatePercent,
  getCrewCelebrationTier,
  getSettlementStatusCopy,
  isAllFailSettlement,
  shouldFetchSettlementDetail,
  shouldFetchSettlementMe,
  toParticipantViewItem,
  toSettlementDetailViewModel,
  toSettlementMeViewModel,
  toSettlementResultCardViewModel,
  toSettlementResultViewModel,
} from './settlementViewModel';

describe('settlement view model', () => {
  it('fetches detail only for succeeded summaries with a persisted settlement id', () => {
    assert.equal(shouldFetchSettlementDetail(settlementSummaryFixtures.succeeded), true);
    assert.equal(shouldFetchSettlementDetail(settlementSummaryFixtures.none), false);
    assert.equal(shouldFetchSettlementDetail(settlementSummaryFixtures.running), false);

    const missingId: CrewSettlementSummary = {
      ...settlementSummaryFixtures.succeeded,
      settlement_id: null,
    };
    assert.equal(shouldFetchSettlementDetail(missingId), false);
  });

  it('fetches personal settlement only for succeeded summaries with a persisted settlement id', () => {
    assert.equal(shouldFetchSettlementMe(settlementSummaryFixtures.succeeded), true);
    assert.equal(shouldFetchSettlementMe(settlementSummaryFixtures.none), false);
    assert.equal(shouldFetchSettlementMe(settlementSummaryFixtures.running), false);
  });

  it('builds final result copy from my_item refund amount instead of aggregate items', () => {
    const response: SettlementMe = {
      settlement_id: 501,
      crew_id: 42,
      crew_name: '아침 갓생 30일',
      crew_started_at: '2026-05-01',
      crew_ended_at: '2026-05-30',
      status: 'SUCCEEDED',
      retry_count: 1,
      failure_code: null,
      failure_message: null,
      started_at: '2026-06-01T13:12:10+09:00',
      finished_at: '2026-06-01T13:12:18+09:00',
      my_item: {
        ...settlementDetailFixtures.succeeded.items[1],
        refund_amount: 115384,
        deposit_amount: 100000,
        share_ratio: '0.230769',
      },
    };

    const view = toSettlementMeViewModel(response);

    assert.ok(view);
    assert.equal(view.title, '미션이 종료되었어요');
    assert.equal(view.subtitle, '최종 정산까지 완료됐어요. 내 결과를 확인해 보세요.');
    assert.equal(view.crewName, '아침 갓생 30일');
    assert.equal(view.missionPeriod, '2026.05.01 ~ 2026.05.30');
    assert.equal(view.myShareRatioPercent, '23.08%');
    assert.equal(view.totalRefundAmount, '115,384원');
    assert.equal(view.totalLockedAmount, '100,000원');
    assert.equal(view.totalParticipants, '내 정산 결과');
    assert.equal(view.participants.length, 0);
  });

  it('builds all-fail refund copy from the personal settlement item', () => {
    const response: SettlementMe = {
      settlement_id: 504,
      crew_id: 42,
      crew_name: '아침 갓생 30일',
      crew_started_at: '2026-05-01',
      crew_ended_at: '2026-05-30',
      status: 'SUCCEEDED',
      retry_count: 0,
      failure_code: null,
      failure_message: null,
      started_at: '2026-06-01T13:12:10+09:00',
      finished_at: '2026-06-01T13:12:18+09:00',
      my_item: settlementDetailFixtures.allFail.items[0],
    };

    const view = toSettlementMeViewModel(response);

    assert.ok(view);
    assert.equal(view.isAllFail, true);
    assert.equal(view.title, '미션이 종료되었어요');
    assert.equal(view.subtitle, '인정된 성공 기록이 없어 예치금 전액이 환급됐어요.');
    assert.equal(view.totalRefundAmount, '100,000원');
    assert.equal(view.totalLockedAmount, '100,000원');
  });

  it('does not build a final result view when my_item is absent', () => {
    const response: SettlementMe = {
      settlement_id: 501,
      crew_id: 42,
      crew_name: '아침 갓생 30일',
      crew_started_at: '2026-05-01',
      crew_ended_at: '2026-05-30',
      status: 'SUCCEEDED',
      retry_count: 1,
      failure_code: null,
      failure_message: null,
      started_at: '2026-06-01T13:12:10+09:00',
      finished_at: '2026-06-01T13:12:18+09:00',
      my_item: null,
    };

    assert.equal(toSettlementMeViewModel(response), null);
  });

  it('keeps summary and detail fixtures aligned to the active settlement API contract', () => {
    assert.equal('settlement_type' in settlementSummaryFixtures.succeeded, false);
    assert.equal('settlement_type' in settlementDetailFixtures.succeeded, false);
    assert.equal('remainder_winner_crew_participant_id' in settlementDetailFixtures.succeeded, false);
    assert.equal(settlementDetailFixtures.succeeded.remainder_policy, 'HOST_REMAINDER');
    assert.equal(typeof settlementDetailFixtures.succeeded.items[0].share_ratio, 'string');
  });

  it('preserves scale-6 share_ratio strings while offering a display percent', () => {
    const item = settlementDetailFixtures.succeeded.items[0];
    const viewItem = toParticipantViewItem(item);

    assert.equal(viewItem.shareRatioRaw, '0.461538');
    assert.equal(viewItem.shareRatioPercent, '46.15%');
    assert.equal(formatShareRatioPercent('0.000000'), '0%'); // 정수 퍼센트는 소수점 생략
    assert.equal(formatShareRatioPercent('1.000000'), '100%');
    assert.equal(formatShareRatioPercent('not-a-number'), '-');
  });

  it('detects all-fail principal refund settlements from persisted item values', () => {
    assert.equal(isAllFailSettlement(settlementDetailFixtures.allFail), true);
    assert.equal(isAllFailSettlement(settlementDetailFixtures.succeeded), false);

    const driftedAllFail: SettlementDetail = {
      ...settlementDetailFixtures.allFail,
      items: [
        {
          ...settlementDetailFixtures.allFail.items[0],
          refund_amount: settlementDetailFixtures.allFail.items[0].deposit_amount - 1,
        },
      ],
    };

    assert.equal(isAllFailSettlement(driftedAllFail), false);
  });

  it('maps persisted item source of truth without deriving ranking', () => {
    const item = toParticipantViewItem(settlementDetailFixtures.hostRemainder.items[0]);

    assert.equal(item.participantLabel, '참여자 #301');
    assert.equal(item.hasRemainderBonus, true);
    assert.equal(item.remainderBonusAmount, '1원');
    assert.equal(item.refundAmount, '100,000원');
    assert.equal('rank' in item, false);
    assert.equal('rankLabel' in item, false);
    assert.equal('medalLabel' in item, false);
  });

  it('keeps participant order from the persisted settlement items', () => {
    const view = toSettlementDetailViewModel(settlementDetailFixtures.succeeded);

    assert.deepEqual(
      view.participants.map((item) => item.id),
      [7001, 7002, 7003],
    );
    assert.equal('topParticipant' in view, false);
  });

  it('safely handles missing calculation_reason on legacy/partial rows', () => {
    const malformedItem = {
      ...settlementDetailFixtures.succeeded.items[0],
      calculation_reason: undefined,
    } as unknown as SettlementItem;

    const viewItem = toParticipantViewItem(malformedItem);

    assert.equal(viewItem.includedDatesCount, 0);
    assert.equal(viewItem.excludedLogsCount, 0);
  });
  it('builds summary totals and all-fail copy from detail rows', () => {
    const allFailView = toSettlementDetailViewModel(settlementDetailFixtures.allFail);

    assert.equal(allFailView.isAllFail, true);
    assert.equal(allFailView.title, '전원 원금 환급이 완료됐어요');
    assert.equal(allFailView.subtitle, '인정된 성공 기록이 없어 지분 정산 없이 예치금 전액을 돌려드렸어요.');
    assert.equal(allFailView.totalRefundAmount, '200,000원');
    assert.equal(allFailView.totalRemainderAmount, '0원');
    assert.equal(allFailView.participants.every((item) => item.remainderBonusAmount === '0원'), true);
  });

  it('builds mission result view from my_rank and the is_me item', () => {
    const view = toSettlementResultViewModel(settlementDetailFixtures.succeeded);

    assert.ok(view.my);
    assert.equal(view.my.nickname, '갓생러');
    assert.equal(view.my.rankLabel, '1위');
    assert.equal(view.my.shareRatioPercent, '46.15%');
    assert.equal(view.my.refundAmount, '138,463원');
    assert.equal(view.my.recognizedSuccessLabel, '30회');
  });

  it('builds rank-forward hero copy and crew meta line', () => {
    const view = toSettlementResultViewModel(settlementDetailFixtures.succeeded);

    assert.equal(view.heroHeadline, '1위로 완주했어요!');
    assert.equal(view.heroRefundAmount, '138,463원');
    assert.equal(view.heroCrewName, '아침 갓생 30일');
    assert.equal(view.heroSubMeta, '2026.05.01 ~ 2026.05.30 · 30일');
  });

  it('summarizes crew snapshot fields for the result view', () => {
    const view = toSettlementResultViewModel(settlementDetailFixtures.succeeded);

    assert.equal(view.crew.crewName, '아침 갓생 30일');
    assert.equal(view.crew.missionPeriod, '2026.05.01 ~ 2026.05.30');
    assert.equal(view.crew.missionDaysLabel, '30일');
    assert.equal(view.crew.successRatePercent, '72.22%');
    assert.equal(view.crew.totalRecognizedSuccessLabel, '65회');
    assert.equal(view.crew.totalParticipantsLabel, '3명');
  });

  it('orders rank rows by rank and highlights the is_me row', () => {
    const view = toSettlementResultViewModel(settlementDetailFixtures.succeeded);

    assert.deepEqual(
      view.rankRows.map((row) => row.rank),
      [1, 2, 3],
    );
    assert.deepEqual(
      view.rankRows.map((row) => row.isMe),
      [true, false, false],
    );
    assert.equal(view.rankRows[0].rankLabel, '1위');
  });

  it('falls back to placeholders for legacy rows missing snapshot fields', () => {
    const legacy: SettlementDetail = {
      ...settlementDetailFixtures.succeeded,
      crew_name: null,
      crew_started_at: null,
      crew_ended_at: null,
      mission_days: null,
      crew_success_rate: null,
      my_rank: null,
      items: settlementDetailFixtures.succeeded.items.map((item) => ({ ...item, is_me: false })),
    };

    const view = toSettlementResultViewModel(legacy);

    assert.equal(view.crew.crewName, '크루 정보 없음');
    assert.equal(view.crew.missionPeriod, '- ~ -');
    assert.equal(view.crew.missionDaysLabel, '-');
    assert.equal(view.crew.successRatePercent, '-');
    assert.equal(view.heroCrewName, null);
    assert.equal(view.heroSubMeta, '');
    assert.equal(view.heroHeadline, '미션이 마무리됐어요');
    assert.equal(view.heroRefundAmount, null);
    assert.equal(view.my, null);
    assert.equal(formatSuccessRatePercent(null), '-');
  });

  it('uses all-fail hero and consolation copy when every participant is refunded principal', () => {
    const view = toSettlementResultViewModel(settlementDetailFixtures.allFail);

    assert.equal(view.isAllFail, true);
    assert.equal(view.crewTier, 'ALL_FAIL');
    assert.equal(view.showCelebration, false);
    assert.equal(view.crewSummaryHeading, '이번 시즌 크루 기록');
    assert.equal(view.heroHeadline, '원금을 모두 돌려받았어요');
    assert.equal(view.closingMessage, '예치금은 그대로 돌려드렸어요 — 다음엔 함께 완주해요 💪');
  });

  it('tiers crew celebration by crew_success_rate at the 80% boundary', () => {
    const at = (rate: string | null): SettlementDetail => ({
      ...settlementDetailFixtures.succeeded,
      crew_success_rate: rate,
    });

    assert.equal(getCrewCelebrationTier(at('1.0000'), false), 'PERFECT');
    assert.equal(getCrewCelebrationTier(at('0.9000'), false), 'EXCELLENT');
    assert.equal(getCrewCelebrationTier(at('0.8999'), false), 'GREAT');
    assert.equal(getCrewCelebrationTier(at('0.8000'), false), 'GREAT');
    assert.equal(getCrewCelebrationTier(at('0.7999'), false), 'NEUTRAL');
    assert.equal(getCrewCelebrationTier(at('0.7222'), false), 'NEUTRAL');
    // 레거시 성공률 null → 측정 불가 → NEUTRAL
    assert.equal(getCrewCelebrationTier(at(null), false), 'NEUTRAL');
    // 전원 환급은 성공률과 무관하게 ALL_FAIL 우선
    assert.equal(getCrewCelebrationTier(at('1.0000'), true), 'ALL_FAIL');
  });

  it('shows celebration copy for the perfect tier and withholds it below 80%', () => {
    const perfect = toSettlementResultViewModel(settlementDetailFixtures.hostRemainder);
    assert.equal(perfect.crewTier, 'PERFECT');
    assert.equal(perfect.showCelebration, true);
    assert.equal(perfect.crewSummaryHeading, '우리 크루가 함께 만든 결과');
    assert.equal(perfect.closingMessage, '한 명도 빠짐없이 완주했어요 — 완벽한 시즌이었어요 🎉');

    const neutral = toSettlementResultViewModel(settlementDetailFixtures.succeeded);
    assert.equal(neutral.crewTier, 'NEUTRAL');
    assert.equal(neutral.showCelebration, false);
    assert.equal(neutral.crewSummaryHeading, '이번 시즌 크루 기록');
    assert.equal(neutral.closingMessage, '끝까지 달려온 당신, 수고했어요 👍');
  });

  it('uses the excellent tier copy at 90% and above', () => {
    const view = toSettlementResultViewModel({
      ...settlementDetailFixtures.succeeded,
      crew_success_rate: '0.9500',
    });

    assert.equal(view.crewTier, 'EXCELLENT');
    assert.equal(view.closingMessage, '끝까지 함께한 우리, 정말 멋진 크루예요 👏');
  });

  it('builds a shareable result card from my settlement item', () => {
    const card = toSettlementResultCardViewModel(settlementDetailFixtures.succeeded);

    assert.ok(card);
    assert.equal(card.brand, 'dondok');
    assert.equal(card.periodLabel, '2026.05.01 ~ 2026.05.30');
    assert.equal(card.crewName, '아침 갓생 30일');
    assert.equal(card.rankLabel, '1위');
    assert.equal(card.totalParticipantsLabel, '3명');
    assert.equal(card.refundAmount, '138,463원');
    assert.equal(card.depositComparePrefix, '보증금 100,000원 대비');
    assert.equal(card.refundDeltaLabel, '+38,463원');
    assert.equal(card.refundDeltaSign, 'up');
    assert.equal(card.successRateLabel, '100%');
    assert.equal(card.successCountLabel, '30 / 30일');
    assert.equal(card.fileName, 'dondok_result_아침_갓생_30일_2026-05-30.png');
    assert.equal(card.isAllFail, false);
  });

  it('shows a flat delta and computed rate for all-fail principal refunds', () => {
    const card = toSettlementResultCardViewModel(settlementDetailFixtures.allFail);

    assert.ok(card);
    assert.equal(card.depositComparePrefix, '보증금 100,000원 대비');
    assert.equal(card.refundDeltaLabel, '±0원');
    assert.equal(card.refundDeltaSign, 'flat');
    assert.equal(card.successRateLabel, '0%');
    assert.equal(card.successCountLabel, '0 / 30일');
    assert.equal(card.isAllFail, true);
  });

  it('returns null result card when there is no participating row', () => {
    const noMine: SettlementDetail = {
      ...settlementDetailFixtures.succeeded,
      items: settlementDetailFixtures.succeeded.items.map((item) => ({ ...item, is_me: false })),
    };

    assert.equal(toSettlementResultCardViewModel(noMine), null);
  });

  it('hides period and rate, uses finished_at filename when crew snapshot is missing', () => {
    const legacy: SettlementDetail = {
      ...settlementDetailFixtures.succeeded,
      crew_name: null,
      crew_started_at: null,
      crew_ended_at: null,
      mission_days: null,
    };

    const card = toSettlementResultCardViewModel(legacy);

    assert.ok(card);
    assert.equal(card.periodLabel, '');
    assert.equal(card.successRateLabel, null);
    assert.equal(card.successCountLabel, '30회');
    // 파일명 날짜는 finished_at(2026-06-01T13:12:18+09:00) 폴백
    assert.equal(card.fileName, 'dondok_result_우리_크루_2026-06-01.png');
  });

  it('uses non-blaming copy for failed and retry-wait statuses', () => {
    assert.equal(getSettlementStatusCopy('FAILED').title.includes('실패'), true);
    assert.equal(getSettlementStatusCopy('RETRY_WAIT').description.includes('자동 재시도'), true);
    assert.equal(getSettlementStatusCopy('FAILED').description.includes('탓'), false);
  });
});

