import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  addDaysToYmd,
  compareYmd,
  formatDateTimeDot,
  formatKstDateTime,
  formatYmdDot,
  getMonthPeriod,
  getKstDateKeyFromIso,
  getMsUntilNextKstDay,
  getKstTodayYmd,
  shiftMonthValue,
  toMonthValue,
} from './date';

describe('KST date helpers', () => {
  it('builds KST today across UTC day boundaries', () => {
    assert.equal(getKstTodayYmd(new Date('2026-06-18T14:59:59.000Z')), '2026-06-18');
    assert.equal(getKstTodayYmd(new Date('2026-06-18T15:00:00.000Z')), '2026-06-19');
  });

  it('adds days to calendar dates without local timezone drift', () => {
    assert.equal(addDaysToYmd('2026-06-18', -1), '2026-06-17');
    assert.equal(addDaysToYmd('2026-06-18', 1), '2026-06-19');
    assert.equal(addDaysToYmd('2026-03-01', -1), '2026-02-28');
  });

  it('rejects invalid calendar dates before date arithmetic', () => {
    assert.throws(() => addDaysToYmd('2026-02-31', 1), /invalid date string/);
    assert.throws(() => addDaysToYmd('2026-13-01', 1), /invalid date string/);
    assert.throws(() => addDaysToYmd('2026-00-01', 1), /invalid date string/);
    assert.throws(() => addDaysToYmd('2026-6-1', 1), /invalid date string/);
  });

  it('formats API dates and server_time with KST semantics', () => {
    assert.equal(formatYmdDot('2026-06-18'), '2026.06.18');
    assert.equal(getKstDateKeyFromIso('2026-06-18T23:30:00+09:00'), '2026-06-18');
    assert.equal(getKstDateKeyFromIso('2026-06-18T15:30:00Z'), '2026-06-19');
  });

  it('formats datetime as KST YYYY.M.D HH:mm without padding date parts', () => {
    assert.equal(formatDateTimeDot('2026-06-19T17:40:00+09:00'), '2026.6.19 17:40');
    // UTC 자정 → KST 09:00 (UTC+9). 시·분은 2자리 0 패딩
    assert.equal(formatDateTimeDot('2026-06-19T00:00:00Z'), '2026.6.19 09:00');
    assert.equal(formatDateTimeDot('not-a-date'), '');
  });

  it('returns an empty label for invalid KST datetime input', () => {
    assert.equal(formatKstDateTime(''), '');
    assert.equal(formatKstDateTime('not-a-date'), '');
  });

  it('compares YYYY-MM-DD keys lexically', () => {
    assert.equal(compareYmd('2026-06-18', '2026-06-18'), 0);
    assert.equal(compareYmd('2026-06-17', '2026-06-18'), -1);
    assert.equal(compareYmd('2026-06-19', '2026-06-18'), 1);
  });

  it('calculates the next KST day refresh delay', () => {
    assert.equal(getMsUntilNextKstDay(new Date('2026-06-18T14:59:00Z')), 60_000);
    assert.equal(getMsUntilNextKstDay(new Date('2026-06-18T15:00:00Z')), 86_400_000);
  });

  it('builds month periods with real month ends', () => {
    assert.deepEqual(getMonthPeriod('2026-06'), {
      start_date: '2026-06-01',
      end_date: '2026-06-30',
    });
    assert.deepEqual(getMonthPeriod('2024-02'), {
      start_date: '2024-02-01',
      end_date: '2024-02-29',
    });
    assert.deepEqual(getMonthPeriod('2025-02'), {
      start_date: '2025-02-01',
      end_date: '2025-02-28',
    });
  });

  it('converts and shifts month anchors across year boundaries', () => {
    assert.equal(toMonthValue('2026-06-22'), '2026-06');
    assert.equal(shiftMonthValue('2026-01', -1), '2025-12');
    assert.equal(shiftMonthValue('2025-12', 1), '2026-01');
  });
});
