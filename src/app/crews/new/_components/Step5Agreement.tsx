'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface AgreementKeys {
  honest_verification: boolean;
  daily_review: boolean;
  policy_acknowledgment: boolean;
  no_personal_bias: boolean;
  immutable_after_creation: boolean;
  crew_limit_acknowledgment: boolean;
}

interface Step5AgreementProps {
  agreements: AgreementKeys;
  onAgreementChange: (key: keyof AgreementKeys, value: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const PRINCIPLES: Array<{ key: keyof AgreementKeys; title: string; description: string }> = [
  {
    key: 'honest_verification',
    title: '정직한 인증',
    description: '모든 인증 사진은 실제 미션을 수행한 결과여야 하며, 조작하거나 대리 제출하지 않겠습니다.',
  },
  {
    key: 'daily_review',
    title: '성실한 검토',
    description: '크루원의 인증 사진을 매일 성실하게 검토하고 공정하게 판단하겠습니다.',
  },
  {
    key: 'policy_acknowledgment',
    title: '정책 준수',
    description: '돈독 서비스의 운영 정책과 크루 운영 규칙을 숙지하고 이를 준수하겠습니다.',
  },
  {
    key: 'no_personal_bias',
    title: '공정한 운영',
    description: '특정 크루원에 대한 개인적 편향 없이 동일한 기준으로 검증하겠습니다.',
  },
  {
    key: 'immutable_after_creation',
    title: '크루 수정·삭제 불가',
    description: '크루 개설 후 수정 및 삭제가 불가능합니다. 신중하게 만들어주세요.',
  },
  {
    key: 'crew_limit_acknowledgment',
    title: '크루 운영 한도',
    description: '방장은 최대 5개의 크루를 동시에 운영할 수 있습니다.',
  },
];

export default function Step5Agreement({
  agreements,
  onAgreementChange,
  onSubmit,
  isSubmitting,
}: Step5AgreementProps) {
  const allAgreed = PRINCIPLES.every(({ key }) => agreements[key]);

  const handleToggleAll = () => {
    const next = !allAgreed;
    PRINCIPLES.forEach(({ key }) => onAgreementChange(key, next));
  };

  return (
    <div className="flex flex-col px-5 pt-4 pb-8 gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-text-primary">운영원칙에 동의해주세요</h2>
        <p className="text-sm text-text-secondary">크루 방장으로서 지켜야 할 원칙들이에요.</p>
      </div>

      <div className="bg-card rounded-card p-1 shadow-[var(--shadow-card)] flex flex-col divide-y divide-text-secondary/8">
        {PRINCIPLES.map(({ key, title, description }) => (
          <button
            key={key}
            type="button"
            onClick={() => onAgreementChange(key, !agreements[key])}
            className="flex items-start gap-3 p-4 text-left hover:bg-text-secondary/3 transition-colors"
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
              agreements[key] ? 'border-primary-green bg-primary-green' : 'border-text-secondary/30'
            }`}>
              {agreements[key] && <Check size={11} className="text-white stroke-[3]" />}
            </div>
            <div className="flex flex-col gap-1">
              <p className={`text-sm font-semibold transition-colors ${agreements[key] ? 'text-text-primary' : 'text-text-secondary'}`}>
                {title}
              </p>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                {description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* 전체 동의 */}
      <button
        type="button"
        onClick={handleToggleAll}
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all ${
          allAgreed ? 'border-primary-green bg-primary-green/8' : 'border-text-secondary/20 bg-card'
        }`}
      >
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          allAgreed ? 'border-primary-green bg-primary-green' : 'border-text-secondary/30'
        }`}>
          {allAgreed && <Check size={11} className="text-white stroke-[3]" />}
        </div>
        <span className={`text-sm font-bold ${allAgreed ? 'text-primary-green' : 'text-text-secondary'}`}>
          위 6가지 원칙에 모두 동의합니다
        </span>
      </button>

      <Button
        variant="primary-green"
        size="lg"
        fullWidth
        onClick={onSubmit}
        disabled={!allAgreed}
        isLoading={isSubmitting}
      >
        크루 생성하기
      </Button>
    </div>
  );
}
