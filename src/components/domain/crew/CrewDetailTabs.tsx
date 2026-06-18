'use client';

import { useState, useEffect } from 'react';
import { getCrewMembers } from '@/services/crew';
import type { CrewDetail } from '@/types/domain';
import CrewInfoTable from './CrewInfoTable';
import CrewMemberList from './CrewMemberList';
import CrewNoticeList from './CrewNoticeList';
import CrewHostProfile from './CrewHostProfile';
import CrewDurationCard from './CrewDurationCard';

const TABS = ['정보', '공지', '멤버'] as const;
type TabType = (typeof TABS)[number];

interface CrewDetailTabsProps {
  crew: CrewDetail;
  crewId: number;
}

export default function CrewDetailTabs({ crew, crewId }: CrewDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('정보');
  const [hostProfileUrl, setHostProfileUrl] = useState<string | null>(null);
  const [confirmedCount, setConfirmedCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const loadHostMember = async () => {
      setHostProfileUrl(null); // 이전 크루 데이터 클리어
      setConfirmedCount(null);
      setPendingCount(null);
      try {
        const res = await getCrewMembers(crewId, undefined, 100);
        if (!active) return;
        const items = res.data.items;
        const host = items.find((m) => m.role === 'HOST');
        setHostProfileUrl(host?.profile_image_url ?? null);

        const confirmed = items.filter((m) => m.status !== 'PENDING').length;
        const pending = items.filter((m) => m.status === 'PENDING').length;
        setConfirmedCount(confirmed);
        setPendingCount(pending);
      } catch {
        // 무시
      }
    };
    const timer = setTimeout(() => {
      void loadHostMember();
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [crewId]);

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
        {activeTab === '공지' && (
          <CrewNoticeList crewId={crewId} hostMemberUuid={crew.host_member_uuid} />
        )}
        {activeTab === '멤버' && (
          <CrewMemberList crewId={crewId} />
        )}
      </div>
    </div>
  );
}
