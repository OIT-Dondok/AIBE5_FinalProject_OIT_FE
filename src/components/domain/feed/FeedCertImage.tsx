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
 * 크루 인증 이미지 영역.
 * - imageUrl이 있으면 실제 이미지를 4:3으로 렌더
 * - 없으면 중립 배경 + 이미지 아이콘 placeholder (레이아웃 시프트 방지)
 * 카드/라이트박스가 동일한 외형을 공유하도록 컴포넌트로 분리.
 */
export function FeedCertImage({
  imageUrl,
  alt = '인증 이미지',
  className = '',
}: FeedCertImageProps) {
  return (
    <div
      className={`relative w-full aspect-[4/3] overflow-hidden bg-gradient-to-br from-text-secondary/5 to-text-secondary/15 ${className}`}
    >
      {/* placeholder — 이미지가 없을 때만 노출 */}
      {!imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon size={48} strokeWidth={1.5} className="text-text-secondary/25" />
        </div>
      )}

      {/* 실제 이미지 (원격 호스트) */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}