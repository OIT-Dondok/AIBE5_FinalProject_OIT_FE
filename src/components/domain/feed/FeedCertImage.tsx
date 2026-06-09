import Image from 'next/image';

import type { CrewCategory } from '@/mocks/data/crews';
import { CATEGORY_EMOJI, CATEGORY_PLACEHOLDER_BG } from '@/components/domain/feed/feedItemMeta';

interface FeedCertImageProps {
  category: CrewCategory;
  /** 실제 인증 이미지 URL (없으면 그라데이션 placeholder만 표시) */
  imageUrl?: string | null;
  /** 이미지 대체 텍스트 */
  alt?: string;
  /** 추가 클래스 (그림자 등) */
  className?: string;
}

/**
 * 크루 인증 이미지 영역.
 * - 그라데이션 + 카테고리 이모지를 항상 배경에 깔아 "로딩 전 placeholder"로 사용
 * - imageUrl이 있으면 그 위에 next/image를 얹어 실제 이미지를 렌더 (로딩 완료 시 placeholder를 덮음)
 * 카드/라이트박스가 동일한 외형을 공유하도록 컴포넌트로 분리.
 */
export function FeedCertImage({
  category,
  imageUrl,
  alt = '인증 이미지',
  className = '',
}: FeedCertImageProps) {
  const emoji = CATEGORY_EMOJI[category];
  const placeholderBg = CATEGORY_PLACEHOLDER_BG[category];

  return (
    <div className={`relative w-full aspect-[4/3] overflow-hidden ${placeholderBg} ${className}`}>
      {/* 그라데이션 + 이모지 (이미지 로딩 전 placeholder 역할) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-7xl opacity-25 select-none">{emoji}</span>
      </div>

      {/* 실제 이미지 — 로딩 완료 시 위 placeholder를 덮음 */}
      {/* TODO: API 연동 시 next.config.ts의 images.remotePatterns에 S3 호스트 추가 필요 */}
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="(max-width: 430px) 100vw, 430px"
          className="object-cover"
        />
      )}
    </div>
  );
}