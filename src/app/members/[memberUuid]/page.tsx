"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Crown,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Header } from "@/components/common/Header";
import { Skeleton } from "@/components/common/Skeleton";
import { getMemberProfile } from "@/services/member";
import type { MemberPublicProfile } from "@/types/domain";

function formatJoinedAt(isoString: string): string {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${dd}`;
}

function formatPercent(value: string | null): string {
  if (!value) return "-";
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return `${(n * 100).toFixed(1)}%`;
}

function HostGrandBadge() {
  return (
    <div className="relative inline-flex">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-300/40 to-amber-400/40 blur-md scale-110" />
      <div className="relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-3.5 py-1.5 shadow-md shadow-amber-300/30">
        <Crown size={12} fill="white" className="text-white" />
        <span className="text-xs font-extrabold text-white tracking-wide">방장</span>
      </div>
    </div>
  );
}

function MemberProfileSkeleton() {
  return (
    <div className="px-5 pt-5 flex flex-col gap-5">
      <div className="bg-card rounded-card px-5 py-6 shadow-card border border-text-secondary/10">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full shrink-0" />
          <div className="flex-1 flex flex-col gap-2.5">
            <Skeleton className="h-7 w-36 rounded-xl" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        </div>
        <Skeleton className="mt-5 h-10 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-4 w-32 rounded" />
      </div>

      <div className="bg-card rounded-card p-4 shadow-card border border-text-secondary/10">
        <Skeleton className="h-5 w-20 rounded mb-3" />
        <div className="grid grid-cols-2 gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}



function ActivityStatsCard({ profile }: { profile: MemberPublicProfile }) {
  const stats = profile.activity_stats;

  type StatTone = "gold" | "green" | "blue" | "sepia";

  const statToneStyles: Record<
    StatTone,
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
    sepia: {
      card: "bg-[#F5EDE9]/70 border-[#8D6E63]/20",
      label: "text-[#8D6E63]",
      value: "text-[#3D2B25]",
      caption: "text-[#8D6E63]/75",
      glow: "bg-[#8D6E63]/15",
    },
  };

  const statItems: { label: string; value: string; caption: string; tone: StatTone }[] = [
    {
      label: "참여 크루 수",
      value: `${profile.activity_info.crew.total_crew_count}개`,
      caption: `진행 ${profile.activity_info.crew.active_crew_count} · 종료 ${profile.activity_info.crew.completed_crew_count}`,
      tone: "gold",
    },
    {
      label: "총 성공 횟수",
      value: `${stats.total_recognized_success_count}회`,
      caption: "인정된 인증 기준",
      tone: "green",
    },
    {
      label: "최고 지분율",
      value: formatPercent(stats.highest_share_ratio),
      caption: stats.highest_share_ratio_crew_title ?? "정산 완료 크루 없음",
      tone: "blue",
    },
    {
      label: "평균 성공률",
      value: formatPercent(stats.average_success_rate),
      caption: "종료 크루 평균",
      tone: "sepia",
    },
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
        {statItems.map((stat) => {
          const tone = statToneStyles[stat.tone];
          const isValueEmpty = stat.value === "-";
          const displayValue = isValueEmpty ? "정산 대기" : stat.value;

          return (
            <article
              key={stat.label}
              className={`relative overflow-hidden rounded-2xl border p-3.5 min-h-24 flex flex-col justify-between ${tone.card}`}
            >
              <span className={`absolute -right-5 -top-5 h-16 w-16 rounded-full ${tone.glow}`} />
              <span className={`relative text-[11px] font-extrabold ${tone.label}`}>
                {stat.label}
              </span>
              <strong
                className={`relative mt-2 tracking-tight ${
                  isValueEmpty
                    ? "text-sm font-bold text-text-secondary/70"
                    : "text-2xl font-black"
                } ${tone.value}`}
              >
                {displayValue}
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

export default function MemberProfilePage() {
  const params = useParams<{ memberUuid: string }>();
  const router = useRouter();
  const { memberUuid } = params;

  const [profile, setProfile] = useState<MemberPublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!memberUuid) {
      setErrorMessage("잘못된 접근입니다.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    setIsLoading(true);
    setErrorMessage(null);

    getMemberProfile(memberUuid)
      .then(({ data }) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err: { response?: { status?: number } }) => {
        if (cancelled) return;
        const status = err?.response?.status;
        if (status === 404) {
          setErrorMessage("존재하지 않는 유저예요.");
        } else {
          setErrorMessage("프로필을 불러오지 못했어요.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [memberUuid]);

  return (
    <main className="min-h-screen w-full flex flex-col items-center bg-transparent">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-12">
        <Header title="프로필" showBackButton />

        {isLoading ? (
          <MemberProfileSkeleton />
        ) : errorMessage ? (
          <div className="mt-24 flex flex-col items-center gap-3 px-4 text-text-secondary">
            <UserRound size={40} className="opacity-30" />
            <p className="text-sm font-medium">{errorMessage}</p>
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-2 px-5 py-2 rounded-button bg-card border border-text-secondary/20 text-sm font-semibold text-text-primary hover:bg-text-secondary/5 active:bg-text-secondary/10 transition-colors"
            >
              뒤로가기
            </button>
          </div>
        ) : profile ? (
          <div className="px-5 pt-5 flex flex-col gap-5">
            {/* ── 프로필 카드 ── */}
            <div
              className={`bg-card rounded-card shadow-card overflow-hidden border ${
                profile.is_host_ever ? "border-amber-200/60" : "border-text-secondary/10"
              }`}
            >
              {profile.is_host_ever && (
                <div className="h-1 bg-gradient-to-r from-yellow-400 to-amber-500" />
              )}
              <div className="px-5 py-6">
                {/* 아바타 + 닉네임 */}
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div
                      className={`h-20 w-20 rounded-full flex items-center justify-center overflow-hidden text-2xl font-black text-primary-green bg-success-green ${
                        profile.is_host_ever
                          ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-card shadow-[0_0_16px_4px_rgba(251,191,36,0.30)]"
                          : "border border-primary-green/20 shadow-inner"
                      }`}
                    >
                      {profile.profile_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profile.profile_image_url}
                          alt={`${profile.nickname} 프로필 이미지`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (Array.from(profile.nickname)[0] ?? "?")
                      )}
                    </div>
                    {profile.is_host_ever && (
                      <div className="absolute -bottom-1 -right-1">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md ring-2 ring-card">
                          <Crown size={13} fill="white" className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black tracking-tight text-text-primary">
                        {profile.nickname}
                      </h1>
                      {profile.is_host_ever && (
                        <Crown size={16} fill="currentColor" className="text-amber-500 shrink-0" />
                      )}
                    </div>
                    {profile.is_host_ever && (
                      <div className="mt-2">
                        <HostGrandBadge />
                      </div>
                    )}
                  </div>
                </div>

                {/* 자기소개 — 내 프로필과 동일하게 박스 없이 텍스트만 */}
                <div className="mt-5 px-1 py-1">
                  <p className="break-words whitespace-pre-wrap text-sm leading-relaxed text-text-primary/90">
                    {profile.status_message?.trim()
                      ? profile.status_message
                      : "자기소개를 아직 작성하지 않았어요."}
                  </p>
                </div>

                {/* 방장 경험 표시 */}
                {profile.is_host_ever && (
                  <div className="mt-3 flex items-center gap-1.5">
                    <Crown size={12} className="text-amber-600 shrink-0" />
                    <span className="text-[11px] font-medium text-amber-600">
                      크루를 직접 운영한 경험이 있어요
                    </span>
                  </div>
                )}

                {/* 가입일 */}
                <div className="mt-3 flex items-center gap-1.5 text-text-secondary">
                  <Calendar size={13} className="shrink-0" />
                  <span className="text-xs font-medium">
                    {formatJoinedAt(profile.joined_at)} 가입
                  </span>
                </div>
              </div>
            </div>

            {/* ── 활동 통계 ── */}
            <ActivityStatsCard profile={profile} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
