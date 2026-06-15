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
    <article className="bg-card rounded-card overflow-hidden border border-text-secondary/10 shadow-card-elevated animate-feed-in">
      {/* 상단: 사용자 프로필(닉네임 첫 글자) + 크루명 + 상태 뱃지 + 상세 이동 */}
      <Link
        href={`/my/certifications/${item.mission_log_id}`}
        className="px-4 pt-4 pb-3 flex items-center gap-3 hover:bg-text-secondary/5 active:bg-text-secondary/10 transition-colors"
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
          <p className="text-[11px] text-text-secondary mt-0.5 truncate">
            {timeStr} · {item.crew_name}
          </p>
        </div>
        <span
          className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${status.className}`}
        >
          <status.Icon size={12} strokeWidth={2.5} />
          {status.label}
        </span>
        <ChevronRight size={15} className="flex-shrink-0 text-text-secondary/30" />
      </Link>

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
        <div className="px-4 pt-3.5">
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
            {item.caption}
          </p>
        </div>
      )}

      {/* 리액션 바 (mission_log_id 변경 시 remount되어 로컬 상태 초기화) */}
      <div className="px-4 py-3.5">
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