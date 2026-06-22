'use client';
1
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, CheckCircle2, CircleAlert, Sparkles, Camera } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';
import CrewCard from '@/components/domain/crew/CrewCard';
import CrewFilterBar, { CategoryFilter } from '@/components/domain/crew/CrewFilterBar';
import StatusDropdown from '@/components/domain/crew/StatusDropdown';
import { getCrews, getMyCrew } from '@/services/crew';
import { getFeed } from '@/services/feed';
import { useAuthStore } from '@/store/authStore';
import { getKstTodayYmd } from '@/utils/date';
import type { CrewListItem, CrewStatus, MyCrew } from '@/types/domain';

type StatusFilter = CrewStatus | 'ALL';

import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';

interface VerificationStatusItem {
  crewId: number;
  title: string;
  category: string;
  isCertified: boolean;
}

function TodayVerificationStatus() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [activeCrews, setActiveCrews] = useState<VerificationStatusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const loadTodayStatus = async () => {
      setLoading(true);
      try {
        const myCrewsRes = await getMyCrew('ALL');
        const runningCrews = myCrewsRes.data.items.filter(
          (c) => c.my_status === 'LOCKED' && c.status === 'ACTIVE'
        );

        if (runningCrews.length === 0) {
          if (active) setActiveCrews([]);
          return;
        }

        const todayStr = getKstTodayYmd();
        const allFeedItems = [];
        let cursor: string | undefined;
        let hasMore = true;

        while (hasMore) {
          const feedRes = await getFeed({
            from: todayStr,
            to: todayStr,
            limit: 50,
            cursor,
          });

          allFeedItems.push(...feedRes.data.feed_items);

          if (feedRes.data.next_cursor) {
            cursor = feedRes.data.next_cursor;
          } else {
            hasMore = false;
          }
        }

        const myFeedItems = allFeedItems.filter(
          (item) => item.member_uuid === user.member_uuid
        );

        const statusItems: VerificationStatusItem[] = runningCrews.map((crew) => {
          const hasCertified = myFeedItems.some((item) => item.crew_id === crew.crew_id);
          return {
            crewId: crew.crew_id,
            title: crew.title,
            category: crew.category,
            isCertified: hasCertified,
          };
        });

        if (active) {
          setActiveCrews(statusItems);
        }
      } catch (error) {
        console.error('Failed to load today verification status:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadTodayStatus();
    return () => {
      active = false;
    };
  }, [user]);

  if (!user || activeCrews.length === 0) return null;

  const totalCount = activeCrews.length;
  const certifiedCount = activeCrews.filter((c) => c.isCertified).length;
  const progressPercent = Math.round((certifiedCount / totalCount) * 100);
  const isAllCertified = certifiedCount === totalCount;
  const remainingCount = totalCount - certifiedCount;

  return (
    <div className="px-5 py-2">
      <div
        onClick={() => {
          if (!isAllCertified) {
            setIsExpanded((prev) => !prev);
          } else {
            router.push('/feed');
          }
        }}
        className={`w-full p-4 rounded-[24px] border shadow-[0_4px_16px_rgba(0,0,0,0.03)] cursor-pointer transition-all duration-300 flex flex-col gap-3.5 select-none active:scale-[0.99] ${
          isAllCertified
            ? 'bg-gradient-to-br from-emerald-500 to-green-600 border-primary-green/20 text-white shadow-emerald-500/10'
            : 'bg-card border-text-secondary/10 text-text-primary'
        }`}
      >
        {/* 헤더 및 요약 배지 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isAllCertified ? (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white animate-bounce">
                <Trophy size={16} fill="white" />
              </span>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 animate-pulse">
                <Sparkles size={16} className="fill-amber-500/10" />
              </span>
            )}
            <div className="flex flex-col">
              <span className={`text-xs font-black tracking-tight ${isAllCertified ? 'text-white/80' : 'text-text-secondary'}`}>
                {isAllCertified ? '오늘의 챌린지' : '오늘의 인증 현황'}
              </span>
              <strong className="text-[14px] font-black tracking-tight -mt-0.5">
                {isAllCertified
                  ? '오늘의 미션을 모두 완수했어요! 🎉'
                  : `인증률 ${progressPercent}% (${certifiedCount}/${totalCount})`}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!isAllCertified ? (
              <>
                <span className="bg-amber-500/10 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/20">
                  {remainingCount}개 남음 ⚡
                </span>
                {isExpanded ? <ChevronUp size={16} className="text-text-secondary/70" /> : <ChevronDown size={16} className="text-text-secondary/70" />}
              </>
            ) : (
              <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                완료
              </span>
            )}
          </div>
        </div>

        {/* 인터랙티브 게이지 바 */}
        <div className="w-full flex flex-col gap-1">
          <div className={`w-full h-3 rounded-full overflow-hidden ${isAllCertified ? 'bg-white/20' : 'bg-text-secondary/10'}`}>
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isAllCertified ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-amber-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 펼쳐지는 크루 서랍 (아코디언) */}
      {!isAllCertified && isExpanded && (
        <div className="mt-2.5 flex flex-col gap-2 bg-text-secondary/5 p-3 rounded-[24px] border border-text-secondary/5 animate-dropdown-open">
          <p className="text-[10px] font-extrabold text-text-secondary/60 tracking-wider uppercase px-1">인증이 필요한 크루</p>
          <div className="flex flex-col gap-2">
            {activeCrews.map((crew) => (
              <div
                key={crew.crewId}
                onClick={() => {
                  if (crew.isCertified) {
                    router.push('/feed');
                  } else {
                    router.push(`/crews/${crew.crewId}/certify`);
                  }
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-[20px] border transition-all cursor-pointer bg-card ${
                  crew.isCertified
                    ? 'border-primary-green/10 text-text-secondary bg-success-green/10'
                    : 'border-text-secondary/10 text-text-primary hover:border-primary-green/30 hover:bg-success-green/5 active:scale-[0.99]'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate leading-tight">{crew.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {crew.isCertified ? (
                    <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-800 border border-emerald-500/25 px-2.5 py-1 rounded-full text-[10px] font-bold">
                      <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                      완료
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 bg-primary-green text-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm shadow-primary-green/20 hover:opacity-95 transition-opacity">
                      <Camera size={12} strokeWidth={2.5} />
                      인증하기
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type GroupedCrews = {
  RECRUITING: CrewListItem[];
  ACTIVE: CrewListItem[];
  CLOSED: CrewListItem[];
};

const SECTION_ORDER: (keyof GroupedCrews)[] = ['RECRUITING', 'ACTIVE', 'CLOSED'];

const SECTION_CONFIG: Record<keyof GroupedCrews, { label: string; badgeClass: string }> = {
  RECRUITING: { label: '모집중', badgeClass: 'bg-blue-500/10 text-blue-600 border border-blue-500/25 px-2 py-0.5 rounded-full' },
  ACTIVE: { label: '진행중', badgeClass: 'bg-primary-green/10 text-primary-green border border-primary-green/25 px-2 py-0.5 rounded-full' },
  CLOSED: { label: '종료됨', badgeClass: 'bg-slate-500/10 text-slate-500 border border-slate-500/25 px-2 py-0.5 rounded-full' },
};

export default function CrewsPage() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('ALL');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [crews, setCrews] = useState<CrewListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [groupedCrews, setGroupedCrews] = useState<GroupedCrews | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const commonParams = {
      category: activeCategory !== 'ALL' ? activeCategory : undefined,
      keyword: searchQuery.trim() || undefined,
    };

    const fetchCrews = async () => {
      setIsLoading(true);
      try {
        if (activeStatus === 'ALL') {
          const [recruiting, active, closed] = await Promise.all([
            getCrews({ ...commonParams, status: 'RECRUITING' }),
            getCrews({ ...commonParams, status: 'ACTIVE' }),
            getCrews({ ...commonParams, status: 'CLOSED' }),
          ]);
          setGroupedCrews({
            RECRUITING: recruiting.data.items,
            ACTIVE: active.data.items,
            CLOSED: closed.data.items,
          });
          setCrews([]);
          setNextCursor(null);
        } else {
          const res = await getCrews({ ...commonParams, status: activeStatus });
          setCrews(res.data.items);
          setNextCursor(res.data.next_cursor);
          setGroupedCrews(null);
        }
      } catch {
        setCrews([]);
        setNextCursor(null);
        setGroupedCrews(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrews();
  }, [activeStatus, activeCategory, searchQuery]);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoading || activeStatus === 'ALL') return;
    setIsLoading(true);
    try {
      const res = await getCrews({
        status: activeStatus,
        category: activeCategory !== 'ALL' ? activeCategory : undefined,
        keyword: searchQuery.trim() || undefined,
        cursor: nextCursor,
      });
      setCrews((prev) => [...prev, ...res.data.items]);
      setNextCursor(res.data.next_cursor);
    } catch {
      // axios interceptor handles errors
    } finally {
      setIsLoading(false);
    }
  };

  const totalCount =
    activeStatus === 'ALL' && groupedCrews
      ? groupedCrews.RECRUITING.length + groupedCrews.ACTIVE.length + groupedCrews.CLOSED.length
      : crews.length;

  return (
    <>
      <Header showLogo={true} />

      <div className="w-full max-w-[430px] mx-auto flex flex-col">
        {/* 카테고리 탭 (둥근 파스텔 칩 스타일) */}
        <CrewFilterBar activeCategory={activeCategory} onChangeCategory={setActiveCategory} />

        {/* 검색바 */}
        <div className="px-5 pt-1 pb-3">
          <div className="relative flex items-center group/search">
            <Search
              size={15}
              strokeWidth={2.5}
              className="absolute left-4 text-text-secondary/40 group-focus-within/search:text-primary-green transition-colors duration-200 pointer-events-none"
            />
            <input
              type="text"
              placeholder="찾고 있는 크루 이름이 있나요?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 text-sm bg-card text-text-primary rounded-full border border-text-secondary/10 shadow-sm focus:border-primary-green focus:ring-4 focus:ring-primary-green/5 focus:outline-none placeholder:text-text-secondary/30 transition-all duration-200"
            />
          </div>
        </div>

        {/* 오늘의 크루 인증 상태 대시보드 */}
        <TodayVerificationStatus />

        {/* 결과 카운트 + 상태 드롭다운 */}
        <div className="px-5 pt-3 pb-3 flex items-center justify-between">
          <span className="text-xs text-text-secondary font-medium">
            총 <span className="font-extrabold text-text-primary bg-text-secondary/10 px-2 py-0.5 rounded-full">{totalCount}</span>개의 크루
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/my/crews"
              className="text-xs font-bold text-primary-green bg-primary-green/10 border border-primary-green/30 px-3 py-1.5 rounded-full hover:bg-primary-green/15 active:scale-95 transition-all duration-200"
            >
              내 크루 보러가기 🏃
            </Link>
            <StatusDropdown value={activeStatus} onChange={setActiveStatus} />
          </div>
        </div>

        {/* 크루 카드 리스트 */}
        <div className="flex flex-col gap-3 px-5 pb-10">
          {isLoading ? (
            <p className="py-10 text-center text-sm text-text-secondary">불러오는 중...</p>
          ) : activeStatus === 'ALL' && groupedCrews ? (
            totalCount === 0 ? (
              <EmptyState
                icon="🔍"
                title="조건에 맞는 크루가 없어요"
                description="다른 필터를 선택하거나 검색어를 바꿔보세요"
              />
            ) : (
              SECTION_ORDER.filter((key) => groupedCrews[key].length > 0).map((key) => {
                const { label, badgeClass } = SECTION_CONFIG[key];
                const items = groupedCrews[key];
                return (
                  <div key={key} className="flex flex-col gap-3.5 mt-4 first:mt-1">
                    <div className="flex items-center gap-2 pb-1">
                      <span className={`text-[11px] font-bold ${badgeClass}`}>
                        {label}
                      </span>
                      <span className="text-xs text-text-secondary">{items.length}개</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {items.map((crew) => (
                        <Link key={crew.crew_id} href={`/crews/${crew.crew_id}`}>
                          <CrewCard crew={crew} />
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })
            )
          ) : crews.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="조건에 맞는 크루가 없어요"
              description="다른 필터를 선택하거나 검색어를 바꿔보세요"
            />
          ) : (
            crews.map((crew) => (
              <Link key={crew.crew_id} href={`/crews/${crew.crew_id}`}>
                <CrewCard crew={crew} />
              </Link>
            ))
          )}

          {activeStatus !== 'ALL' && nextCursor && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoading}
              className="w-full py-3 text-sm font-semibold text-primary-green border border-primary-green/30 rounded-2xl hover:bg-primary-green/5 transition-colors disabled:opacity-50"
            >
              {isLoading ? '로딩 중...' : '더 보기'}
            </button>
          )}
        </div>
      </div>

      {/* 플로팅 크루 생성 버튼 */}
      <button
        type="button"
        aria-label="크루 생성"
        onClick={() => router.push('/crews/new')}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-primary-green flex items-center justify-center text-white shadow-xl shadow-primary-green/40 hover:opacity-90 active:scale-95 transition-all z-40"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
    </>
  );
}
