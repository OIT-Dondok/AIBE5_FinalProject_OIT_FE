interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = ['AI 추천', '크루 정체성', '인증 설정', '기본 정보', '운영원칙'];

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i + 1 <= currentStep ? 'bg-primary-green' : 'bg-text-secondary/20'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">
          {currentStep} / {totalSteps}단계
        </span>
        <span className="text-xs font-semibold text-primary-green">
          {STEP_LABELS[Math.min(currentStep - 1, STEP_LABELS.length - 1)]}
        </span>
      </div>
    </div>
  );
}
