import type { CrewCategory } from '@/mocks/data/crews';
import type { CertificationStatus, FeedItem as FeedItemType } from '@/mocks/data/feed';
import { FeedReactionBar } from '@/components/domain/feed/FeedReactionBar';

const CATEGORY_EMOJI: Record<CrewCategory, string> = {
  MORNING: '🌅',
  READING: '📚',
  EXERCISE: '💪',
  STUDY: '📝',
  DIET: '🥗',
  MIND: '🧘',
  HEALTH: '❤️',
};

const CATEGORY_ICON_BG: Record<CrewCategory, string> = {
  MORNING: 'bg-orange-100',
  READING: 'bg-amber-100',
  EXERCISE: 'bg-blue-100',
  STUDY: 'bg-violet-100',
  DIET: 'bg-emerald-100',
  MIND: 'bg-teal-100',
  HEALTH: 'bg-rose-100',
};

const CATEGORY_PLACEHOLDER_BG: Record<CrewCategory, string> = {
  MORNING: 'bg-gradient-to-br from-orange-200 to-amber-300',
  READING: 'bg-gradient-to-br from-amber-200 to-yellow-300',
  EXERCISE: 'bg-gradient-to-br from-sky-200 to-blue-300',
  STUDY: 'bg-gradient-to-br from-violet-200 to-purple-300',
  DIET: 'bg-gradient-to-br from-emerald-200 to-green-300',
  MIND: 'bg-gradient-to-br from-teal-200 to-cyan-300',
  HEALTH: 'bg-gradient-to-br from-rose-200 to-pink-300',
};

const STATUS_CONFIG: Record<CertificationStatus, { label: string; className: string }> = {
  SUCCESS: {
    label: '성공',
    className: 'bg-primary-green text-white shadow-sm shadow-primary-green/30',
  },
  PENDING_REVIEW: {
    label: '검토중',
    className: 'bg-primary-blue text-white shadow-sm shadow-primary-blue/30',
  },
  FAILED: {
    label: '실패',
    className: 'bg-red-500 text-white shadow-sm shadow-red-500/30',
  },
};

function formatCertifiedAt(isoStr: string): string {
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '-';
  const kstHours = (d.getUTCHours() + 9) % 24;
  const ampm = kstHours < 12 ? '오전' : '오후';
  const displayHours = kstHours % 12 || 12;
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  return `${ampm} ${displayHours}:${minutes}`;
}

interface FeedItemProps {
  item: FeedItemType;
}

export function FeedItem({ item }: FeedItemProps) {
  const emoji = CATEGORY_EMOJI[item.category];
  const iconBg = CATEGORY_ICON_BG[item.category];
  const placeholderBg = CATEGORY_PLACEHOLDER_BG[item.category];
  const status = STATUS_CONFIG[item.certification_status];
  const timeStr = formatCertifiedAt(item.certified_at);

  return (
    <article className="bg-card rounded-card overflow-hidden border border-text-secondary/10 shadow-card-elevated">
      {/* 상단: 카테고리 아이콘 + 크루명 + 상태 뱃지 */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <div
          className={`w-11 h-11 flex items-center justify-center ${iconBg} rounded-full flex-shrink-0 text-2xl shadow-sm`}
        >
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-text-primary leading-tight truncate">
            {item.crew_title}
          </p>
          <p className="text-[11px] text-text-secondary mt-0.5 truncate">
            {emoji} {item.nickname} · {timeStr} · {item.share_ratio}%
          </p>
        </div>
        <span
          className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {/* 이미지 영역: 4:3 그라데이션 placeholder */}
      <div className={`relative w-full aspect-[4/3] overflow-hidden ${placeholderBg}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-7xl opacity-20 select-none">{emoji}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <p className="absolute bottom-3.5 left-4 right-4 text-white text-xs font-semibold leading-snug line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {item.caption}
        </p>
      </div>

      {/* 리액션 바 */}
      <div className="px-4 py-3.5">
        <FeedReactionBar initialReactions={item.reactions} />
      </div>
    </article>
  );
}
