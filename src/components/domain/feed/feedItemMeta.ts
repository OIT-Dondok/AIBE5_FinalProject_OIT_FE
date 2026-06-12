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