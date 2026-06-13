import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { settlementDetailFixtures, settlementSummaryFixtures } from '@/mocks/data/settlements';
import type { CrewSettlementSummary, SettlementDetail, SettlementItem, SettlementMe } from '@/types/domain';
import {
  formatShareRatioPercent,
  getSettlementStatusCopy,
  isAllFailSettlement,
  shouldFetchSettlementDetail,
  shouldFetchSettlementMe,
  toParticipantViewItem,
  toSettlementDetailViewModel,
  toSettlementMeViewModel,
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
      },
    };

    const view = toSettlementMeViewModel(response);

    assert.ok(view);
    assert.equal(view.totalRefundAmount, '115,384원');
    assert.equal(view.totalLockedAmount, '100,000원');
    assert.equal(view.totalParticipants, '내 정산 결과');
    assert.equal(view.participants.length, 0);
  });

  it('builds all-fail refund copy from the personal settlement item', () => {
    const response: SettlementMe = {
      settlement_id: 504,
      crew_id: 42,
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
    assert.equal(view.totalRefundAmount, '100,000원');
    assert.equal(view.totalLockedAmount, '100,000원');
  });

  it('does not build a final result view when my_item is absent', () => {
    const response: SettlementMe = {
      settlement_id: 501,
      crew_id: 42,
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
    assert.equal(formatShareRatioPercent('0.000000'), '0.00%');
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

  it('uses non-blaming copy for failed and retry-wait statuses', () => {
    assert.equal(getSettlementStatusCopy('FAILED').title.includes('실패'), true);
    assert.equal(getSettlementStatusCopy('RETRY_WAIT').description.includes('자동 재시도'), true);
    assert.equal(getSettlementStatusCopy('FAILED').description.includes('탓'), false);
  });
});

