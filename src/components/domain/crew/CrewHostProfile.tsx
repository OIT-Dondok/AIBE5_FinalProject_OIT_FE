import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserRound, Crown } from 'lucide-react';

interface CrewHostProfileProps {
  description: string | null;
  hostNickname: string;
  hostMemberUuid: string;
  hostProfileUrl: string | null;
}

export default function CrewHostProfile({
  description,
  hostNickname,
  hostMemberUuid,
  hostProfileUrl,
}: CrewHostProfileProps) {
  const [imgError, setImgError] = useState(false);

  // hostProfileUrl이 변경되면 이미지 에러 상태를 초기화합니다.
  useEffect(() => {
    setImgError(false);
  }, [hostProfileUrl]);

  return (
    <div className="flex flex-col gap-3">
      {description && (
        <div className="relative bg-card border border-primary-green/50 rounded-2xl p-4.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {/* 말풍선 아래 방향 꼬리 */}
          <div className="absolute bottom-[-5px] left-8 w-2.5 h-2.5 bg-card border-b border-r border-primary-green/50 rotate-45" />
          <p className="text-[15px] font-semibold text-text-primary/95 leading-relaxed whitespace-pre-wrap relative z-10">
            {description}
          </p>
        </div>
      )}

      {/* 크루장 프로필 + 이름 라벨 (아래) */}
      <Link
        href={`/members/${hostMemberUuid}`}
        className="flex items-center gap-3 ml-3 hover:opacity-85 transition-opacity cursor-pointer group/host"
      >
        <div className="relative shrink-0">
          {/* 왕관 아이콘 데코 (미세 바운스 효과) */}
          <Crown
            size={14}
            className="absolute -top-2.5 -left-1 text-amber-500 fill-amber-300 drop-shadow-md rotate-[-20deg] z-10 animate-bounce"
            style={{ animationDuration: '3.5s' }}
          />
          <div className="w-11 h-11 rounded-full overflow-hidden bg-neutral-200 border border-yellow-300 ring-2 ring-yellow-400/30 shadow-[0_0_12px_rgba(245,158,11,0.25)] flex items-center justify-center group-hover/host:ring-yellow-400/50 transition-all">
            {hostProfileUrl && hostProfileUrl.trim() !== '' && !imgError ? (
              <img
                src={hostProfileUrl}
                alt={hostNickname}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <UserRound size={20} className="text-neutral-500" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-extrabold text-text-primary leading-none group-hover/host:text-primary-green transition-colors">
            {hostNickname}
          </span>
          <span className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200/60 shadow-sm leading-none shrink-0">
            방장
          </span>
        </div>
      </Link>
    </div>
  );
}
