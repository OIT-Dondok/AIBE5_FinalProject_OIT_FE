import { ShieldCheck } from "lucide-react";

import type { HostCrewDetailMock } from "@/mocks/data/host";

export function HostSummaryCard({ crewDetail }: { crewDetail: HostCrewDetailMock }) {
  return (
    <section className="rounded-[20px] bg-[linear-gradient(135deg,#5d7fe3_0%,#6486ea_45%,#5f81e6_100%)] px-4 py-3.5 text-white shadow-card">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-6 shrink-0 items-center justify-center text-white">
          <ShieldCheck size={20} strokeWidth={2.4} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-extrabold leading-tight text-white">방장 · {crewDetail.title}</p>
          <p className="mt-1 text-xs font-semibold leading-tight text-white/90">
            다음 정산까지 <span className="font-extrabold text-white">3시간 14분</span>
          </p>
        </div>
      </div>
    </section>
  );
}
