"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import type { FeedItem as FeedItemType } from '@/types/domain';
import { FeedReactionBar } from '@/components/domain/feed/FeedReactionBar';
import { FeedImageLightbox } from '@/components/domain/feed/FeedImageLightbox';
import { FeedCertImage } from '@/components/domain/feed/FeedCertImage';
import {
  STATUS_CONFIG,
  formatServerTime,
  getInitial,
  getCrewBrandingColor,
} from '@/components/domain/feed/feedItemMeta';

interface FeedItemProps {
  item: FeedItemType;
  /** 인증 로그가 더 이상 존재하지 않을 때 상위 목록에서 이 아이템을 제거한다. */
  onRemove?: (missionLogId: number) => void;
}

export function FeedItem({ item, onRemove }: FeedItemProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const status = STATUS_CONFIG[item.certification_status];
  const timeStr = formatServerTime(item.server_time);
  const initial = getInitial(item.nickname);

  return (
    <article className="bg-card rounded-[28px] overflow-hidden border border-text-secondary/8 shadow-[0_8px_32px_rgba(0,0,0,0.035)] animate-feed-in">
      {/* 상단: 닉네임/아바타(멤버 프로필 이동) + 상태 뱃지/chevron(인증 상세 이동) */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3.5">
        <Link
          href={`/members/${item.member_uuid}`}
          className="flex items-center gap-3.5 min-w-0 flex-1 hover:bg-text-secondary/5 active:bg-text-secondary/10 transition-colors rounded-xl -mx-1 px-1 -my-0.5 py-0.5"
        >
          {/* 프로필: 이미지가 있으면 사진, 없으면 닉네임 첫 글자 */}
          <div className="relative w-11 h-11 flex items-center justify-center bg-primary-green/10 rounded-full flex-shrink-0 overflow-hidden text-base font-bold text-text-primary shadow-sm">
            {initial}
            {item.profile_image_url && (
              <img
                src={item.profile_image_url}
                alt={`${item.nickname} 프로필`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-text-primary leading-tight truncate">
              {item.nickname}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] text-text-secondary shrink-0">
                {timeStr}
              </span>
              <span
                className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-black border tracking-tight truncate max-w-[120px] transition-colors ${getCrewBrandingColor(item.crew_id).bgClass} ${getCrewBrandingColor(item.crew_id).textClass} ${getCrewBrandingColor(item.crew_id).borderClass}`}
                title={item.crew_name}
              >
                {item.crew_name}
              </span>
            </div>
          </div>
        </Link>
        <Link
          href={`/my/certifications/${item.mission_log_id}`}
          className="flex items-center gap-1 shrink-0 hover:bg-text-secondary/5 active:bg-text-secondary/10 transition-colors rounded-xl px-1 -mr-1 py-0.5"
        >
          <span
            className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${status.className}`}
          >
            <status.Icon size={12} strokeWidth={2.5} />
            {status.label}
          </span>
          <ChevronRight size={15} className="flex-shrink-0 text-text-secondary/30" />
        </Link>
      </div>

      {/* 이미지 영역 (실제 이미지가 있을 때만 클릭 확대 활성화) */}
      <div className="relative">
        <FeedCertImage
          imageUrl={item.image_url}
          alt={`${item.nickname}님의 ${item.crew_name} 인증 이미지`}
        />
        {item.image_url && (
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            aria-label="인증 이미지 확대 보기"
            className="absolute inset-0 w-full h-full cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-green/50"
          />
        )}
      </div>

      {/* 캡션 (이미지 밖 별도 영역) */}
      {item.caption && (
        <div className="px-5 pt-4 pb-1">
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
            {item.caption}
          </p>
        </div>
      )}

      {/* 리액션 바 (mission_log_id 변경 시 remount되어 로컬 상태 초기화) */}
      <div className="px-5 pb-5 pt-3">
        <FeedReactionBar
          key={item.mission_log_id}
          missionLogId={item.mission_log_id}
          reactionCounts={item.reaction_counts}
          myReactions={item.my_reactions}
          onMissingLog={() => onRemove?.(item.mission_log_id)}
        />
      </div>

      {/* 이미지 확대 라이트박스 */}
      {isLightboxOpen && (
        <FeedImageLightbox item={item} onClose={() => setIsLightboxOpen(false)} />
      )}
    </article>
  );
}