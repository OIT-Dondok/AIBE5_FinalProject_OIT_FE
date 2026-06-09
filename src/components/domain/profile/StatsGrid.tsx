import { ShieldCheck } from "lucide-react";

import type { ProfileStat } from "@/components/domain/profile/profileViewModel";

const statToneStyles: Record<
  ProfileStat["tone"],
  { card: string; label: string; value: string; caption: string; glow: string }
> = {
  gold: {
    card: "bg-[#FFF4D6]/70 border-[#E4C978]/40",
    label: "text-[#8A5E1E]",
    value: "text-[#2D2516]",
    caption: "text-[#8A5E1E]/75",
    glow: "bg-[#F1CA55]/25",
  },
  green: {
    card: "bg-success-green/55 border-primary-green/20",
    label: "text-primary-green",
    value: "text-[#1F3F2D]",
    caption: "text-primary-green/75",
    glow: "bg-primary-green/15",
  },
  blue: {
    card: "bg-primary-blue/10 border-primary-blue/20",
    label: "text-primary-blue",
    value: "text-[#263D85]",
    caption: "text-primary-blue/70",
    glow: "bg-primary-blue/15",
  },
  mint: {
    card: "bg-[#E8F4E3] border-primary-green/15",
    label: "text-[#4A7A5B]",
    value: "text-[#254D36]",
    caption: "text-[#4A7A5B]/75",
    glow: "bg-primary-green/10",
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

          return (
            <article
              key={stat.label}
              className={`relative overflow-hidden rounded-2xl border p-3.5 min-h-24 flex flex-col justify-between ${tone.card}`}
            >
              <span className={`absolute -right-5 -top-5 h-16 w-16 rounded-full ${tone.glow}`} />
              <span className={`relative text-[11px] font-extrabold ${tone.label}`}>
                {stat.label}
              </span>
              <strong className={`relative mt-2 text-2xl font-black tracking-tight ${tone.value}`}>
                {stat.value}
              </strong>
              <span className={`relative mt-1 text-[10px] font-medium leading-tight ${tone.caption}`}>
                {stat.caption}
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
