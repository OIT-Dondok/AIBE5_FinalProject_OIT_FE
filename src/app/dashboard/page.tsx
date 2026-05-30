// TODO: 대시보드 구현 후 교체
import { EmptyState } from "@/components/common/EmptyState";

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <EmptyState
        icon="📊"
        title="대시보드 준비 중입니다"
        description="곧 다양한 통계와 인사이트를 제공할 예정이에요"
      />
    </div>
  );
}
