import { AlertTriangle, ChevronRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import type { CrewSettlementSummary } from '@/types/domain';
import { formatDateTime } from './settlementViewModel';

const OPEN_CHAT_URL = 'https://open.kakao.com/o/s5Pxfgxi';

interface SettlementBatchErrorViewProps {
  summary: CrewSettlementSummary;
  onRetry: () => void;
  onDismiss: () => void;
}

export function SettlementBatchErrorView({
  summary,
  onRetry,
  onDismiss,
}: SettlementBatchErrorViewProps) {
  const recoverLabel = summary.status === 'RETRY_WAIT' ? '재시도 가능' : '지원팀 확인';
  const errorCode = summary.failure_code ?? 'UNKNOWN';

  return (
    <main className="w-full max-w-[430px] mx-auto px-5 py-6 pb-24">
      <div className="flex flex-col gap-4">
        <section className="rounded-card bg-card p-6 text-center shadow-card">
          <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={36} />
          </div>
          <h1 className="mt-4 text-lg font-black text-text-primary">정산 실패 알림</h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            정산이 실패했습니다. 잠시 후 재시도되거나
            <br />
            지원팀의 확인이 필요할 수 있습니다.
          </p>
        </section>

        <section className="rounded-card bg-card p-1 shadow-card">
          <dl className="divide-y divide-text-secondary/10">
            <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <dt className="text-text-secondary">실패 시각</dt>
              <dd className="font-bold text-text-primary">{formatDateTime(summary.finished_at ?? summary.started_at)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <dt className="text-text-secondary">오류 코드</dt>
              <dd className="rounded-md bg-red-50 px-2 py-1 font-mono text-xs font-bold text-red-600">
                {errorCode}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <dt className="text-text-secondary">조치 사항</dt>
              <dd className="font-bold text-text-primary">{recoverLabel}</dd>
            </div>
          </dl>
        </section>

        <a
          href={OPEN_CHAT_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="카카오톡 오픈채팅으로 문의하면 빠른 답변을 받을 수 있습니다"
          className="block rounded-card bg-card p-4 shadow-card transition hover:scale-[1.01] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FEE500] focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-[#FEE500] text-[#191919]">
              <MessageCircle size={22} fill="currentColor" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-black text-text-primary">카카오 채널</h2>
              <p className="mt-1 text-xs text-text-secondary">문의가 필요한 문제를 @dondok에서 확인하세요.</p>
            </div>
            <ChevronRight size={16} className="text-text-secondary" />
          </div>
        </a>

        <div className="mt-auto grid grid-cols-[1fr_1.4fr] gap-2">
          <Button type="button" variant="outline" onClick={onDismiss}>
            닫기
          </Button>
          <Button type="button" variant="primary-blue" onClick={onRetry}>
            결과 다시 조회
          </Button>
        </div>
      </div>
    </main>
  );
}
