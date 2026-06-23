import { useState, useEffect } from 'react';
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
 * - imageUrl의 원본 비율에 따라 4:3(가로형/정방향) 또는 4:5(세로형) 비율로 동적 적용
 * - 없으면 중립 배경 + 이미지 아이콘 placeholder (기본 4:5 비율 유지)
 * 카드용 고정 비율 크롭 전용. 원본 비율 확대는 라이트박스가 담당.
 */
export function FeedCertImage({
  imageUrl,
  alt = '인증 이미지',
  className = '',
}: FeedCertImageProps) {
  // true이면 가로형/정방향 (4:3), false이면 세로형 (4:5)
  const [isLandscape, setIsLandscape] = useState<boolean>(false);

  useEffect(() => {
    if (!imageUrl) return;

    // 브라우저 캐시로 인해 onLoad가 안 불리는 현상을 해결하기 위해 Image 객체 직접 생성 후 측정
    const img = new Image();
    img.src = imageUrl;

    const checkDimensions = () => {
      if (img.naturalWidth >= img.naturalHeight) {
        setIsLandscape(true);
      } else {
        setIsLandscape(false);
      }
    };

    if (img.complete) {
      checkDimensions();
    } else {
      img.onload = checkDimensions;
    }
  }, [imageUrl]);

  // Tailwind와 CSS style 바인딩을 병행하여 렌더링 안정성 극대화
  const ratioClass = isLandscape ? 'aspect-[4/3]' : 'aspect-[4/5]';
  const ratioStyle = isLandscape ? '4 / 3' : '4 / 5';

  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-br from-text-secondary/5 to-text-secondary/15 transition-[aspect-ratio] duration-300 ${ratioClass} ${className}`}
      style={{ aspectRatio: ratioStyle }}
    >
      {/* placeholder — 이미지가 없을 때만 노출 */}
      {!imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon size={48} strokeWidth={1.5} className="text-text-secondary/25" />
        </div>
      )}

      {/* 실제 이미지 — 로드 시 비율을 계산하여 동적 비율과 object-cover를 적용 */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ aspectRatio: ratioStyle }}
        />
      )}
    </div>
  );
}