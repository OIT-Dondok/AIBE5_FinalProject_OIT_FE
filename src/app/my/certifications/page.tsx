"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ClipboardCheck } from "lucide-react";

import { Header } from "@/components/common/Header";
import { Skeleton } from "@/components/common/Skeleton";
import { getFeed } from "@/services/feed";
import { useAuthStore } from "@/store/authStore";
import type { AvailableCrew, CertificationStatus, FeedItem } from "@/types/domain";

const STATUS_CONFIG: Record<CertificationStatus, { label: string; className: string }> = {
  PENDING_REVIEW: { label: "검토 중", className: "bg-amber-100 text-amber-700" },
  SUCCESS: { label: "인증 완료", className: "bg-green-100 text-green-700" },
  FAILED: { label: "반려됨", className: "bg-red-100 text-red-600" },
};

function formatServerTime(isoString: string): string {
  const date = new Date(isoString);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${mm}.${dd} ${hh}:${min}`;
}

function StatusBadge({ status }: { status: CertificationStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}

function CertificationCard({ item }: { item: FeedItem }) {
  return (
    <div className="bg-card rounded-card shadow-card border border-text-secondary/10 overflow-hidden animate-feed-in">
      {item.image_url ? (
        <div className="relative w-full aspect-video bg-text-secondary/10">
          <Image
            src={item.image_url}
            alt="인증 이미지"
            fill
            sizes="(max-width: 430px) 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-full aspect-video bg-text-secondary/10 flex items-center justify-center">
          <ClipboardCheck size={40} className="text-text-secondary/30" />
        </div>
      )}
      <div className="px-4 py-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-text-secondary truncate">{item.crew_name}</span>
          <StatusBadge status={item.certification_status} />
        </div>
        <span className="text-xs text-text-secondary/70">{formatServerTime(item.server_time)}</span>
        {item.caption && (
          <p className="text-sm text-text-primary line-clamp-2 mt-0.5">{item.caption}</p>
        )}
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-card rounded-card shadow-card border border-text-secondary/10 overflow-hidden">
      <Skeleton className="w-full aspect-video" />
      <div className="px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Skeleton className="w-20 h-4 rounded" />
          <Skeleton className="w-14 h-5 rounded-full" />
        </div>
        <Skeleton className="w-24 h-3 rounded" />
      </div>
    </div>
  );
}

const ALL_CREW_ID = -1;

export default function CertificationsPage() {
  const user = useAuthStore((state) => state.user);
  const [availableCrews, setAvailableCrews] = useState<AvailableCrew[]>([]);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [selectedCrewId, setSelectedCrewId] = useState<number>(ALL_CREW_ID);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadInitial = useCallback(
    async (crewId: number) => {
      setIsLoading(true);
      setErrorMessage(null);
      setItems([]);
      setNextCursor(null);

      try {
        const { data } = await getFeed({
          crew_id: crewId === ALL_CREW_ID ? undefined : crewId,
          limit: 20,
        });

        setAvailableCrews(data.available_crews);

        // TODO: BE에서 my_only 파라미터 추가 후 member_uuid 필터링 제거 예정
        const myItems = user
          ? data.feed_items.filter((item) => item.member_uuid === user.member_uuid)
          : data.feed_items;

        setItems(myItems);
        setNextCursor(data.next_cursor);
      } catch {
        setErrorMessage("인증 이력을 불러오지 못했어요.");
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    void loadInitial(selectedCrewId);
  }, [selectedCrewId, loadInitial]);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const { data } = await getFeed({
        crew_id: selectedCrewId === ALL_CREW_ID ? undefined : selectedCrewId,
        cursor: nextCursor,
        limit: 20,
      });

      // TODO: BE에서 my_only 파라미터 추가 후 member_uuid 필터링 제거 예정
      const myItems = user
        ? data.feed_items.filter((item) => item.member_uuid === user.member_uuid)
        : data.feed_items;

      setItems((prev) => [...prev, ...myItems]);
      setNextCursor(data.next_cursor);
    } catch {
      setErrorMessage("추가 데이터를 불러오지 못했어요.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center bg-transparent">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
        <Header title="인증 이력" showBackButton />

        {/* 크루 탭 */}
        {availableCrews.length > 0 && (
          <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-sm border-b border-text-secondary/5">
            <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCrewId(ALL_CREW_ID)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  selectedCrewId === ALL_CREW_ID
                    ? "bg-primary-green text-white"
                    : "bg-card text-text-secondary border border-text-secondary/15"
                }`}
              >
                전체
              </button>
              {availableCrews.map((crew) => (
                <button
                  key={crew.crew_id}
                  type="button"
                  onClick={() => setSelectedCrewId(crew.crew_id)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    selectedCrewId === crew.crew_id
                      ? "bg-primary-green text-white"
                      : "bg-card text-text-secondary border border-text-secondary/15"
                  }`}
                >
                  {crew.crew_name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 pt-4 flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : errorMessage ? (
            <div className="mt-20 flex flex-col items-center gap-2 text-text-secondary">
              <ClipboardCheck size={40} className="opacity-30" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="mt-20 flex flex-col items-center gap-2 text-text-secondary">
              <ClipboardCheck size={40} className="opacity-30" />
              <p className="text-sm font-medium">인증 이력이 없어요</p>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <CertificationCard key={item.mission_log_id} item={item} />
              ))}
              {nextCursor && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="w-full py-3 rounded-button text-sm font-semibold text-text-secondary bg-card border border-text-secondary/15 hover:bg-text-secondary/5 active:bg-text-secondary/10 disabled:opacity-50 transition-colors"
                >
                  {isLoadingMore ? "불러오는 중..." : "더 보기"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
