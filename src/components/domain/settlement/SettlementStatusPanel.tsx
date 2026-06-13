import { AlertCircle, CheckCircle2, Clock3, Loader2 } from 'lucide-react';
import type { CrewSettlementSummary } from '@/types/domain';
import { Button } from '@/components/common/Button';
import { formatDateTime, getFailureLabel, getSettlementStatusCopy } from './settlementViewModel';

interface SettlementStatusPanelProps {
  summary: CrewSettlementSummary;
  onRetry: () => void;
}

const toneClass = {
  neutral: {
    panel: 'border-text-secondary/10 bg-card',
    icon: 'bg-primary-blue/10 text-primary-blue',
    badge: 'bg-primary-blue/10 text-primary-blue',
  },
  success: {
    panel: 'border-primary-green/20 bg-success-green/45',
    icon: 'bg-primary-green/10 text-primary-green',
    badge: 'bg-primary-green/10 text-primary-green',
  },
  warning: {
    panel: 'border-pastel-yellow/60 bg-[#FFF8DD]',
    icon: 'bg-pastel-yellow/25 text-[#8A6410]',
    badge: 'bg-pastel-yellow/30 text-[#72510B]',
  },
  danger: {
    panel: 'border-red-200 bg-red-50',
    icon: 'bg-red-100 text-red-600',
    badge: 'bg-red-100 text-red-700',
  },
};

const statusLabel = {
  NONE: '정산 전',
  PENDING: '대기 중',
  RUNNING: '계산 중',
  SUCCEEDED: '완료',
  FAILED: '오류',
  RETRY_WAIT: '재시도 대기',
};

export function SettlementStatusPanel({ summary, onRetry }: SettlementStatusPanelProps) {
  const copy = getSettlementStatusCopy(summary.status);
  const tone = toneClass[copy.tone];
  const isRunning = summary.status === 'RUNNING';
  const Icon =
    summary.status === 'SUCCEEDED'
      ? CheckCircle2
      : summary.status === 'FAILED'
        ? AlertCircle
        : summary.status === 'RUNNING'
          ? Loader2
          : Clock3;

  return (
    <section className={`overflow-hidden rounded-card border shadow-card ${tone.panel}`}>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone.icon}`}>
            <Icon size={22} className={isRunning ? 'animate-spin' : undefined} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone.badge}`}>
                {statusLabel[summary.status]}
              </span>
              {summary.settlement_id !== null && (
                <span className="text-xs font-semibold text-text-secondary">정산 #{summary.settlement_id}</span>
              )}
            </div>
            <h2 className="mt-3 text-xl font-black tracking-[-0.02em] text-text-primary">{copy.title}</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{copy.description}</p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-button bg-white/70 p-3">
            <dt className="text-xs font-medium text-text-secondary">시작 시각</dt>
            <dd className="mt-1 font-bold text-text-primary">{formatDateTime(summary.started_at)}</dd>
          </div>
          <div className="rounded-button bg-white/70 p-3">
            <dt className="text-xs font-medium text-text-secondary">재시도</dt>
            <dd className="mt-1 font-bold text-text-primary">{summary.retry_count}회</dd>
          </div>
        </dl>

        {(summary.status === 'FAILED' || summary.status === 'RETRY_WAIT') && (
          <div className="mt-4 rounded-button border border-red-200/80 bg-white/85 p-3">
            <p className="text-sm font-semibold text-text-primary">{getFailureLabel(summary.failure_code)}</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              {summary.failure_message ?? '상세 오류 메시지는 아직 제공되지 않았어요.'}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-text-secondary/10 bg-white/60 px-5 py-4">
        <Button type="button" variant="outline" size="md" fullWidth onClick={onRetry}>
          상태 다시 확인
        </Button>
      </div>
    </section>
  );
}
