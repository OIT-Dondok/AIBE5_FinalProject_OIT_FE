import { Check, Clock, X, type LucideIcon } from 'lucide-react';

import type { CertificationStatus } from '@/types/domain';

/** 인증 상태별 라벨·스타일·아이콘 */
export const STATUS_CONFIG: Record<
  CertificationStatus,
  { label: string; className: string; Icon: LucideIcon }
> = {
  SUCCESS: {
    label: '성공',
    Icon: Check,
    className: 'bg-primary-green text-white shadow-sm shadow-primary-green/30',
  },
  PENDING_REVIEW: {
    label: '검토중',
    Icon: Clock,
    className: 'bg-primary-blue text-white shadow-sm shadow-primary-blue/30',
  },
  FAILED: {
    label: '실패',
    Icon: X,
    className: 'bg-red-500 text-white shadow-sm shadow-red-500/30',
  },
};

/** ISO 문자열(server_time)을 KST 기준 "M/D 오전/오후 h:mm" 형태로 변환 */
export function formatServerTime(isoStr: string): string {
  if (!isoStr) return '-';
  const d = new Date(isoStr.trim());
  if (isNaN(d.getTime())) return '-';
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const month = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const hours = kst.getUTCHours();
  const ampm = hours < 12 ? '오전' : '오후';
  const displayHours = hours % 12 || 12;
  const minutes = String(kst.getUTCMinutes()).padStart(2, '0');
  return `${month}/${day} ${ampm} ${displayHours}:${minutes}`;
}

/** 닉네임 첫 글자(프로필 placeholder용). 비어있거나 공백뿐이면 '?' 반환 */
export function getInitial(nickname: string): string {
  return nickname.trim().charAt(0).toUpperCase() || '?';
}

import type { CrewCategory } from '@/types/domain';

interface CrewColorTheme {
  active: string;
  inactive: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const CATEGORY_THEMES: Record<CrewCategory, CrewColorTheme> = {
  MORNING: {
    active: 'bg-orange-400 text-white shadow-lg shadow-orange-400/30 ring-4 ring-orange-400/20 scale-[1.04] z-10',
    inactive: 'bg-orange-50 text-orange-700 hover:bg-orange-100/80 border border-orange-100/30',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-600 dark:text-orange-400',
    borderClass: 'border-orange-500/25 dark:border-orange-500/35',
  },
  READING: {
    active: 'bg-amber-400 text-white shadow-lg shadow-amber-400/30 ring-4 ring-amber-400/20 scale-[1.04] z-10',
    inactive: 'bg-amber-50 text-amber-700 hover:bg-amber-100/80 border border-amber-100/30',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-500/25 dark:border-amber-500/35',
  },
  EXERCISE: {
    active: 'bg-blue-400 text-white shadow-lg shadow-blue-400/30 ring-4 ring-blue-400/20 scale-[1.04] z-10',
    inactive: 'bg-blue-50 text-blue-700 hover:bg-blue-100/80 border border-blue-100/30',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-500/25 dark:border-blue-500/35',
  },
  STUDY: {
    active: 'bg-violet-400 text-white shadow-lg shadow-violet-400/30 ring-4 ring-violet-400/20 scale-[1.04] z-10',
    inactive: 'bg-violet-50 text-violet-700 hover:bg-violet-100/80 border border-violet-100/30',
    bgClass: 'bg-violet-50',
    textClass: 'text-violet-600 dark:text-violet-400',
    borderClass: 'border-violet-500/25 dark:border-violet-500/35',
  },
  DIET: {
    active: 'bg-lime-400 text-white shadow-lg shadow-lime-400/30 ring-4 ring-lime-400/20 scale-[1.04] z-10',
    inactive: 'bg-lime-50 text-lime-700 hover:bg-lime-100/80 border border-lime-100/30',
    bgClass: 'bg-lime-50',
    textClass: 'text-lime-600 dark:text-lime-400',
    borderClass: 'border-lime-500/25 dark:border-lime-500/35',
  },
  OTHER: {
    active: 'bg-rose-400 text-white shadow-lg shadow-rose-400/30 ring-4 ring-rose-400/20 scale-[1.04] z-10',
    inactive: 'bg-rose-50 text-rose-700 hover:bg-rose-100/80 border border-rose-100/30',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-600 dark:text-rose-400',
    borderClass: 'border-rose-500/25 dark:border-rose-500/35',
  },
};

export function getCategoryByName(crewName: string): CrewCategory {
  const name = crewName || '';
  if (name.includes('기상') || name.includes('아침') || name.includes('새벽') || name.includes('MORNING')) {
    return 'MORNING';
  }
  if (name.includes('독서') || name.includes('책') || name.includes('READING')) {
    return 'READING';
  }
  if (name.includes('운동') || name.includes('헬스') || name.includes('런닝') || name.includes('러닝') || name.includes('EXERCISE') || name.includes('스쿼트')) {
    return 'EXERCISE';
  }
  if (name.includes('공부') || name.includes('학습') || name.includes('스터디') || name.includes('STUDY')) {
    return 'STUDY';
  }
  if (name.includes('식단') || name.includes('음식') || name.includes('다이어트') || name.includes('DIET') || name.includes('밥')) {
    return 'DIET';
  }
  return 'OTHER';
}

export function getCrewBrandingColor(crewId: number, crewName?: string): CrewColorTheme {
  if (crewName) {
    const cat = getCategoryByName(crewName);
    return CATEGORY_THEMES[cat];
  }
  const keys: CrewCategory[] = ['MORNING', 'READING', 'EXERCISE', 'STUDY', 'DIET', 'OTHER'];
  const index = Math.abs(crewId) % keys.length;
  return CATEGORY_THEMES[keys[index]];
}