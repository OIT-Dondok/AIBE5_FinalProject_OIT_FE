'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { api } from '@/lib/axios';
import type { AiRecommendationResponse, FrequencyType, DailySettlementType } from '@/types/domain';

interface AiDraft {
  title: string;
  description: string;
  frequency_type: FrequencyType;
  mission_schedule_days: string[];
  daily_settlement_type: DailySettlementType;
  deposit_amount: number;
  duration_days: number;
}

interface Step1AIProps {
  onComplete: (draft: AiDraft | null) => void;
}

const MAX_CHARS = 300;

export default function Step1AI({ onComplete }: Step1AIProps) {
  const [seedText, setSeedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [warnings, setWarnings] = useState<Array<{ field: string; message: string }>>([]);

  const handleAIComplete = async () => {
    if (!seedText.trim()) return;
    setIsLoading(true);
    setWarnings([]);
    try {
      const res = await api.post<AiRecommendationResponse>('/ai/mission-recommendations', {
        seed_text: seedText,
      });
      if (res.data.validation_warnings.length > 0) {
        setWarnings(res.data.validation_warnings);
      }
      onComplete(res.data.draft);
    } catch {
      setWarnings([{ field: 'general', message: 'AI 추천에 실패했습니다. 다시 시도하거나 직접 입력해주세요.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 px-5 pt-4 pb-8 gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-text-primary">
          어떤 습관 크루를 만들고 싶으신가요?
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          자유롭게 설명해 주시면 AI가 크루 정보를 자동으로 채워드려요.
        </p>
      </div>

      <div className="bg-card rounded-card p-4 shadow-[var(--shadow-card)] flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-primary-green" />
          <span className="text-xs font-semibold text-primary-green">AI 자동완성</span>
        </div>
        <textarea
          value={seedText}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) setSeedText(e.target.value);
          }}
          placeholder="예: 매일 아침 6시에 일어나서 30분 운동하는 크루를 만들고 싶어요. 보증금 3만원 정도로 2주간 진행하면 좋겠어요."
          className="w-full h-36 resize-none text-sm text-text-primary bg-background rounded-xl p-3.5 border border-text-secondary/20 focus:border-primary-green focus:outline-none placeholder:text-text-secondary/40 transition-colors"
        />
        <div className="flex justify-end">
          <span className="text-[11px] text-text-secondary">
            {seedText.length} / {MAX_CHARS}
          </span>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
              {w.message}
            </p>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 mt-auto">
        <Button
          variant="primary-green"
          size="lg"
          fullWidth
          onClick={handleAIComplete}
          disabled={!seedText.trim()}
          isLoading={isLoading}
        >
          <Sparkles size={16} className="mr-1.5" />
          AI 자동완성으로 시작하기
        </Button>
        <button
          type="button"
          onClick={() => onComplete(null)}
          className="flex items-center justify-center gap-1 py-3 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          건너뛰고 직접 입력하기
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
