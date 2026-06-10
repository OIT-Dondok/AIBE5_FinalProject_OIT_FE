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
