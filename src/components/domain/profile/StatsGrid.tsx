import { ShieldCheck } from "lucide-react";

import type { ProfileStat } from "@/components/domain/profile/profileViewModel";

const statToneStyles: Record<
  ProfileStat["tone"],
  { card: string; label: string; value: string; caption: string; glow: string }
> = {
  gold: {
    card: "bg-[#FBF4DC]/70 border-[#D4AF37]/40",
    label: "text-[#7A6010]",
    value: "text-[#2D2200]",
    caption: "text-[#7A6010]/75",
    glow: "bg-[#D4AF37]/25",
  },
  green: {
    card: "bg-[#E8F5E9]/70 border-[#2E7D32]/20",
    label: "text-[#2E7D32]",
    value: "text-[#1A3B1C]",
    caption: "text-[#2E7D32]/75",
    glow: "bg-[#2E7D32]/15",
  },
  blue: {
    card: "bg-[#E3EEF9]/70 border-[#1565C0]/20",
    label: "text-[#1565C0]",
    value: "text-[#0A2F6E]",
    caption: "text-[#1565C0]/70",
    glow: "bg-[#1565C0]/15",
  },
  mint: {
    card: "bg-[#F5EDE9]/70 border-[#8D6E63]/20",
    label: "text-[#8D6E63]",
    value: "text-[#3D2B25]",
    caption: "text-[#8D6E63]/75",
    glow: "bg-[#8D6E63]/15",
  },
  neutral: {
    card: "bg-background/65 border-text-secondary/10",
    label: "text-text-secondary",
    value: "text-text-primary",
    caption: "text-text-secondary",
    glow: "bg-text-secondary/5",
  },
};

interface StatsGridProps {
  stats: ProfileStat[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  const filledStats: ProfileStat[] = stats.length
    ? stats
    : [
        { label: "참여 크루 수", value: "-", caption: "데이터 없음", tone: "neutral" },
        { label: "총 성공 횟수", value: "-", caption: "데이터 없음", tone: "neutral" },
        { label: "최고 지분율", value: "-", caption: "데이터 없음", tone: "neutral" },
        { label: "평균 성공률", value: "-", caption: "데이터 없음", tone: "neutral" },
      ];

  const hasNoRecord = filledStats.some(
    (s) => (s.label === "최고 지분율" || s.label === "평균 성공률") && s.value === "-"
  );

  return (
    <section className="bg-card rounded-card p-4 shadow-card border border-text-secondary/10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-extrabold text-text-primary">활동 통계</h2>
          <p className="text-[11px] text-text-secondary mt-0.5">공개 프로필에 표시되는 요약 지표</p>
        </div>
        <ShieldCheck size={18} className="text-primary-green" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {filledStats.map((stat) => {
          const tone = statToneStyles[stat.tone];
          const isValueEmpty = stat.value === "-";
          const displayValue = isValueEmpty ? "정산 대기" : stat.value;
          const displayCaption = isValueEmpty ? "첫 정산 시 공개" : stat.caption;

          return (
            <article
              key={stat.label}
              className={`relative overflow-hidden rounded-2xl border p-3.5 min-h-24 flex flex-col justify-between ${tone.card}`}
            >
              <span className={`absolute -right-5 -top-5 h-16 w-16 rounded-full ${tone.glow}`} />
              <span className={`relative text-[11px] font-extrabold ${tone.label}`}>
                {stat.label}
              </span>
              <strong className={`relative mt-2 tracking-tight ${
                isValueEmpty
                  ? "text-sm font-bold text-text-secondary/70"
                  : "text-2xl font-black"
              } ${tone.value}`}>
                {displayValue}
              </strong>
              <span className={`relative mt-1 text-[10px] font-medium leading-tight ${tone.caption}`}>
                {displayCaption}
              </span>
            </article>
          );
        })}
      </div>

      {hasNoRecord && (
        <div className="mt-3.5 flex items-center justify-center p-3 rounded-2xl bg-primary-green/5 border border-primary-green/10 text-center">
          <p className="text-xs font-semibold text-[#426E51]">
            첫 크루를 정산하고 나만의 활동 기록을 쌓아보세요! 🌱
          </p>
        </div>
      )}
    </section>
  );
}
