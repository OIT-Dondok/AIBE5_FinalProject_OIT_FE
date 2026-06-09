import type { CrewDetail } from '@/types/domain';
import { CATEGORY_LABEL, SETTLEMENT_TYPE_LABEL, SETTLEMENT_TIMES } from '@/constants/crew';

interface CrewInfoTableProps {
  crew: CrewDetail;
}

export default function CrewInfoTable({ crew }: CrewInfoTableProps) {
  const { daily_settlement_type } = crew;
  const times = SETTLEMENT_TIMES[daily_settlement_type];
  const totalAmount = crew.deposit_amount * crew.max_participants;

  const rows: { label: string; value: string }[] = [
    { label: '방장', value: crew.host_nickname },
    { label: '카테고리', value: CATEGORY_LABEL[crew.category] ?? crew.category },
    {
      label: '인증 타입',
      value: `${daily_settlement_type} · ${SETTLEMENT_TYPE_LABEL[daily_settlement_type]}`,
    },
    { label: '마감/정산', value: `${times.deadline} / ${times.settlement}` },
    { label: '보증금', value: `${crew.deposit_amount.toLocaleString()}원` },
    { label: '총 금액', value: `${totalAmount.toLocaleString()}원` },
    { label: '인원', value: `${crew.current_participants} / ${crew.max_participants}명` },
  ];

  return (
    <div className="bg-card rounded-card overflow-hidden border border-text-secondary/10">
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`flex items-center px-4 py-3 ${i < rows.length - 1 ? 'border-b border-text-secondary/8' : ''}`}
        >
          <span className="w-24 text-xs text-text-secondary flex-shrink-0">{row.label}</span>
          <span className="text-sm font-medium text-text-primary">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
