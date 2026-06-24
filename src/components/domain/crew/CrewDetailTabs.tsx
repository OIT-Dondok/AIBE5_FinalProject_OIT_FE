'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { getCrewMembers, getCrewApplications } from '@/services/crew';
import { getMemberProfile } from '@/services/member';
import type { CrewDetail } from '@/types/domain';
import { useAuthStore } from '@/store/authStore';
import CrewInfoTable from './CrewInfoTable';
import CrewMemberList from './CrewMemberList';
import CrewHostProfile from './CrewHostProfile';
import CrewDurationCard from './CrewDurationCard';

const TABS = ['정보', '멤버'] as const;
type TabType = (typeof TABS)[number];

interface CrewDetailTabsProps {
  crew: CrewDetail;
  crewId: number;
  onConfirmedCountLoaded?: (count: number | null) => void;
}

export default function CrewDetailTabs({ crew, crewId, onConfirmedCountLoaded }: CrewDetailTabsProps) {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<TabType>('정보');
  const [hostProfileUrl, setHostProfileUrl] = useState<string | null>(null);
  const [confirmedCount, setConfirmedCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const loadHostMember = async () => {
      setHostProfileUrl(null); // 이전 크루 데이터 클리어
      setConfirmedCount(null);
      onConfirmedCountLoaded?.(null);
      setPendingCount(null);
      try {
        // 1. LOCKED 참여 멤버 목록 조회
        const res = await getCrewMembers(crewId, undefined, 100);
        if (!active) return;
        const items = res.data.items;
        const host = items.find((m) => m.role === 'HOST');
        setHostProfileUrl(host?.profile_image_url ?? null);
        setConfirmedCount(items.length);
        onConfirmedCountLoaded?.(items.length);

        // 2. 현재 로그인된 유저가 방장(HOST)인 경우에만 승인 대기자(PENDING) 조회
        const isHost = user?.member_uuid === crew.host_member_uuid;
        if (isHost) {
          try {
            const appRes = await getCrewApplications(crewId, { status: 'PENDING' });
            if (!active) return;
            setPendingCount(appRes.data.items.length);
          } catch {
            // 승인 대기자 수 조회 실패는 화면을 막지 않으므로 표시만 생략한다.
            setPendingCount(null);
          }
        } else {
          setPendingCount(null);
        }
      } catch {
        // 멤버 목록 403 차단 시 (미가입 유저 등), 공개 프로필 API로 방장 프로필 이미지 보완
        try {
          const memberProfileRes = await getMemberProfile(crew.host_member_uuid);
          if (active) {
            setHostProfileUrl(memberProfileRes.data.profile_image_url ?? null);
          }
        } catch {
          if (active) {
            setHostProfileUrl(null);
          }
        }
        onConfirmedCountLoaded?.(null);
      }
    };
    const timer = setTimeout(() => {
      void loadHostMember();
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [crewId, crew.host_member_uuid, user?.member_uuid, onConfirmedCountLoaded]);

  return (
    <div className="flex flex-col">
      <div className="flex border-b border-text-secondary/15">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab
                ? 'text-primary-green border-b-2 border-primary-green -mb-px'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-5 py-4">
        {activeTab === '정보' && (
          <div className="flex flex-col gap-4">
            {/* 정산 완료 시 정산 상세 진입 CTA (대시보드에서 이동) */}
            {crew.settlement_status === 'SUCCEEDED' && (
              <Link
                href={`/crews/${crewId}/settlement`}
                className="flex items-start gap-2.5 rounded-2xl border border-primary-blue/20 bg-primary-blue/5 px-4 py-3 transition-colors hover:bg-primary-blue/10 active:scale-[0.99]"
              >
                <Info size={16} className="mt-0.5 shrink-0 text-primary-blue" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-medium leading-relaxed text-text-secondary">
                    최종 정산이 완료됐어요. 정산 상세에서 확정 결과를 확인하세요.
                  </span>
                  <span className="mt-1.5 inline-flex text-[12px] font-black text-primary-blue">
                    정산 상세 보기 →
                  </span>
                </span>
              </Link>
            )}
            <CrewHostProfile
              key={hostProfileUrl ?? 'no-avatar'}
              description={crew.description}
              hostNickname={crew.host_nickname}
              hostMemberUuid={crew.host_member_uuid}
              hostProfileUrl={hostProfileUrl}
            />

            <CrewDurationCard
              startAt={crew.start_at}
              endAt={crew.end_at}
            />

            <CrewInfoTable
              crew={crew}
              confirmedCount={confirmedCount}
              pendingCount={pendingCount}
            />
          </div>
        )}
        {activeTab === '멤버' && (
          <CrewMemberList crewId={crewId} />
        )}
      </div>
    </div>
  );
}
