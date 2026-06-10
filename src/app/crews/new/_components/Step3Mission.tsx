'use client';

import { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { SETTLEMENT_TYPE_LABEL, SETTLEMENT_TIMES } from '@/constants/crew';
import type { DailySettlementType, FrequencyType } from '@/types/domain';

interface Step3MissionProps {
  dailySettlementType: DailySettlementType;
  frequencyType: FrequencyType;
  missionScheduleDays: string[];
  depositAmount: number;
  onSettlementTypeChange: (v: DailySettlementType) => void;
  onFrequencyTypeChange: (v: FrequencyType) => void;
  onScheduleDaysChange: (days: string[]) => void;
  onDepositAmountChange: (v: number) => void;
  errors: Partial<Record<'dailySettlementType' | 'depositAmount' | 'missionScheduleDays', string>>;
}

const SETTLEMENT_TYPES: DailySettlementType[] = ['A', 'B', 'C'];
const DAYS = [
  { label: '월', value: 'MONDAY' },
  { label: '화', value: 'TUESDAY' },
  { label: '수', value: 'WEDNESDAY' },
  { label: '목', value: 'THURSDAY' },
  { label: '금', value: 'FRIDAY' },
  { label: '토', value: 'SATURDAY' },
  { label: '일', value: 'SUNDAY' },
];

const DEPOSIT_STEP = 1000;
const DEPOSIT_MIN = 1000;
const DEPOSIT_MAX = 100000;

const SETTLEMENT_DESC: Record<DailySettlementType, string> = {
  A: '아침 일찍 미션 완료',
  B: '저녁 전 미션 완료',
  C: '자정 직전 미션 완료',
};

export default function Step3Mission({
  dailySettlementType,
  frequencyType,
  missionScheduleDays,
  depositAmount,
  onSettlementTypeChange,
  onFrequencyTypeChange,
  onScheduleDaysChange,
  onDepositAmountChange,
  errors,
}: Step3MissionProps) {
  const [rawDeposit, setRawDeposit] = useState(String(depositAmount));

  useEffect(() => {
    setRawDeposit(String(depositAmount));
  }, [depositAmount]);

  const commitDeposit = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed) || parsed < DEPOSIT_MIN) {
      onDepositAmountChange(DEPOSIT_MIN);
    } else if (parsed > DEPOSIT_MAX) {
      onDepositAmountChange(DEPOSIT_MAX);
    } else {
      onDepositAmountChange(Math.floor(parsed / DEPOSIT_STEP) * DEPOSIT_STEP || DEPOSIT_MIN);
    }
  };

  const toggleDay = (day: string) => {
    if (missionScheduleDays.includes(day)) {
      onScheduleDaysChange(missionScheduleDays.filter((d) => d !== day));
    } else {
      onScheduleDaysChange([...missionScheduleDays, day]);
    }
  };

  const adjustDeposit = (delta: number) => {
    const next = depositAmount + delta;
    if (next >= DEPOSIT_MIN && next <= DEPOSIT_MAX) {
      onDepositAmountChange(next);
    }
  };

  return (
    <div className="flex flex-col px-5 pt-4 pb-8 gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-text-primary">인증 설정을 해주세요</h2>
        <p className="text-sm text-text-secondary">인증 마감 시간, 요일, 보증금을 설정해요.</p>
      </div>

      {/* 인증 타입 */}
      <div className="flex flex-col gap-3">
        <label className="text-[12px] font-bold text-text-secondary">
          인증 타입 <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-col gap-2">
          {SETTLEMENT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onSettlementTypeChange(type)}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 text-left transition-all ${
                dailySettlementType === type
                  ? 'border-primary-green bg-primary-green/8'
                  : 'border-transparent bg-card hover:border-text-secondary/15'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  dailySettlementType === type ? 'border-primary-green' : 'border-text-secondary/30'
                }`}>
                  {dailySettlementType === type && (
                    <div className="w-3 h-3 rounded-full bg-primary-green" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${dailySettlementType === type ? 'text-primary-green' : 'text-text-primary'}`}>
                    {SETTLEMENT_TYPE_LABEL[type]} (타입 {type})
                  </p>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    {SETTLEMENT_DESC[type]}
                  </p>
                </div>
              </div>
              <div className="text-right text-[11px] text-text-secondary flex-shrink-0">
                <p>마감 {SETTLEMENT_TIMES[type].deadline}</p>
                <p>정산 {SETTLEMENT_TIMES[type].settlement}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 인증 요일 */}
      <div className="flex flex-col gap-3">
        <label className="text-[12px] font-bold text-text-secondary">
          인증 요일 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onFrequencyTypeChange('DAILY')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${
              frequencyType === 'DAILY'
                ? 'border-primary-green bg-primary-green/8 text-primary-green'
                : 'border-transparent bg-card text-text-secondary hover:border-text-secondary/15'
            }`}
          >
            매일
          </button>
          <button
            type="button"
            onClick={() => onFrequencyTypeChange('SPECIFIC_DAYS')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${
              frequencyType === 'SPECIFIC_DAYS'
                ? 'border-primary-green bg-primary-green/8 text-primary-green'
                : 'border-transparent bg-card text-text-secondary hover:border-text-secondary/15'
            }`}
          >
            특정 요일
          </button>
        </div>

        {frequencyType === 'SPECIFIC_DAYS' && (
          <div className="flex gap-1.5 flex-wrap">
            {DAYS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleDay(value)}
                className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${
                  missionScheduleDays.includes(value)
                    ? 'bg-primary-green text-white shadow-sm shadow-primary-green/30'
                    : 'bg-card text-text-secondary hover:bg-text-secondary/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {errors.missionScheduleDays && (
          <span className="text-[11px] text-red-500 pl-1">{errors.missionScheduleDays}</span>
        )}
      </div>

      {/* 보증금 */}
      <div className="flex flex-col gap-3">
        <label className="text-[12px] font-bold text-text-secondary">
          보증금 <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center justify-between bg-card rounded-2xl px-4 py-3.5">
          <button
            type="button"
            onClick={() => adjustDeposit(-DEPOSIT_STEP)}
            disabled={depositAmount <= DEPOSIT_MIN}
            className="w-9 h-9 rounded-full bg-background flex items-center justify-center hover:bg-text-secondary/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <Minus size={16} className="text-text-primary" />
          </button>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-baseline gap-1">
              <input
                type="text"
                inputMode="numeric"
                value={rawDeposit}
                onChange={(e) => setRawDeposit(e.target.value.replace(/[^0-9]/g, ''))}
                onBlur={(e) => commitDeposit(e.target.value)}
                className="w-28 text-center text-xl font-bold text-text-primary bg-transparent border-b-2 border-primary-green/40 focus:border-primary-green outline-none transition-colors"
              />
              <span className="text-xl font-bold text-text-primary">원</span>
            </div>
            <span className="text-[11px] text-text-secondary">1,000 ~ 100,000원 (1,000원 단위)</span>
          </div>
          <button
            type="button"
            onClick={() => adjustDeposit(DEPOSIT_STEP)}
            disabled={depositAmount >= DEPOSIT_MAX}
            className="w-9 h-9 rounded-full bg-background flex items-center justify-center hover:bg-text-secondary/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <Plus size={16} className="text-text-primary" />
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[5000, 10000, 30000, 50000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onDepositAmountChange(preset)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                depositAmount === preset
                  ? 'bg-primary-green text-white'
                  : 'bg-card text-text-secondary hover:bg-text-secondary/10'
              }`}
            >
              {preset.toLocaleString()}원
            </button>
          ))}
        </div>
        {errors.depositAmount && (
          <span className="text-[11px] text-red-500 pl-1">{errors.depositAmount}</span>
        )}
      </div>
    </div>
  );
}
