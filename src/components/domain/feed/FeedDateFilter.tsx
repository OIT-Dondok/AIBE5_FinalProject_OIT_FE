"use client";

import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

import type { FeedPeriod } from '@/types/domain';
import {
  addDaysToYmd,
  formatMonthLabel,
  formatYmdDot,
  shiftMonthValue,
} from '@/utils/date';

export type FeedDateMode = 'daily' | 'monthly' | 'period';

interface FeedDateFilterProps {
  mode: FeedDateMode;
  period: FeedPeriod | null;
  selectedDay: string;
  selectedMonth: string;
  isCalendarOpen: boolean;
  onDayChange: (day: string) => void;
  onMonthChange: (month: string) => void;
  onClear: () => void;
  onToggleCalendar: () => void;
}

function formatRangeLabel(period: FeedPeriod | null): string {
  if (!period) return '전체 기간';
  const [startYear, startMonth, startDay] = period.start_date.split('-').map(Number);
  const [endYear, endMonth, endDay] = period.end_date.split('-').map(Number);
  return `${String(startYear).slice(2)}.${startMonth}.${startDay} ~ ${String(endYear).slice(2)}.${endMonth}.${endDay}`;
}


export function FeedDateFilter({
  mode,
  period,
  selectedDay,
  selectedMonth,
  isCalendarOpen,
  onDayChange,
  onMonthChange,
  onClear,
  onToggleCalendar,
}: FeedDateFilterProps) {
  const stepperLabel =
    mode === 'daily'
      ? formatYmdDot(selectedDay)
      : mode === 'monthly'
        ? formatMonthLabel(selectedMonth)
        : formatRangeLabel(period);

  return (
    <section className="bg-card rounded-card px-4 py-3.5 shadow-card border border-text-secondary/10">
      <div className="flex items-center justify-between gap-2">
        <div className="w-9 h-9 flex items-center justify-center bg-primary-green/10 rounded-xl flex-shrink-0">
          <CalendarDays size={18} className="text-primary-green" />
        </div>

        {mode === 'period' ? (
          <button
            type="button"
            onClick={onToggleCalendar}
            aria-expanded={isCalendarOpen}
            className="min-w-0 flex-1 flex items-center justify-between gap-2 rounded-button border border-text-secondary/20 px-3 py-2 text-center transition-all hover:bg-text-secondary/5 active:scale-[0.99]"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-base font-extrabold text-text-primary tracking-tight truncate">
                {stepperLabel}
              </span>
            </span>
            <ChevronDown
              size={16}
              className={`text-text-secondary transition-transform ${isCalendarOpen ? 'rotate-180' : ''}`}
            />
          </button>
        ) : (
          <div className="min-w-0 flex-1 flex items-center justify-between rounded-button border border-text-secondary/20">
            <button
              type="button"
              onClick={() =>
                mode === 'daily'
                  ? onDayChange(addDaysToYmd(selectedDay, -1))
                  : onMonthChange(shiftMonthValue(selectedMonth, -1))
              }
              aria-label="이전 기간"
              className="p-2.5 text-text-secondary hover:text-text-primary active:scale-95 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            {mode === 'daily' ? (
              <button
                type="button"
                onClick={onToggleCalendar}
                aria-expanded={isCalendarOpen}
                className="min-w-0 text-center rounded-lg px-2 py-1 transition-all hover:bg-text-secondary/5 active:scale-[0.99]"
              >
                <span className="block text-base font-extrabold text-text-primary tracking-tight truncate">
                  {stepperLabel}
                </span>
              </button>
            ) : mode === 'monthly' ? (
              <button
                type="button"
                onClick={onToggleCalendar}
                aria-expanded={isCalendarOpen}
                className="min-w-0 text-center rounded-lg px-2 py-1 transition-all hover:bg-text-secondary/5 active:scale-[0.99]"
              >
                <span className="block text-base font-extrabold text-text-primary tracking-tight truncate">
                  {stepperLabel}
                </span>
              </button>
            ) : (
              <div className="min-w-0 text-center">
                <p className="text-base font-extrabold text-text-primary tracking-tight truncate">
                  {stepperLabel}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() =>
                mode === 'daily'
                  ? onDayChange(addDaysToYmd(selectedDay, 1))
                  : onMonthChange(shiftMonthValue(selectedMonth, 1))
              }
              aria-label="다음 기간"
              className="p-2.5 text-text-secondary hover:text-text-primary active:scale-95 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClear}
          aria-label="전체 기간으로 초기화"
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-text-secondary/20 text-text-secondary hover:bg-text-secondary/5 hover:text-text-primary active:scale-95 transition-all"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </section>
  );
}
