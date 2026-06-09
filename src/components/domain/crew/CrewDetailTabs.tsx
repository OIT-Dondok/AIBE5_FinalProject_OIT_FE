'use client';

import { useState } from 'react';
import type { CrewDetail } from '@/types/domain';
import CrewInfoTable from './CrewInfoTable';
import { EmptyState } from '@/components/common/EmptyState';

const TABS = ['정보', '공지', '멤버'] as const;
type TabType = (typeof TABS)[number];

interface CrewDetailTabsProps {
  crew: CrewDetail;
}

export default function CrewDetailTabs({ crew }: CrewDetailTabsProps) {
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
          <EmptyState
            icon="📢"
            title="공지사항이 없어요"
            description="방장이 공지를 올리면 여기에 표시됩니다"
          />
        )}
        {activeTab === '멤버' && (
          <EmptyState
            icon="👥"
            title="멤버 목록 준비 중"
            description="멤버 목록 기능이 곧 추가됩니다"
          />
        )}
      </div>
    </div>
  );
}
