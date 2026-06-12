/**
 * YYYY-MM-DD 두 날짜 사이의 일수를 UTC 기준으로 계산합니다.
 * 브라우저 로컬 타임존에 관계없이 일관된 결과를 반환합니다.
 */
export function calcDurationDays(start: string, end: string): number | null {
  if (!start || !end) return null;
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const startMs = Date.UTC(sy, sm - 1, sd);
  const endMs = Date.UTC(ey, em - 1, ed);
  return Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
}

// JS Date.getUTCDay() 인덱스(0=일요일 ~ 6=토요일) → mission_schedule_days 토큰.
// (Step3Mission의 DAYS value와 동일한 표기를 사용)
const WEEKDAY_INDEX_TO_TOKEN = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

/**
 * 특정 요일 인증 크루에서 미션 날짜를 실제 인증 요일에 맞춰 보정합니다.
 * - direction 'forward': 기준일(당일 포함) 이후로 가장 먼저 오는 인증 요일 → 시작일 보정용
 * - direction 'backward': 기준일(당일 포함) 이전으로 가장 마지막에 오는 인증 요일 → 종료일 보정용
 *
 * scheduleDays는 'MONDAY' ~ 'SUNDAY' 토큰 배열입니다. 날짜는 'YYYY-MM-DD'(로컬 캘린더 날짜)이며,
 * 요일 계산은 calcDurationDays와 동일하게 UTC 기준으로 해 타임존 드리프트를 방지합니다.
 *
 * date가 비어 있거나 scheduleDays가 비어 있으면 입력값을 그대로 반환합니다.
 * 기준일이 이미 인증 요일이면 보정 없이 그대로 반환합니다.
 *
 * @example
 * // 월·화·수 크루
 * snapToScheduledDay('2026-06-05', ['MONDAY','TUESDAY','WEDNESDAY'], 'forward')  // '2026-06-08' (금→월)
 * snapToScheduledDay('2026-06-12', ['MONDAY','TUESDAY','WEDNESDAY'], 'backward') // '2026-06-10' (금→수)
 */
export function snapToScheduledDay(
  date: string,
  scheduleDays: string[],
  direction: 'forward' | 'backward',
): string {
  if (!date || scheduleDays.length === 0) return date;
  const allowed = new Set(scheduleDays);
  const [y, m, d] = date.split('-').map(Number);
  const step = direction === 'forward' ? 1 : -1;
  const cursor = new Date(Date.UTC(y, m - 1, d));

  // 요일이 1개 이상이면 7일 내에 반드시 매칭되므로 최대 7회만 탐색한다.
  for (let i = 0; i < 7; i += 1) {
    if (allowed.has(WEEKDAY_INDEX_TO_TOKEN[cursor.getUTCDay()])) {
      const yy = cursor.getUTCFullYear();
      const mm = String(cursor.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(cursor.getUTCDate()).padStart(2, '0');
      return `${yy}-${mm}-${dd}`;
    }
    cursor.setUTCDate(cursor.getUTCDate() + step);
  }
  return date;
}
