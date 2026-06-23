import { ImageIcon } from 'lucide-react';

interface FeedCertImageProps {
  /** 실제 인증 이미지 URL (없으면 중립 placeholder만 표시) */
  imageUrl?: string | null;
  /** 이미지 대체 텍스트 */
  alt?: string;
  /** 추가 클래스 (그림자 등) */
  className?: string;
}

/**
 * 크루 인증 카드 썸네일 영역.
 * - imageUrl이 있으면 실제 이미지를 4:3으로 크롭해 렌더
 * - 없으면 중립 배경 + 이미지 아이콘 placeholder (레이아웃 시프트 방지)
 * 카드용 고정 비율 크롭 전용. 원본 비율 확대는 라이트박스가 담당.
 */
export function FeedCertImage({
  imageUrl,
  alt = '인증 이미지',
  className = '',
}: FeedCertImageProps) {
  return (
    <div
      className={`relative w-full aspect-[4/5] overflow-hidden bg-gradient-to-br from-text-secondary/5 to-text-secondary/15 ${className}`}
    >
      {/* placeholder — 이미지가 없을 때만 노출 (4:5 비율 영역 유지) */}
      {!imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon size={48} strokeWidth={1.5} className="text-text-secondary/25" />
        </div>
      )}

      {/* 실제 이미지 — placeholder와 동일하게 4:5 고정 비율과 object-cover를 완벽하게 유지 */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 w-full h-full aspect-[4/5] object-cover"
        />
      )}
    </div>
  );
}