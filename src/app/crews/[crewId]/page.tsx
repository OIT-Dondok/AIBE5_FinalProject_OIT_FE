import { notFound } from 'next/navigation';
import { isAxiosError } from 'axios';
import { MoreHorizontal } from 'lucide-react';
import { Header } from '@/components/common/Header';
import CrewDetailTabs from '@/components/domain/crew/CrewDetailTabs';
import CrewJoinButton from '@/components/domain/crew/CrewJoinButton';
import { getCrew } from '@/services/crew';
import type { CrewDetail } from '@/types/domain';
import type { ErrorResponse } from '@/types/common';
import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  CATEGORY_BG,
  SETTLEMENT_TYPE_LABEL,
} from '@/constants/crew';

interface PageProps {
  params: Promise<{ crewId: string }>;
}

export default async function CrewDetailPage({ params }: PageProps) {
  const { crewId } = await params;
  const crewIdNum = Number(crewId);

  let crew: CrewDetail;
  try {
    const res = await getCrew(crewIdNum);
    crew = res.data;
  } catch (err) {
    if (isAxiosError<ErrorResponse>(err) && err.response?.data?.code === 'CREW_NOT_FOUND') {
      notFound();
    }
    throw err;
  }

  const emoji = CATEGORY_EMOJI[crew.category] ?? '📌';
  const categoryDisplay = CATEGORY_LABEL[crew.category] ?? crew.category;
  const categoryBg = CATEGORY_BG[crew.category] ?? 'bg-gray-100';

  return (
    <>
      <Header
        showBackButton
        title={crew.title}
        rightElement={
          <button
            type="button"
            aria-label="더보기"
            className="p-1 -mr-1 hover:opacity-75 active:scale-95 transition-all"
          >
            <MoreHorizontal size={22} className="text-text-primary" />
          </button>
        }
      />

      <div className="w-full max-w-[430px] mx-auto pb-32">
        <div className="w-full h-52 overflow-hidden">
          {crew.image_url ? (
            <img
              src={crew.image_url}
              alt={crew.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${categoryBg}`}>
              <span className="text-8xl">{emoji}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-5 pt-4 pb-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-green/10 text-primary-green text-xs font-semibold">
            {categoryDisplay}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-text-secondary/10 text-text-secondary text-xs font-semibold">
            {crew.daily_settlement_type} · {SETTLEMENT_TYPE_LABEL[crew.daily_settlement_type]}
          </span>
        </div>

        <CrewDetailTabs crew={crew} />
      </div>

      <div className="fixed bottom-24 left-0 right-0 z-30 flex justify-center px-5">
        <div className="w-full max-w-[430px]">
          <CrewJoinButton
            depositAmount={crew.deposit_amount}
            myParticipation={crew.my_participation}
          />
        </div>
      </div>
    </>
  );
}
