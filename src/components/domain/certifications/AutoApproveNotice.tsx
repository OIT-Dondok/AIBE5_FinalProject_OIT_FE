"use client";

import { Clock3 } from "lucide-react";

import { InfoTooltip } from "@/components/domain/dashboard/DashboardPrimitives";

/** 자동 승인 인증 안내 콜아웃 (info 톤). 노출 조건은 호출부에서 판단한다. */
export function AutoApproveNotice() {
  return (
    <aside className="rounded-2xl bg-primary-blue/8 px-4 py-3 text-primary-blue">
      <p className="flex items-center gap-1.5 text-[13px] font-extrabold">
        <Clock3 size={15} className="shrink-0" />
        검토 확정 대기 중
        <InfoTooltip ariaLabel="자동 승인 확정 안내" placement="bottom" align="left">
          미션 종료 3일 전부터의 인증은 정산이 임박해 유예 없이 자동 승인 즉시 확정·반영돼요.
        </InfoTooltip>
      </p>
      <p className="mt-1 text-[12px] font-medium leading-relaxed text-primary-blue/90">
        자동 승인되어 &lsquo;성공&rsquo;으로 표시돼요. 방장이 3일 내 번복하지 않고 확정되면
        예상 환급금에 반영돼요.
      </p>
    </aside>
  );
}
