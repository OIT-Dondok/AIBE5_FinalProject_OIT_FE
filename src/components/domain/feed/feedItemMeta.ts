import { Check, Clock, X, type LucideIcon } from 'lucide-react';

import type { CrewCategory } from '@/mocks/data/crews';
import type { CertificationStatus } from '@/mocks/data/feed';

/** 카테고리별 대표 이모지 */
export const CATEGORY_EMOJI: Record<CrewCategory, string> = {
  MORNING: '🌅',
  READING: '📚',
  EXERCISE: '💪',
  STUDY: '📝',
  DIET: '🥗',
  ETC: '📌',
};

/** 프로필 아바타 배경색 (카테고리별) */
export const CATEGORY_ICON_BG: Record<CrewCategory, string> = {
  MORNING: 'bg-orange-100',
  READING: 'bg-amber-100',
  EXERCISE: 'bg-blue-100',
  STUDY: 'bg-violet-100',
  DIET: 'bg-emerald-100',
  ETC: 'bg-slate-100',
};

/** 인증 이미지 placeholder 그라데이션 (카테고리별) */
export const CATEGORY_PLACEHOLDER_BG: Record<CrewCategory, string> = {
  MORNING: 'bg-gradient-to-br from-orange-200 to-amber-300',
  READING: 'bg-gradient-to-br from-amber-200 to-yellow-300',
  EXERCISE: 'bg-gradient-to-br from-sky-200 to-blue-300',
  STUDY: 'bg-gradient-to-br from-violet-200 to-purple-300',
  DIET: 'bg-gradient-to-br from-emerald-200 to-green-300',
  ETC: 'bg-gradient-to-br from-slate-200 to-gray-300',
};

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

/** ISO 문자열을 KST 기준 "M/D 오전/오후 h:mm" 형태로 변환 */
export function formatCertifiedAt(isoStr: string): string {
  const d = new Date(isoStr);
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