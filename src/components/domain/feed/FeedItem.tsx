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
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const month = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const hours = kst.getUTCHours();
  const ampm = hours < 12 ? '오전' : '오후';
  const displayHours = hours % 12 || 12;
  const minutes = String(kst.getUTCMinutes()).padStart(2, '0');
  return `${month}/${day} ${ampm} ${displayHours}:${minutes}`;
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
  const initial = item.nickname.trim().charAt(0).toUpperCase();

  return (
    <article className="bg-card rounded-card overflow-hidden border border-text-secondary/10 shadow-card-elevated">
      {/* 상단: 사용자 프로필(닉네임 첫 글자) + 크루명 + 상태 뱃지 */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <div
          className={`w-11 h-11 flex items-center justify-center ${iconBg} rounded-full flex-shrink-0 text-base font-bold text-text-primary shadow-sm`}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-text-primary leading-tight truncate">
            {item.nickname}
          </p>
          <p className="text-[11px] text-text-secondary mt-0.5 truncate">
            {timeStr} · {emoji} {item.crew_title} · {item.share_ratio}%
          </p>
        </div>
        <span
          className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {/* 이미지 영역: 4:3 그라데이션 placeholder (크루 인증 이미지) */}
      <div className={`relative w-full aspect-[4/3] overflow-hidden ${placeholderBg}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-7xl opacity-25 select-none">{emoji}</span>
        </div>
      </div>

      {/* 캡션 (이미지 밖 별도 영역) */}
      {item.caption && (
        <div className="px-4 pt-3.5">
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
            {item.caption}
          </p>
        </div>
      )}

      {/* 리액션 바 */}
      <div className="px-4 py-3.5">
        <FeedReactionBar initialReactions={item.reactions} />
      </div>
    </article>
  );
}
