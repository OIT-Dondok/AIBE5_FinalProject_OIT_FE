'use client';

import { useState } from 'react';
import type { CrewDetail } from '@/types/domain';
import CrewInfoTable from './CrewInfoTable';
import CrewMemberList from './CrewMemberList';
import CrewNoticeList from './CrewNoticeList';

const TABS = ['정보', '공지', '멤버'] as const;
type TabType = (typeof TABS)[number];

interface CrewDetailTabsProps {
  crew: CrewDetail;
  crewId: number;
}

export default function CrewDetailTabs({ crew, crewId }: CrewDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('정보');

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
            {crew.description && (
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                {crew.description}
              </p>
            )}
            <CrewInfoTable crew={crew} />
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
