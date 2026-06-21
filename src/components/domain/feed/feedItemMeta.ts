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

interface CrewColorTheme {
  bgClass: string;
  textClass: string;
  borderClass: string;
}

const PASTEL_PALETTE: CrewColorTheme[] = [
  {
    bgClass: 'bg-card',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/25 dark:border-emerald-500/35',
  },
  {
    bgClass: 'bg-card',
    textClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-500/25 dark:border-blue-500/35',
  },
  {
    bgClass: 'bg-card',
    textClass: 'text-purple-600 dark:text-purple-400',
    borderClass: 'border-purple-500/25 dark:border-purple-500/35',
  },
  {
    bgClass: 'bg-card',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-500/25 dark:border-amber-500/35',
  },
  {
    bgClass: 'bg-card',
    textClass: 'text-rose-600 dark:text-rose-400',
    borderClass: 'border-rose-500/25 dark:border-rose-500/35',
  },
  {
    bgClass: 'bg-card',
    textClass: 'text-indigo-600 dark:text-indigo-400',
    borderClass: 'border-indigo-500/25 dark:border-indigo-500/35',
  },
  {
    bgClass: 'bg-card',
    textClass: 'text-cyan-600 dark:text-cyan-400',
    borderClass: 'border-cyan-500/25 dark:border-cyan-500/35',
  },
];

export function getCrewBrandingColor(crewId: number): CrewColorTheme {
  const index = Math.abs(crewId) % PASTEL_PALETTE.length;
  return PASTEL_PALETTE[index];
}