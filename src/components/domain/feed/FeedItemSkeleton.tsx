/**
 * 피드 로딩 중 표시하는 스켈레톤.
 * FeedItem과 동일한 레이아웃을 회색 placeholder로 흉내내 체감 로딩 속도를 높이고
 * 데이터 도착 시 레이아웃 시프트를 방지한다.
 */
export function FeedItemSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="bg-card rounded-card overflow-hidden border border-text-secondary/10 shadow-card-elevated animate-pulse"
    >
      {/* 상단: 프로필 + 닉네임/메타 + 상태 뱃지 */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-text-secondary/10 flex-shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3.5 w-24 rounded bg-text-secondary/10" />
          <div className="h-2.5 w-40 rounded bg-text-secondary/10" />
        </div>
        <div className="h-6 w-12 rounded-full bg-text-secondary/10 flex-shrink-0" />
      </div>

      {/* 이미지 영역 */}
      <div className="w-full aspect-[4/3] bg-text-secondary/10" />

      {/* 캡션 */}
      <div className="px-4 pt-3.5 space-y-2">
        <div className="h-3 w-full rounded bg-text-secondary/10" />
        <div className="h-3 w-2/3 rounded bg-text-secondary/10" />
      </div>

      {/* 리액션 바 */}
      <div className="px-4 py-3.5 flex items-center gap-1.5">
        <div className="h-6 w-12 rounded-full bg-text-secondary/10" />
        <div className="h-6 w-12 rounded-full bg-text-secondary/10" />
        <div className="h-6 w-16 rounded-full bg-text-secondary/10" />
      </div>
    </article>
  );
}

interface FeedSkeletonListProps {
  /** 렌더할 스켈레톤 카드 개수 */
  count?: number;
}

/** 스켈레톤 카드를 여러 개 묶어 보여주는 리스트 */
export function FeedSkeletonList({ count = 3 }: FeedSkeletonListProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <FeedItemSkeleton key={i} />
      ))}
    </>
  );
}