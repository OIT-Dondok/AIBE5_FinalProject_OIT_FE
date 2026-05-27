import { CheckCircle2, TrendingUp, Wallet, ArrowRight } from 'lucide-react';

export default function Home() {
  return (

      <main className="min-h-screen bg-background flex flex-col items-center justify-start px-4 py-8">

        {/* 최대 너비 430px 대응 wrapper (모바일 최적화 규격) */}
        <div className="w-full max-w-[430px] flex flex-col gap-6">

          {/* 상단 타이틀 영역: 가독성 중심의 미니멀한 구성 */}
          <header className="py-4">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              조용히 성취감 있는 습관
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              성실함이 축적되는 공간, 돈독
            </p>
          </header>

          {/* 2. 카드형 레이아웃: 토스/당근 스타일의 흰색 카드 (--color-card, --radius-card) */}
          <section className="bg-card rounded-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-text-primary">나의 크루 현황</h2>
              {/* 아이콘 가이드: 둥근 라인 2px 스트로크 유지 */}
              <TrendingUp className="text-primary-green" strokeWidth={2} size={20} />
            </div>

            <div className="border-t border-background my-2" />

            {/* 지분율 변화 및 성장 시각화 샘플 */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">아침 기상 챌린지</span>
                <span className="font-bold text-primary-green">달성률 85%</span>
              </div>
              {/* 게이지 바: Primary Green 적용 */}
              <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                <div className="bg-primary-green h-full w-[85%] transition-all duration-500" />
              </div>
            </div>
          </section>

          {/* 3. 성공 상태 표시: Success Green 컬러 적용 (--color-success-green) */}
          <section className="bg-success-green/40 border border-success-green rounded-card p-5 flex items-center gap-3">
            <CheckCircle2 className="text-primary-green" strokeWidth={2} size={22} />
            <div>
              <p className="text-sm font-semibold text-text-primary">오늘의 미션 인증 완료!</p>
              <p className="text-xs text-text-secondary mt-0.5">조용한 성취감이 축적되고 있습니다.</p>
            </div>
          </section>

          {/* 4. 강조 정보 및 CTA 영역: Primary Blue 및 버튼 곡률 적용 */}
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1 text-xs text-text-secondary">
              <Wallet size={14} strokeWidth={2} />
              <span>정산 예정 데이터가 동기화되었습니다.</span>
            </div>

            {/* 주요 행동 버튼: Primary Blue 강조 */}
            <button className="w-full bg-primary-blue text-white font-semibold py-4 rounded-button flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all shadow-md shadow-primary-blue/10">
              새로운 크루 탐색하기
              <ArrowRight size={18} strokeWidth={2} />
            </button>
          </div>

        </div>
      </main>
  );
}