"use client";

import { useId, useState } from "react";
import { ChevronDown, Clock3 } from "lucide-react";

/** 자동 승인 인증 안내 (info 톤, 접이식). 노출 조건은 호출부에서 판단한다. */
export function AutoApproveNotice() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <aside className="rounded-2xl bg-primary-blue/8 text-primary-blue">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-1.5 px-4 py-3 text-left text-[13px] font-extrabold"
      >
        <Clock3 size={15} className="shrink-0" />
        검토 확정 대기 중
        <ChevronDown
          size={16}
          className={`ml-auto shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id={panelId}
          className="px-4 pb-3 text-[12px] font-medium leading-relaxed text-primary-blue/90"
        >
          <p>
            자동 승인되어 &lsquo;성공&rsquo;으로 표시돼요. 방장이 3일 내 번복하지 않고 확정되면
            예상 환급금에 반영돼요.
          </p>
          <p className="mt-1.5">
            · 미션 종료 3일 전부터의 인증은 정산이 임박해 유예 없이 자동 승인 즉시 확정·반영돼요.
          </p>
        </div>
      )}
    </aside>
  );
}
