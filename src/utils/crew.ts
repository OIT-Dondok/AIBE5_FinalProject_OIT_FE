import type { CrewListItem } from '@/types/domain';
import { toKstDate } from './date';
import type { CrewCategory } from '@/types/domain';

export const CATEGORY_GRADIENTS: Record<CrewCategory, string> = {
  MORNING: 'bg-gradient-to-r from-orange-400 to-amber-300 shadow-[0_0_8px_rgba(251,146,60,0.25)]',
  READING: 'bg-gradient-to-r from-amber-400 to-orange-300 shadow-[0_0_8px_rgba(251,191,36,0.25)]',
  EXERCISE: 'bg-gradient-to-r from-blue-400 to-sky-300 shadow-[0_0_8px_rgba(96,165,250,0.25)]',
  STUDY: 'bg-gradient-to-r from-violet-400 to-fuchsia-300 shadow-[0_0_8px_rgba(167,139,250,0.25)]',
  DIET: 'bg-gradient-to-r from-lime-400 to-emerald-300 shadow-[0_0_8px_rgba(163,230,53,0.25)]',
  OTHER: 'bg-gradient-to-r from-rose-400 to-pink-300 shadow-[0_0_8px_rgba(244,63,94,0.25)]',
};

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
  crew: Pick<CrewListItem, 'crew_id' | 'current_participants' | 'max_participants' | 'min_participants' | 'recruitment_deadline' | 'status' | 'category'>,
  fallbackProgressBg: string,
  isClosed: boolean
): CrewCardViewModel {
  const currentParticipants = crew.current_participants ?? 0;
  const fillPercent = crew.max_participants > 0
    ? Math.min((currentParticipants / crew.max_participants) * 100, 100)
    : 0;

  const isMinAchieved = currentParticipants >= crew.min_participants;
  const dDayInfo = crew.recruitment_deadline ? getDDay(crew.recruitment_deadline) : null;
  
  const cat = (crew.category || 'OTHER') as CrewCategory;
  const progressBg = isClosed
    ? fallbackProgressBg
    : (CATEGORY_GRADIENTS[cat] || CATEGORY_GRADIENTS.OTHER);

  return {
    currentParticipants,
    fillPercent,
    isMinAchieved,
    dDayInfo,
    progressBg,
  };
}
