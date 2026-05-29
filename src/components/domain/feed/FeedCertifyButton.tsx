"use client";

import { useState } from 'react';
import { Camera, X } from 'lucide-react';

import { Modal } from '@/components/common/Modal';
import type { CrewCategory } from '@/mocks/data/crews';
import type { MyCrewItem } from '@/mocks/data/feed';

const CATEGORY_EMOJI: Record<CrewCategory, string> = {
  MORNING: '🌅',
  READING: '📚',
  EXERCISE: '💪',
  STUDY: '📝',
  DIET: '🥗',
  MIND: '🧘',
  HEALTH: '❤️',
};

interface FeedCertifyButtonProps {
  selectedCrewId: number | null;
  crews: MyCrewItem[];
}

export function FeedCertifyButton({ selectedCrewId, crews }: FeedCertifyButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFloatingClick = () => {
    if (selectedCrewId !== null) {
      // TODO: router.push(`/mission/today?crewId=${selectedCrewId}`)
      alert('인증 페이지 준비 중입니다');
    } else {
      setIsModalOpen(true);
    }
  };

  const handleCrewSelect = (_crewId: number) => {
    setIsModalOpen(false);
    // TODO: router.push(`/mission/today?crewId=${_crewId}`)
    alert('인증 페이지 준비 중입니다');
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        type="button"
        aria-label="인증하기"
        onClick={handleFloatingClick}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-primary-green flex items-center justify-center text-white shadow-xl shadow-primary-green/40 hover:opacity-90 active:scale-95 transition-all z-40"
      >
        <Camera size={24} strokeWidth={2.5} />
      </button>

      {/* 크루 선택 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ariaLabel="크루 선택"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-base font-bold text-text-primary">어느 크루에 인증할까요?</h2>
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setIsModalOpen(false)}
            className="p-1.5 -mr-1 rounded-full text-text-secondary hover:text-text-primary hover:bg-text-secondary/10 active:scale-95 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* 크루 목록 */}
        <ul className="px-4 pb-5 flex flex-col gap-1.5">
          {crews.map((crew) => (
            <li key={crew.crew_id}>
              <button
                type="button"
                onClick={() => handleCrewSelect(crew.crew_id)}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-background hover:bg-primary-green/8 active:scale-[0.99] transition-all"
              >
                <span className="text-2xl leading-none">{CATEGORY_EMOJI[crew.category]}</span>
                <span className="text-sm font-semibold text-text-primary">{crew.crew_title}</span>
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
