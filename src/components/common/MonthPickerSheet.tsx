"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { BottomSheet } from "@/components/common/BottomSheet";
import { formatMonthValue } from "@/utils/date";

interface MonthPickerSheetProps {
  isOpen: boolean;
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  maxValue?: string;
  title?: string;
  ariaLabel?: string;
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

export function MonthPickerSheet({
  isOpen,
  value,
  onSelect,
  onClose,
  maxValue,
  title = "월 선택",
  ariaLabel = "월 선택",
}: MonthPickerSheetProps) {
  // value/maxValue are zero-padded YYYY-MM strings, so lexical comparison is safe.
  const selectedYear = Number(value.slice(0, 4));
  const maxYear = maxValue ? Number(maxValue.slice(0, 4)) : 9999;
  const [draftYear, setDraftYear] = useState<number | null>(null);
  const year = draftYear ?? selectedYear;
  const canGoPreviousYear = year > 0;
  const canGoNextYear = year < maxYear;

  useEffect(() => {
    if (isOpen) return;
    const timeoutId = window.setTimeout(() => setDraftYear(null), 0);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  const handleClose = () => {
    setDraftYear(null);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title={title} ariaLabel={ariaLabel}>
      <div className="px-5 pb-6 pt-3">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => {
              if (canGoPreviousYear) setDraftYear(year - 1);
            }}
            disabled={!canGoPreviousYear}
            className="p-2 rounded-lg text-text-secondary hover:bg-text-secondary/5 disabled:opacity-35"
            aria-label="이전 연도"
          >
            <ChevronLeft size={18} />
          </button>
          <strong className="text-base text-text-primary">{year}년</strong>
          <button
            type="button"
            onClick={() => {
              if (canGoNextYear) setDraftYear(year + 1);
            }}
            disabled={!canGoNextYear}
            className="p-2 rounded-lg text-text-secondary hover:bg-text-secondary/5 disabled:opacity-35"
            aria-label="다음 연도"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {MONTH_OPTIONS.map((month) => {
            const monthValue = formatMonthValue(year, month);
            const active = monthValue === value;
            const disabled = maxValue !== undefined && monthValue > maxValue;
            return (
              <button
                key={monthValue}
                type="button"
                onClick={() => {
                  if (disabled) return;
                  onSelect(monthValue);
                  handleClose();
                }}
                disabled={disabled}
                aria-pressed={active}
                className={`py-3 rounded-button text-sm font-bold transition-all ${
                  active
                    ? "bg-primary-green text-white"
                    : "bg-text-secondary/5 text-text-primary hover:bg-text-secondary/10 disabled:text-text-secondary/35 disabled:hover:bg-text-secondary/5"
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
