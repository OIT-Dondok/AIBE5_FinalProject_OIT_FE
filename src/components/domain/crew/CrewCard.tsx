import { Calendar } from 'lucide-react';
import type { CrewListItem, CrewStatus, CrewCategory } from '@/types/domain';

const CATEGORY_EMOJI: Record<CrewCategory, string> = {
  MORNING: '🌅',
  READING: '📚',
  EXERCISE: '💪',
  STUDY: '📝',
  DIET: '🥗',
  MIND: '🧘',
  HEALTH: '❤️',
};

const CATEGORY_BG: Record<CrewCategory, string> = {
  MORNING: 'bg-orange-50',
  READING: 'bg-amber-50',
  EXERCISE: 'bg-blue-50',
  STUDY: 'bg-violet-50',
  DIET: 'bg-green-50',
  MIND: 'bg-teal-50',
  HEALTH: 'bg-rose-50',
};

interface StatusConfig {
  dot: string;
  text: string;
  label: string;
  progress: string;
}

const STATUS_CONFIG: Record<CrewStatus, StatusConfig> = {
  RECRUITING: {
    dot: 'bg-primary-blue',
    text: 'text-primary-blue',
    label: '모집중',
    progress: 'bg-primary-blue',
  },
  ACTIVE: {
    dot: 'bg-primary-green animate-pulse',
    text: 'text-primary-green',
    label: '진행중',
    progress: 'bg-primary-green',
  },
  CLOSED: {
    dot: 'bg-text-secondary/50',
    text: 'text-text-secondary',
    label: '종료됨',
    progress: 'bg-text-secondary/30',
  },
  CANCELLED: {
    dot: 'bg-red-400',
    text: 'text-red-500',
    label: '취소됨',
    progress: 'bg-red-300',
  },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  d.setUTCHours(d.getUTCHours() + 9);
  return `${d.getUTCMonth() + 1}.${String(d.getUTCDate()).padStart(2, '0')}`;
}

interface CrewCardProps {
  crew: CrewListItem;
}

export default function CrewCard({ crew }: CrewCardProps) {
  const category = crew.category as CrewCategory;
  const emoji = CATEGORY_EMOJI[category] ?? '📌';
  const categoryBg = CATEGORY_BG[category] ?? 'bg-gray-50';
  const status = STATUS_CONFIG[crew.status];
  const isClosed = crew.status === 'CLOSED' || crew.status === 'CANCELLED';

  const fillPercent = 0;

  return (
      <div className={`bg-card rounded-card p-5 flex flex-col gap-4 border border-text-secondary/10 shadow-card hover:shadow-card-elevated active:scale-[0.985] transition-all duration-200 cursor-pointer ${isClosed ? 'opacity-60' : ''}`}>

        {/* 상단: 이모지 + 크루명/상태 + 보증금 */}
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 flex items-center justify-center ${categoryBg} rounded-2xl flex-shrink-0 text-2xl shadow-sm`}>
            {emoji}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-text-primary leading-tight truncate mb-1.5">
              {crew.title}
            </p>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
              <span className={`text-xs font-semibold ${status.text}`}>{status.label}</span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-[15px] font-extrabold text-primary-green leading-tight">
              {crew.deposit_amount.toLocaleString()}
              <span className="text-xs font-semibold ml-0.5">원</span>
            </p>
            <p className="text-[10px] text-text-secondary mt-0.5 tracking-tight">보증금</p>
          </div>
        </div>

        {/* 참여 현황 프로그레스 바 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-secondary font-medium">참여 현황</span>
            <span className="text-[11px] font-bold text-text-primary">
              최소 {crew.min_participants}명 / 최대 {crew.max_participants}명
            </span>
          </div>
          <div className="w-full h-1.5 bg-text-secondary/10 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-300 ${status.progress}`}
                style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        {/* 하단: 기간 */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-text-secondary/10">
          <Calendar size={11} strokeWidth={2} className="text-text-secondary/70" />
          <span className="text-[11px] text-text-secondary">
          {formatDate(crew.start_at)} ~ {formatDate(crew.end_at)}
        </span>
        </div>
      </div>
  );
}
