'use client';

import { useState, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
import { UserRound, Crown } from 'lucide-react';
import Link from 'next/link';
import { getCrewMembers } from '@/services/crew';
import type { CrewMember } from '@/types/domain';
import type { ErrorResponse } from '@/types/common';

interface CrewMemberListProps {
  crewId: number;
}

const formatJoinedAt = (isoString: string) => {
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
};

function MemberAvatar({ member }: { member: CrewMember }) {
  const [imgError, setImgError] = useState(false);
  const isHost = member.role === 'HOST';
  const showImage = member.profile_image_url && !imgError;

  return (
    <div className="relative shrink-0">
      {isHost && (
        <Crown
          size={13}
          className="absolute -top-2.5 -left-1 text-amber-500 fill-amber-300 drop-shadow-md rotate-[-20deg] z-10 animate-bounce"
          style={{ animationDuration: '3.5s' }}
        />
      )}
      <div
        className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center ${
          isHost
            ? 'border border-yellow-300 ring-2 ring-yellow-400/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
            : ''
        }`}
      >
        {showImage ? (
          <img
            src={member.profile_image_url!}
            alt={member.nickname}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
            <UserRound size={22} className="text-neutral-400" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function CrewMemberList({ crewId }: CrewMemberListProps) {
  const [members, setMembers] = useState<CrewMember[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchMembers = useCallback(async (cursor?: string) => {
    if (!cursor) {
      setIsLoading(true);
      setAccessDenied(false);
      setHasError(false);
      setMembers([]);
      setNextCursor(null);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const res = await getCrewMembers(crewId, cursor);
      const { items, next_cursor } = res.data;
      setMembers((prev) => (cursor ? [...prev, ...items] : items));
      setNextCursor(next_cursor);
    } catch (err) {
      if (isAxiosError<ErrorResponse>(err) && err.response?.data?.code === 'CREW_ACCESS_DENIED') {
        setAccessDenied(true);
      } else {
        setHasError(true);
      }
    } finally {
      if (!cursor) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [crewId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchMembers();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchMembers]);

  const handleLoadMore = () => {
    if (!nextCursor || isLoadingMore) return;
    void fetchMembers(nextCursor);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-text-secondary/10 animate-pulse shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-3.5 w-1/3 bg-text-secondary/10 rounded-full animate-pulse" />
              <div className="h-3 w-1/4 bg-text-secondary/10 rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <p className="text-3xl">🔒</p>
        <p className="text-sm font-semibold text-text-primary">크루 멤버만 볼 수 있습니다</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <p className="text-3xl">⚠️</p>
        <p className="text-sm font-semibold text-text-primary/80">멤버 목록을 불러오지 못했습니다</p>
      </div>
    );
  }

  const activeMembers = members.filter(
    (member) => member.status !== 'PENDING'
  );

  if (activeMembers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <p className="text-3xl">👥</p>
        <p className="text-sm font-semibold text-text-primary/80">아직 멤버가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <p className="text-xs font-bold text-text-primary/80 mb-3">{activeMembers.length}명</p>
      <ul className="flex flex-col divide-y divide-text-secondary/10">
        {activeMembers.map((member) => (
          <li key={member.crew_participant_id}>
            <Link
              href={`/members/${member.member_uuid}`}
              className="flex items-center gap-3 py-3 hover:bg-text-secondary/5 active:bg-text-secondary/10 transition-colors rounded-xl -mx-1 px-1"
            >
              <MemberAvatar member={member} />

              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-sm truncate ${
                      member.role === 'HOST'
                        ? 'font-bold text-text-primary'
                        : 'font-semibold text-text-primary'
                    }`}
                  >
                    {member.nickname}
                  </span>
                  {member.role === 'HOST' ? (
                    <span className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200/60 shadow-sm leading-none shrink-0">
                      방장
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-green-50 to-emerald-100/60 text-green-900 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-200/60 shadow-sm leading-none shrink-0">
                      크루원
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-text-primary/70">
                  {formatJoinedAt(member.joined_at)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {nextCursor && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className="mt-4 w-full py-2.5 text-sm font-bold text-text-primary/80 border border-text-primary/20 rounded-button hover:bg-text-secondary/5 transition-colors disabled:opacity-50"
        >
          {isLoadingMore ? '불러오는 중...' : '더 보기'}
        </button>
      )}
    </div>
  );
}
