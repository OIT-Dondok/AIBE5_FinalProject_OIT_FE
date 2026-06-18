import type { CrewListItem } from '@/types/domain';
import { toKstDate } from './date';

export const PASTEL_GRADIENTS = [
  'bg-gradient-to-r from-blue-300 to-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.2)]',
  'bg-gradient-to-r from-emerald-300 to-teal-300 shadow-[0_0_8px_rgba(110,231,183,0.2)]',
  'bg-gradient-to-r from-violet-300 to-fuchsia-300 shadow-[0_0_8px_rgba(196,181,253,0.2)]',
  'bg-gradient-to-r from-amber-300 to-orange-300 shadow-[0_0_8px_rgba(252,211,77,0.2)]',
  'bg-gradient-to-r from-pink-300 to-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.15)]',
  'bg-gradient-to-r from-teal-300 to-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.2)]',
  'bg-gradient-to-r from-lime-300 to-emerald-300 shadow-[0_0_8px_rgba(190,242,50,0.15)]',
];

export interface DDayInfo {
  label: string;
  isUrgent: boolean;
}

export function getDDay(deadlineStr: string): DDayInfo | null {
  if (!deadlineStr) return null;
  const targetKst = toKstDate(deadlineStr);
  const targetDate = new Date(Date.UTC(targetKst.getUTCFullYear(), targetKst.getUTCMonth(), targetKst.getUTCDate(), 0, 0, 0, 0));
  
  const todayKst = toKstDate(new Date().toISOString());
  const todayDate = new Date(Date.UTC(todayKst.getUTCFullYear(), todayKst.getUTCMonth(), todayKst.getUTCDate(), 0, 0, 0, 0));
  
  const diffTime = targetDate.getTime() - todayDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { label: '모집 마감', isUrgent: false };
  }
  if (diffDays === 0) {
    return { label: '오늘 마감', isUrgent: true };
  }
  if (diffDays <= 3) {
    return { label: `마감 임박 D-${diffDays}`, isUrgent: true };
  }
  return { label: `모집 D-${diffDays}`, isUrgent: false };
}

export interface CrewCardViewModel {
  currentParticipants: number;
  fillPercent: number;
  isMinAchieved: boolean;
  dDayInfo: DDayInfo | null;
  progressBg: string;
}

export function getCrewCardViewModel(
  crew: Pick<CrewListItem, 'crew_id' | 'current_participants' | 'max_participants' | 'min_participants' | 'recruitment_deadline' | 'status'>,
  fallbackProgressBg: string,
  isClosed: boolean
): CrewCardViewModel {
  const currentParticipants = crew.current_participants ?? 0;
  const fillPercent = crew.max_participants > 0
    ? Math.min((currentParticipants / crew.max_participants) * 100, 100)
    : 0;

  const isMinAchieved = currentParticipants >= crew.min_participants;
  const dDayInfo = crew.recruitment_deadline ? getDDay(crew.recruitment_deadline) : null;
  
  const gradientIndex = crew.crew_id % PASTEL_GRADIENTS.length;
  const progressBg = isClosed
    ? fallbackProgressBg
    : PASTEL_GRADIENTS[gradientIndex];

  return {
    currentParticipants,
    fillPercent,
    isMinAchieved,
    dDayInfo,
    progressBg,
  };
}
