'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronRight } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { CATEGORY_EMOJI, CATEGORY_LABEL } from '@/constants/crew';
import type { MyCrew } from '@/types/domain';

interface NoticeCrewSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostCrews: MyCrew[];
  onSelect: (crewId: number) => void;
}

export function NoticeCrewSelectModal({
  isOpen,
  onClose,
  hostCrews,
  onSelect,
}: NoticeCrewSelectModalProps) {
  const [sortedCrews, setSortedCrews] = useState<MyCrew[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    try {
      const stored = localStorage.getItem('frequent_notice_crew_ids');
      const frequentIds: number[] = stored ? JSON.parse(stored) : [];

      const sorted = [...hostCrews].sort((a, b) => {
        const indexA = frequentIds.indexOf(a.crew_id);
        const indexB = frequentIds.indexOf(b.crew_id);

        // 둘 다 자주 쓰는 목록에 있는 경우
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB; // 최근에 쓴 것(배열의 앞에 위치함)이 우선
        }
        // 한쪽만 자주 쓰는 목록에 있는 경우
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        // 둘 다 자주 쓰는 목록에 없는 경우 크루 ID 내림차순(최신 크루 우선)
        return b.crew_id - a.crew_id;
      });

      setSortedCrews(sorted);
    } catch {
      setSortedCrews(hostCrews);
    }
  }, [isOpen, hostCrews]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="공지 작성할 크루 선택">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-text-primary">공지 작성할 크루 선택</h2>
            <p className="text-xs text-text-secondary mt-0.5">공지를 올릴 크루를 선택해 주세요</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 -mr-1 hover:opacity-70 transition-opacity cursor-pointer"
            aria-label="닫기"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        {sortedCrews.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">내가 방장인 진행 중인 크루가 없어요</p>
        ) : (
          <ul className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            {sortedCrews.map((crew) => {
              const emoji = CATEGORY_EMOJI[crew.category] ?? '📌';
              const label = CATEGORY_LABEL[crew.category]?.replace(/^\S+\s/, '') ?? '기타';
              
              // 자주 쓰는 탭 배지 표시 여부 검사
              const stored = typeof window !== 'undefined' ? localStorage.getItem('frequent_notice_crew_ids') : null;
              const frequentIds: number[] = stored ? JSON.parse(stored) : [];
              const isFrequent = frequentIds.includes(crew.crew_id);

              return (
                <li key={crew.crew_id}>
                  <button
                    type="button"
                    onClick={() => onSelect(crew.crew_id)}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-background/60 border border-text-secondary/10 hover:bg-[#E0E8FA]/50 hover:border-[#4C73D9]/20 active:scale-[0.98] transition-all text-left cursor-pointer"
                  >
                    {crew.image_url ? (
                      <Image
                        src={crew.image_url}
                        alt={crew.title}
                        width={40}
                        height={40}
                        className="rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <span className="w-10 h-10 rounded-lg bg-text-secondary/5 flex items-center justify-center text-xl shrink-0">
                        {emoji}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-text-primary truncate">{crew.title}</p>
                        {isFrequent && (
                          <span className="text-[9px] font-bold bg-[#E0E8FA] text-[#4D73D9] px-1 rounded">
                            자주 올림
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">{label}</p>
                    </div>
                    <ChevronRight size={16} className="text-text-secondary/50 shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
