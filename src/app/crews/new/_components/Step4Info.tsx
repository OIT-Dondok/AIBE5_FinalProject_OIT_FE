'use client';

import { Minus, Plus } from 'lucide-react';
import { calcDurationDays } from '@/utils/date';

interface Step4InfoProps {
  startDate: string;
  endDate: string;
  minParticipants: number;
  maxParticipants: number;
  description: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onMinParticipantsChange: (v: number) => void;
  onMaxParticipantsChange: (v: number) => void;
  onDescriptionChange: (v: string) => void;
  errors: Partial<Record<'startDate' | 'endDate' | 'duration' | 'participants' | 'description', string>>;
}

const MIN_PARTICIPANTS = 2;
const MAX_PARTICIPANTS = 15;
const MIN_DURATION = 7;
const MAX_DURATION = 90;

function getMinStartDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function Step4Info({
  startDate,
  endDate,
  minParticipants,
  maxParticipants,
  description,
  onStartDateChange,
  onEndDateChange,
  onMinParticipantsChange,
  onMaxParticipantsChange,
  onDescriptionChange,
  errors,
}: Step4InfoProps) {
  const duration = calcDurationDays(startDate, endDate);
  const durationValid = duration !== null && duration >= MIN_DURATION && duration <= MAX_DURATION;
  const minStart = getMinStartDate();

  const adjustMin = (delta: number) => {
    const next = minParticipants + delta;
    if (next >= MIN_PARTICIPANTS && next <= maxParticipants) onMinParticipantsChange(next);
  };

  const adjustMax = (delta: number) => {
    const next = maxParticipants + delta;
    if (next >= minParticipants && next <= MAX_PARTICIPANTS) onMaxParticipantsChange(next);
  };

  return (
    <div className="flex flex-col px-5 pt-4 pb-8 gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-text-primary">기본 정보를 입력해주세요</h2>
        <p className="text-sm text-text-secondary">미션 기간, 인원, 크루 소개를 설정해요.</p>
      </div>

      {/* 미션 기간 */}
      <div className="flex flex-col gap-3">
        <label className="text-[12px] font-bold text-text-secondary">
          미션 기간 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[11px] text-text-secondary font-medium">시작일</label>
            <input
              type="date"
              value={startDate}
              min={minStart}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full p-3 text-sm bg-background text-text-primary border border-text-secondary/20 rounded-xl focus:border-primary-green focus:outline-none transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[11px] text-text-secondary font-medium">종료일</label>
            <input
              type="date"
              value={endDate}
              min={startDate || minStart}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full p-3 text-sm bg-background text-text-primary border border-text-secondary/20 rounded-xl focus:border-primary-green focus:outline-none transition-colors"
            />
          </div>
        </div>

        {duration !== null && (
          <div className={`flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold ${
            durationValid ? 'bg-primary-green/10 text-primary-green' : 'bg-red-50 text-red-500'
          }`}>
            {durationValid
              ? `${duration}일 (${MIN_DURATION}~${MAX_DURATION}일 가능)`
              : `${duration}일 — ${MIN_DURATION}~${MAX_DURATION}일 이내로 설정해주세요`
            }
          </div>
        )}
        {(errors.startDate || errors.endDate || errors.duration) && (
          <span className="text-[11px] text-red-500 pl-1">
            {errors.startDate || errors.endDate || errors.duration}
          </span>
        )}
      </div>

      {/* 인원 */}
      <div className="flex flex-col gap-3">
        <label className="text-[12px] font-bold text-text-secondary">
          인원 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <div className="flex flex-col gap-2 flex-1">
            <p className="text-[11px] text-text-secondary font-medium">최소 인원</p>
            <div className="flex items-center justify-between bg-card rounded-2xl px-3 py-2.5">
              <button
                type="button"
                onClick={() => adjustMin(-1)}
                disabled={minParticipants <= MIN_PARTICIPANTS}
                className="w-8 h-8 rounded-full bg-background flex items-center justify-center hover:bg-text-secondary/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <Minus size={14} />
              </button>
              <span className="text-base font-bold">{minParticipants}명</span>
              <button
                type="button"
                onClick={() => adjustMin(1)}
                disabled={minParticipants >= maxParticipants}
                className="w-8 h-8 rounded-full bg-background flex items-center justify-center hover:bg-text-secondary/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <p className="text-[11px] text-text-secondary font-medium">최대 인원 (최대 15명)</p>
            <div className="flex items-center justify-between bg-card rounded-2xl px-3 py-2.5">
              <button
                type="button"
                onClick={() => adjustMax(-1)}
                disabled={maxParticipants <= minParticipants}
                className="w-8 h-8 rounded-full bg-background flex items-center justify-center hover:bg-text-secondary/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <Minus size={14} />
              </button>
              <span className="text-base font-bold">{maxParticipants}명</span>
              <button
                type="button"
                onClick={() => adjustMax(1)}
                disabled={maxParticipants >= MAX_PARTICIPANTS}
                className="w-8 h-8 rounded-full bg-background flex items-center justify-center hover:bg-text-secondary/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
        {errors.participants && (
          <span className="text-[11px] text-red-500 pl-1">{errors.participants}</span>
        )}
      </div>

      {/* 크루 소개 */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-bold text-text-secondary">
          크루 소개 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => {
            if (e.target.value.length <= 500) onDescriptionChange(e.target.value);
          }}
          placeholder="크루를 소개해 주세요. 미션 목표, 인증 방법 등을 알려주세요."
          className={`w-full h-32 resize-none text-sm text-text-primary bg-background rounded-xl p-3.5 border transition-colors focus:outline-none placeholder:text-text-secondary/40 ${
            errors.description
              ? 'border-red-500 focus:border-red-600'
              : 'border-text-secondary/20 focus:border-primary-green'
          }`}
        />
        <div className="flex justify-between items-center">
          {errors.description ? (
            <span className="text-[11px] text-red-500">{errors.description}</span>
          ) : (
            <span />
          )}
          <span className="text-[11px] text-text-secondary">{description.length} / 500</span>
        </div>
      </div>
    </div>
  );
}
