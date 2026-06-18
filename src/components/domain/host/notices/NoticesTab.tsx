"use client";

import { useParams, useRouter } from "next/navigation";
import { Megaphone, Pencil, ArrowRight } from "lucide-react";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";

export function NoticesTab() {
  const params = useParams<{ crewId: string }>();
  const router = useRouter();
  const crewId = parseRouteNumber(params.crewId);

  if (crewId === null) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card border border-text-secondary/10 rounded-2xl text-center shadow-sm">
        <p className="text-sm font-semibold text-text-secondary">크루 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="px-1 py-2">
      <div className="flex flex-col items-center text-center bg-card border border-text-secondary/10 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* 메가폰 브랜딩 데코레이션 */}
        <div className="w-14 h-14 rounded-2xl bg-[#4D73D9]/10 flex items-center justify-center text-[#4D73D9] mb-5 animate-pulse">
          <Megaphone size={28} strokeWidth={2.3} />
        </div>

        {/* 안내 텍스트 */}
        <h2 className="text-base font-extrabold text-text-primary mb-2">공지사항 관리 안내</h2>
        <p className="text-xs sm:text-sm font-medium leading-relaxed text-text-secondary/80 max-w-[290px] sm:max-w-sm mb-6">
          공지사항은 피드에서 크루원들과 함께 확인하고 소통하실 수 있습니다. 
          이곳 방장 콘솔에서는 새로운 공지를 올리거나 피드로 바로 이동하여 소통해 보세요!
        </p>

        {/* 콜투액션(CTA) 버튼 그룹 */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            type="button"
            onClick={() => router.push(`/crews/${crewId}/host-console/notices/new`)}
            className="w-full py-3.5 text-xs sm:text-sm font-bold text-white bg-[#4D73D9] hover:bg-[#3B5FBE] rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#4D73D9]/15"
          >
            <Pencil size={14} strokeWidth={2.5} />
            새 공지 작성하기
          </button>
          
          <button
            type="button"
            onClick={() => router.push("/feed?tab=notice")}
            className="w-full py-3.5 text-xs sm:text-sm font-bold text-text-primary bg-slate-100/80 hover:bg-slate-200/80 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-slate-200/40"
          >
            전체 공지 피드 보러가기
            <ArrowRight size={14} strokeWidth={2.5} className="text-text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
}
