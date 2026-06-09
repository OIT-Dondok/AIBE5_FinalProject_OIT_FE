import type { DailySettlementType } from '@/types/domain';

export const CATEGORY_LABEL: Record<string, string> = {
  MORNING: '🌅 기상',
  READING: '📚 독서',
  EXERCISE: '💪 운동',
  STUDY: '📝 공부',
  DIET: '🥗 식단',
  MIND: '🧘 마음',
  HEALTH: '❤️ 건강',
} as const;

export const CATEGORY_EMOJI: Record<string, string> = {
  MORNING: '🌅',
  READING: '📚',
  EXERCISE: '💪',
  STUDY: '📝',
  DIET: '🥗',
  MIND: '🧘',
  HEALTH: '❤️',
} as const;

export const CATEGORY_BG: Record<string, string> = {
  MORNING: 'bg-orange-100',
  READING: 'bg-amber-100',
  EXERCISE: 'bg-blue-100',
  STUDY: 'bg-violet-100',
  DIET: 'bg-green-100',
  MIND: 'bg-teal-100',
  HEALTH: 'bg-rose-100',
} as const;

export const CATEGORY_GRADIENT: Record<string, string> = {
  MORNING: 'from-orange-400 to-amber-300',
  READING: 'from-amber-500 to-yellow-400',
  EXERCISE: 'from-blue-500 to-sky-400',
  STUDY: 'from-violet-500 to-purple-400',
  DIET: 'from-green-500 to-emerald-400',
  MIND: 'from-teal-500 to-cyan-400',
  HEALTH: 'from-rose-500 to-pink-400',
} as const;

export const SETTLEMENT_TYPE_LABEL: Record<DailySettlementType, string> = {
  A: '아침형',
  B: '표준형',
  C: '올빼미형',
} as const;

export const SETTLEMENT_TIMES: Record<DailySettlementType, { deadline: string; settlement: string }> = {
  A: { deadline: '09:00', settlement: '12:00' },
  B: { deadline: '21:00', settlement: '00:00' },
  C: { deadline: '23:59', settlement: '익일 12:00' },
} as const;
