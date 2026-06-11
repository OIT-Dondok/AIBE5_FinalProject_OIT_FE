'use client';

import { useState, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
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

export default function CrewMemberList({ crewId }: CrewMemberListProps) {
  const [members, setMembers] = useState<CrewMember[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchMembers = useCallback(async (cursor?: string) => {
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
    }
  }, [crewId]);

  useEffect(() => {
    setIsLoading(true);
    setAccessDenied(false);
    setHasError(false);
    setMembers([]);
    setNextCursor(null);
    fetchMembers().finally(() => setIsLoading(false));
  }, [fetchMembers]);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    await fetchMembers(nextCursor);
    setIsLoadingMore(false);
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
        <p className="text-sm text-text-secondary">멤버 목록을 불러오지 못했습니다</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <p className="text-3xl">👥</p>
        <p className="text-sm text-text-secondary">아직 멤버가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <p className="text-xs text-text-secondary mb-3">{members.length}명</p>
      <ul className="flex flex-col divide-y divide-text-secondary/10">
        {members.map((member) => (
          <li key={member.crew_participant_id} className="flex items-center gap-3 py-3">
            <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden">
              {/* TODO: BE에서 profile_image_url 포함 필요 — GET /api/crews/{crewId}/members 응답에 null로 내려옴 */}
              {member.profile_image_url ? (
                <img
                  src={member.profile_image_url}
                  alt={member.nickname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[var(--color-primary-green)]/20 flex items-center justify-center text-[var(--color-primary-green)] font-bold text-sm">
                  {member.nickname.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-text-primary truncate">
                  {member.nickname}
                </span>
                {member.role === 'HOST' && (
                  <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--color-primary-green)] text-white leading-none">
                    방장
                  </span>
                )}
              </div>
              <span className="text-xs text-text-secondary">
                {formatJoinedAt(member.joined_at)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {nextCursor && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className="mt-4 w-full py-2.5 text-sm font-semibold text-text-secondary border border-text-secondary/20 rounded-button hover:bg-text-secondary/5 transition-colors disabled:opacity-50"
        >
          {isLoadingMore ? '불러오는 중...' : '더 보기'}
        </button>
      )}
    </div>
  );
}
