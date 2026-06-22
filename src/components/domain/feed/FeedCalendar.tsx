"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { FeedDateMode } from '@/components/domain/feed/FeedDateFilter';
import type { FeedPeriod } from '@/types/domain';
import { getMonthPeriod } from '@/utils/date';

interface FeedCalendarProps {
  mode: FeedDateMode;
  /** 현재 적용된 기간. null이면 전체 기간(필터 없음) */
  currentPeriod: FeedPeriod | null;
  onModeChange: (mode: FeedDateMode) => void;
  onApply: (period: FeedPeriod) => void;
  /** 전체 기간으로 되돌리기(날짜 필터 해제) */
  onClear: () => void;
  onClose: () => void;
  selectionMode?: 'range' | 'single';
}

const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const MODE_OPTIONS: { value: FeedDateMode; label: string }[] = [
  { value: 'daily', label: '일일' },
  { value: 'monthly', label: '월간' },
  { value: 'period', label: '기간' },
];

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseInitialYM(dateStr: string): { year: number; month: number } {
  const parts = dateStr.split('-');
  return { year: Number(parts[0]), month: Number(parts[1]) - 1 };
}

function todayStr(): string {
  const d = new Date();
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

export function FeedCalendar({
  mode,
  currentPeriod,
  onModeChange,
  onApply,
  onClear,
  onClose,
  selectionMode = 'range',
}: FeedCalendarProps) {
  const initial = parseInitialYM(currentPeriod?.start_date ?? todayStr());
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [selStart, setSelStart] = useState<string | null>(currentPeriod?.start_date ?? null);
  const [selEnd, setSelEnd] = useState<string | null>(currentPeriod?.end_date ?? null);
  const [pickingEnd, setPickingEnd] = useState(false);

  // 캘린더 그리드 계산
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const prevPage = () => {
    if (mode === 'monthly') {
      setViewYear((y) => y - 1);
      return;
    }
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextPage = () => {
    if (mode === 'monthly') {
      setViewYear((y) => y + 1);
      return;
    }
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const handleDayClick = (day: number) => {
    const dateStr = toDateStr(viewYear, viewMonth, day);
    if (selectionMode === 'single') {
      onApply({ start_date: dateStr, end_date: dateStr });
      return;
    }
    if (!pickingEnd) {
      setSelStart(dateStr);
      setSelEnd(null);
      setPickingEnd(true);
    } else {
      if (dateStr >= (selStart ?? '')) {
        setSelEnd(dateStr);
      } else {
        setSelStart(dateStr);
        setSelEnd(null);
      }
      setPickingEnd(false);
    }
  };

  const getDayClassName = (day: number): string => {
    const dateStr = toDateStr(viewYear, viewMonth, day);
    const isStart = dateStr === selStart;
    const isEnd = dateStr === selEnd;
    const inRange =
      selStart !== null &&
      selEnd !== null &&
      dateStr > selStart &&
      dateStr < selEnd;

    const base = 'w-8 h-8 text-xs flex items-center justify-center rounded-full transition-colors';
    if (isStart || isEnd) return `${base} bg-primary-green text-white font-bold`;
    if (inRange) return `${base} bg-primary-green/20 text-primary-green font-medium`;
    return `${base} text-text-primary hover:bg-text-secondary/10`;
  };

  const canApply = mode === 'monthly' || selStart !== null;
  const selectedMonth = currentPeriod?.start_date.slice(0, 7) ?? '';

  const applyViewedMonth = () => {
    onApply(getMonthPeriod(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`));
  };

  const selectionHint =
    selStart && selEnd && selStart !== selEnd
      ? `${selStart} ~ ${selEnd}`
      : selStart && !selEnd
        ? `${selStart} · 종료일을 선택하세요`
        : selStart
          ? selStart
          : null;

  return (
    <div className="bg-card rounded-card border border-text-secondary/10 shadow-card-elevated p-4">
      <div className="flex items-center bg-text-secondary/10 p-1 rounded-full border border-text-secondary/5 mb-4">
        {MODE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onModeChange(option.value)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${mode === option.value
              ? 'bg-card text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevPage}
          aria-label={mode === 'monthly' ? '이전 연도' : '이전 달'}
          className="p-1.5 rounded-lg hover:bg-text-secondary/8 active:scale-95 transition-all"
        >
          <ChevronLeft size={16} className="text-text-secondary" />
        </button>
        <span className="text-sm font-extrabold text-text-primary tracking-tight">
          {mode === 'monthly' ? `${viewYear}년` : `${viewYear}년 ${viewMonth + 1}월`}
        </span>
        <button
          type="button"
          onClick={nextPage}
          aria-label={mode === 'monthly' ? '다음 연도' : '다음 달'}
          className="p-1.5 rounded-lg hover:bg-text-secondary/8 active:scale-95 transition-all"
        >
          <ChevronRight size={16} className="text-text-secondary" />
        </button>
      </div>

      {mode === 'monthly' ? (
        <div className="grid grid-cols-3 gap-2">
          {MONTH_OPTIONS.map((month) => {
            const monthValue = `${viewYear}-${String(month).padStart(2, '0')}`;
            const active = monthValue === selectedMonth;
            return (
              <button
                key={monthValue}
                type="button"
                onClick={() => onApply(getMonthPeriod(monthValue))}
                className={`py-3 rounded-button text-sm font-bold transition-all ${active
                  ? 'bg-primary-green text-white'
                  : 'bg-text-secondary/5 text-text-primary hover:bg-text-secondary/10'
                  }`}
              >
                {month}월
              </button>
            );
          })}
        </div>
      ) : (
        <>
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-1">
            {WEEK_LABELS.map((label) => (
              <div key={label} className="flex items-center justify-center py-1">
                <span className="text-[10px] font-semibold text-text-secondary">{label}</span>
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="space-y-0.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7">
                {week.map((day, di) => (
                  <div key={di} className="flex items-center justify-center py-0.5">
                    {day !== null ? (
                      <button
                        type="button"
                        onClick={() => handleDayClick(day)}
                        className={getDayClassName(day)}
                      >
                        {day}
                      </button>
                    ) : (
                      <span className="w-8 h-8" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* 선택 상태 표시 */}
      {selectionHint && (
        <div className="mt-3 px-3 py-2 bg-primary-green/8 rounded-xl text-[11px] text-center text-primary-green font-semibold">
          {selectionHint}
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onClear}
          className="py-2.5 text-sm font-semibold text-text-secondary border border-text-secondary/20 rounded-button hover:bg-text-secondary/5 active:scale-[0.99] transition-all"
        >
          전체 기간
        </button>
        <button
          type="button"
          onClick={() => {
            if (mode === 'monthly') {
              applyViewedMonth();
              return;
            }
            if (!selStart) return;
            onApply({ start_date: selStart, end_date: selEnd ?? selStart });
          }}
          disabled={!canApply}
          className="py-2.5 text-sm font-semibold text-white bg-primary-green rounded-button shadow-sm shadow-primary-green/30 hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          적용
        </button>
      </div>

      {/* 닫기 */}
      <button
        type="button"
        onClick={onClose}
        className="mt-2 w-full py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
      >
        닫기
      </button>
    </div>
  );
}
