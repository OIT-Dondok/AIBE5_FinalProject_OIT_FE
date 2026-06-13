import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createSettlementService } from '@/services/settlement';

describe('settlement API mapping', () => {
  it('calls the personal settlement endpoint without loading full items', async () => {
    const calls: string[] = [];

    const settlementService = createSettlementService({
      get: (url: string) => {
        calls.push(url);
        assert.equal(url, '/settlements/501/me');

        return Promise.resolve({
          data: {
            settlement_id: 501,
            crew_id: 401,
            user_id: 777,
            account_id: 9001,
            status: 'SUCCEEDED',
            retry_count: 0,
            failure_code: null,
            failure_message: null,
            started_at: '2026-01-01T00:00:00+09:00',
            finished_at: '2026-01-01T00:00:30+09:00',
            created_at: '2026-01-01T00:00:00+09:00',
            my_item: {
              settlement_item_id: 1001,
              crew_participant_id: 777,
              participant_status_snapshot: 'LOCKED',
              deposit_amount: 20000,
              success_count_raw: 3,
              recognized_success_count: 3,
              recognized_dates_count: 3,
              excluded_success_count: 0,
              share_ratio: '0.333333',
              base_refund_amount: 6666,
              remainder_bonus_amount: 0,
              refund_amount: 6666,
              point_history_id: null,
              calculation_reason: {
                included_dates: ['2026-01-01'],
                excluded_logs: [],
              },
            },
          },
        });
      },
    });

    const response = await settlementService.getSettlementMe(501);

    assert.equal(response.data.settlement_id, 501);
    assert.equal(typeof response.data.crew_id, 'number');
    assert.equal(response.data.my_item?.settlement_item_id, 1001);
    assert.equal(response.data.status, 'SUCCEEDED');
    assert.equal((response.data as { user_id: number }).user_id, 777);
    assert.equal((response.data as { account_id: number }).account_id, 9001);
    assert.equal(response.data.created_at ?? null, '2026-01-01T00:00:00+09:00');
    assert.deepEqual(calls, ['/settlements/501/me']);
  });
});
