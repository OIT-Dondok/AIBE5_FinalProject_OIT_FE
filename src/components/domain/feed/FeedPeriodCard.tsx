"use client";

import { CalendarDays } from 'lucide-react';

import type { FeedPeriod } from '@/mocks/data/feed';

interface FeedPeriodCardProps {
  period: FeedPeriod;
  isCalendarOpen: boolean;
  onOpenCalendar: () => void;
}

function formatPeriodLabel(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  s.setUTCHours(s.getUTCHours() + 9);
  e.setUTCHours(e.getUTCHours() + 9);
  return `${s.getUTCMonth() + 1}/${s.getUTCDate()} ~ ${e.getUTCMonth() + 1}/${e.getUTCDate()}`;
}

function calcDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function FeedPeriodCard({ period, isCalendarOpen, onOpenCalendar }: FeedPeriodCardProps) {
  const label = formatPeriodLabel(period.start_date, period.end_date);
  const days = calcDays(period.start_date, period.end_date);

  return (
    <div className="bg-card rounded-card px-4 py-3.5 flex items-center justify-between shadow-card border border-text-secondary/10">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 flex items-center justify-center bg-primary-green/10 rounded-xl flex-shrink-0">
          <CalendarDays size={18} className="text-primary-green" />
        </div>
        <div>
          <p className="text-sm font-extrabold text-text-primary tracking-tight">{label}</p>
          <p className="text-[11px] text-text-secondary mt-0.5">{days}일간</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenCalendar}
        aria-expanded={isCalendarOpen}
        aria-label="기간 선택 달력 열기"
        className={`px-3.5 py-1.5 rounded-button text-xs font-semibold border transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/50 ${
          isCalendarOpen
            ? 'bg-primary-green text-white border-primary-green shadow-sm'
            : 'border-text-secondary/30 text-text-secondary hover:bg-text-secondary/5'
        }`}
      >
        기간
      </button>
    </div>
  );
}
