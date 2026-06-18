'use client';

import { useRouter } from 'next/navigation';
import { MessageSquare, ChevronRight, AlertCircle } from 'lucide-react';
import type { CrewNotice, AvailableCrew } from '@/types/domain';
import { formatServerTime, getCrewBrandingColor } from '@/components/domain/feed/feedItemMeta';

interface FeedNoticeListProps {
  crewId: number;
  notices: CrewNotice[];
  isLoading: boolean;
  crewName?: string;
  availableCrews?: AvailableCrew[];
}

// 개별 공지사항 카드 (프리미엄 리디자인)
export function NoticeCard({
  crewId,
  notice,
  crewName,
}: {
  crewId?: number;
  notice: CrewNotice;
  crewName?: string;
}) {
  const router = useRouter();

  const handleGoToDetail = () => {
    const targetCrewId = crewId ?? notice.crew_id;
    router.push(`/crews/${targetCrewId}/notices/${notice.notice_id}`);
  };

  return (
    <article
      onClick={handleGoToDetail}
      className="group relative overflow-hidden rounded-card border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex flex-col bg-card border-text-secondary/10 hover:border-text-secondary/20"
    >
      {/* 1. 상단 풀위드 강조 띠 (Accent Bar) */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-2 border-b bg-text-secondary/5 border-text-secondary/5 text-text-secondary">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[10px] font-bold shrink-0 bg-text-secondary/20 text-text-primary px-1.5 py-0.5 rounded-md">
            📢 공지
          </span>
          {crewName && (
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black border tracking-tight shrink-0 transition-colors ${getCrewBrandingColor(notice.crew_id).bgClass} ${getCrewBrandingColor(notice.crew_id).textClass} ${getCrewBrandingColor(notice.crew_id).borderClass}`}>
              {crewName}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold opacity-70 shrink-0">
          {formatServerTime(notice.created_at)}
        </span>
      </div>

      {/* 2. 본문 영역 */}
      <div className="flex flex-col p-4 pb-3 gap-2 flex-1">
        {/* 제목 강조 */}
        <h3 className="text-[15px] font-extrabold text-text-primary leading-snug group-hover:text-primary-green transition-colors">
          {notice.title}
        </h3>
        
        {/* 본문 프레임 상자 */}
        <p className="text-[12.5px] font-medium text-text-secondary/90 leading-relaxed whitespace-pre-wrap break-all line-clamp-3 bg-card/65 dark:bg-card/40 p-3 rounded-xl border border-text-secondary/5">
          {notice.content}
        </p>
      </div>

      {/* 3. 하단 액션바 */}
      <div className="mt-auto border-t border-text-secondary/5 px-4 py-3 flex items-center justify-between flex-wrap gap-2 bg-text-secondary/[0.01]">
        {/* 왼쪽: 이모지 리액션 목록 & 댓글 아이콘 */}
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(notice.reaction_counts || {})
            .filter(([, count]) => count > 0)
            .map(([emoji, count]) => {
              const isReacted = notice.my_reactions?.includes(emoji);
              return (
                <span
                  key={emoji}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border transition-colors ${
                    isReacted
                      ? 'bg-primary-green/10 border-primary-green/20 text-text-primary font-bold'
                      : 'bg-transparent border-text-secondary/15 text-text-primary/80 font-semibold'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{count}</span>
                </span>
              );
            })}
          <div className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors shrink-0">
            <MessageSquare size={13.5} className="opacity-70" />
            <span className="text-[11px] font-bold opacity-80">댓글 작성</span>
          </div>
        </div>

        {/* 오른쪽: 상세 보기 버튼화 */}
        <div className="inline-flex items-center gap-0.5 text-[11px] font-bold text-primary-green group-hover:underline shrink-0 ml-auto">
          <span>상세 보기</span>
          <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </article>
  );
}

export default function FeedNoticeList({
  crewId,
  notices,
  isLoading,
  crewName,
  availableCrews,
}: FeedNoticeListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-card p-5 border border-text-secondary/10 flex flex-col gap-3 shadow-[var(--shadow-card)] animate-pulse"
          >
            <div className="h-5 w-1/3 bg-text-secondary/10 rounded-full" />
            <div className="h-3.5 w-full bg-text-secondary/10 rounded-full" />
            <div className="h-3.5 w-4/5 bg-text-secondary/10 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (notices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 bg-text-secondary/[0.02] border border-dashed border-text-secondary/15 rounded-card">
        <AlertCircle size={28} className="text-text-secondary/50" />
        <p className="text-xs font-bold text-text-secondary">등록된 공지사항이 없습니다</p>
      </div>
    );
  }

  // 최신 시간순(내림차순) 정렬
  const sortedNotices = [...notices].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="flex flex-col gap-4">
      {/* 리스트 개수 요약 바 */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-text-secondary">
          총 {sortedNotices.length}개의 공지
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {sortedNotices.map((notice) => {
          const resolvedCrewName =
            crewName ?? availableCrews?.find((c) => c.crew_id === notice.crew_id)?.crew_name;
          return (
            <NoticeCard
              key={notice.notice_id}
              crewId={crewId === 0 ? notice.crew_id : crewId}
              notice={notice}
              crewName={resolvedCrewName}
            />
          );
        })}
      </div>
    </div>
  );
}
