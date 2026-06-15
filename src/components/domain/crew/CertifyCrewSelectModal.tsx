'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { X, ChevronRight } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Skeleton } from '@/components/common/Skeleton';
import { getMyLockedCrews } from '@/services/crew';
import { CATEGORY_EMOJI, CATEGORY_LABEL } from '@/constants/crew';
import type { MyCrew } from '@/types/domain';

interface CertifyCrewSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CertifyCrewSelectModal({ isOpen, onClose }: CertifyCrewSelectModalProps) {
  const router = useRouter();
  const [crews, setCrews] = useState<MyCrew[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    // retryKey 변경 시 재실행

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setIsLoading(true);
    setCrews([]);
    setIsError(false);

    getMyLockedCrews(ac.signal)
      .then((items) => {
        setCrews(items.filter((c) => c.status === 'ACTIVE'));
      })
      .catch((err: unknown) => {
        if (isAxiosError(err) && err.code === 'ERR_CANCELED') return;
        setIsError(true);
      })
      .finally(() => setIsLoading(false));

    return () => ac.abort();
  }, [isOpen, retryKey]);

  const handleSelect = (crewId: number) => {
    onClose();
    router.push(`/crews/${crewId}/certify`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="인증할 크루 선택">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-text-primary">인증할 크루 선택</h2>
            <p className="text-xs text-text-secondary mt-0.5">진행 중인 크루를 선택해 주세요</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 -mr-1 hover:opacity-70 transition-opacity"
            aria-label="닫기"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        {isLoading ? (
          <ul className="flex flex-col gap-2">
            {[1, 2].map((i) => (
              <li key={i} className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-background/60">
                <Skeleton variant="circle" width={40} height={40} />
                <div className="flex-1 flex flex-col gap-1.5">
                  <Skeleton variant="text" height={14} className="w-2/3" />
                  <Skeleton variant="text" height={12} className="w-1/3" />
                </div>
              </li>
            ))}
          </ul>
        ) : isError ? (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-text-secondary">크루 정보를 불러오지 못했어요</p>
            <button
              type="button"
              onClick={() => setRetryKey((k) => k + 1)}
              className="text-xs font-semibold text-primary-green underline-offset-2 hover:underline"
            >
              다시 시도
            </button>
          </div>
        ) : crews.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">진행 중인 크루가 없어요</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {crews.map((crew) => {
              const emoji = CATEGORY_EMOJI[crew.category] ?? '📌';
              const label = CATEGORY_LABEL[crew.category]?.replace(/^\S+\s/, '') ?? '기타';

              return (
                <li key={crew.crew_id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(crew.crew_id)}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-background/60 border border-text-secondary/10 hover:bg-success-green/30 hover:border-primary-green/20 active:scale-[0.98] transition-all text-left"
                  >
                    {crew.image_url ? (
                      <img
                        src={crew.image_url}
                        alt={crew.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <span className="w-10 h-10 rounded-lg bg-success-green flex items-center justify-center text-xl shrink-0">
                        {emoji}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{crew.title}</p>
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
