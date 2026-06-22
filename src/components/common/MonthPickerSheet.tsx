"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { BottomSheet } from '@/components/common/BottomSheet';

interface MonthPickerSheetProps {
  isOpen: boolean;
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

export function MonthPickerSheet({ isOpen, value, onSelect, onClose }: MonthPickerSheetProps) {
  const selectedYear = Number(value.slice(0, 4));
  const [draftYear, setDraftYear] = useState<number | null>(null);
  const year = draftYear ?? selectedYear;

  const handleClose = () => {
    setDraftYear(null);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="월 선택" ariaLabel="월 선택">
      <div className="px-5 pb-6 pt-3">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setDraftYear(year - 1)}
            className="p-2 rounded-lg text-text-secondary hover:bg-text-secondary/5"
            aria-label="이전 연도"
          >
            <ChevronLeft size={18} />
          </button>
          <strong className="text-base text-text-primary">{year}년</strong>
          <button
            type="button"
            onClick={() => setDraftYear(year + 1)}
            className="p-2 rounded-lg text-text-secondary hover:bg-text-secondary/5"
            aria-label="다음 연도"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {MONTH_OPTIONS.map((month) => {
            const monthValue = `${year}-${String(month).padStart(2, '0')}`;
            const active = monthValue === value;
            return (
              <button
                key={monthValue}
                type="button"
                onClick={() => {
                  onSelect(monthValue);
                  handleClose();
                }}
                className={`py-3 rounded-button text-sm font-bold transition-all ${
                  active
                    ? 'bg-primary-green text-white'
                    : 'bg-text-secondary/5 text-text-primary hover:bg-text-secondary/10'
                }`}
              >
                {month}월
              </button>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
