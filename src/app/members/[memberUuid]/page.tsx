"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Crown,
  TrendingUp,
  UserRound,
  Users,
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
        <Skeleton className="mt-5 h-16 w-full rounded-2xl" />
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

      <div className="bg-card rounded-card p-4 shadow-card border border-text-secondary/10">
        <Skeleton className="h-5 w-20 rounded mb-3" />
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityInfoCard({ profile }: { profile: MemberPublicProfile }) {
  const { crew, total_verification_count } = profile.activity_info;

  return (
    <section className="bg-card rounded-card p-4 shadow-card border border-text-secondary/10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-extrabold text-text-primary">활동 정보</h2>
          <p className="text-[11px] text-text-secondary mt-0.5">크루 참여 및 인증 현황</p>
        </div>
        <Users size={18} className="text-primary-green" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="relative overflow-hidden rounded-2xl border p-3.5 min-h-24 flex flex-col justify-between bg-[#FFF4D6]/70 border-[#E4C978]/40">
          <span className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-[#F1CA55]/25" />
          <span className="relative text-[11px] font-extrabold text-[#8A5E1E]">전체 크루</span>
          <strong className="relative mt-2 text-2xl font-black tracking-tight text-[#2D2516]">
            {crew.total_crew_count}개
          </strong>
          <span className="relative mt-1 text-[10px] font-medium leading-tight text-[#8A5E1E]/75">
            진행 {crew.active_crew_count} · 완료 {crew.completed_crew_count}
          </span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border p-3.5 min-h-24 flex flex-col justify-between bg-success-green/55 border-primary-green/20">
          <span className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-primary-green/15" />
          <span className="relative text-[11px] font-extrabold text-primary-green">총 인증 횟수</span>
          <strong className="relative mt-2 text-2xl font-black tracking-tight text-[#1F3F2D]">
            {total_verification_count}회
          </strong>
          <span className="relative mt-1 text-[10px] font-medium leading-tight text-primary-green/75">
            전체 기간 기준
          </span>
        </div>
      </div>
    </section>
  );
}

function ActivityStatsCard({ profile }: { profile: MemberPublicProfile }) {
  const stats = profile.activity_stats;
  const highestRatio = formatPercent(stats.highest_share_ratio);
  const avgRate = formatPercent(stats.average_success_rate);

  return (
    <section className="bg-card rounded-card p-4 shadow-card border border-text-secondary/10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-extrabold text-text-primary">활동 통계</h2>
          <p className="text-[11px] text-text-secondary mt-0.5">정산 완료 기준 집계 지표</p>
        </div>
        <TrendingUp size={18} className="text-primary-blue" />
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="relative overflow-hidden rounded-2xl border p-3.5 flex items-center justify-between bg-success-green/55 border-primary-green/20">
          <span className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-primary-green/15" />
          <div className="relative">
            <span className="text-[11px] font-extrabold text-primary-green block">총 인정 성공 횟수</span>
            <span className="text-[10px] font-medium text-primary-green/75 mt-0.5 block">인정된 인증 기준</span>
          </div>
          <strong className="relative text-2xl font-black tracking-tight text-[#1F3F2D]">
            {stats.total_recognized_success_count}회
          </strong>
        </div>

        {stats.highest_share_ratio && (
          <div className="relative overflow-hidden rounded-2xl border p-3.5 flex items-center justify-between bg-primary-blue/10 border-primary-blue/20">
            <span className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-primary-blue/15" />
            <div className="relative min-w-0 flex-1">
              <span className="text-[11px] font-extrabold text-primary-blue block">최고 지분율</span>
              <span className="text-[10px] font-medium text-primary-blue/70 mt-0.5 block truncate">
                {stats.highest_share_ratio_crew_title ?? "정산 완료 크루"}
              </span>
            </div>
            <strong className="relative ml-3 shrink-0 text-2xl font-black tracking-tight text-[#263D85]">
              {highestRatio}
            </strong>
          </div>
        )}

        {stats.average_success_rate && (
          <div className="relative overflow-hidden rounded-2xl border p-3.5 flex items-center justify-between bg-[#E8F4E3] border-primary-green/15">
            <span className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-primary-green/10" />
            <div className="relative">
              <span className="text-[11px] font-extrabold text-[#4A7A5B] block">평균 성공률</span>
              <span className="text-[10px] font-medium text-[#4A7A5B]/75 mt-0.5 block">종료 크루 평균</span>
            </div>
            <strong className="relative text-2xl font-black tracking-tight text-[#254D36]">
              {avgRate}
            </strong>
          </div>
        )}
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
            <div className={`bg-card rounded-card shadow-card overflow-hidden border ${profile.is_host_ever ? "border-amber-200/60" : "border-text-secondary/10"}`}>
              {profile.is_host_ever && (
                <div className="h-1 bg-gradient-to-r from-yellow-400 to-amber-500" />
              )}
              <div className="px-5 py-6">
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

                <div className="mt-5 rounded-2xl bg-background/60 border border-text-secondary/10 px-4 py-3">
                  <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-wrap break-words">
                    {profile.status_message?.trim()
                      ? profile.status_message
                      : "자기소개를 아직 작성하지 않았어요."}
                  </p>
                </div>

                {profile.is_host_ever && (
                  <div className="mt-3 flex items-center gap-1.5">
                    <Crown size={12} className="text-amber-600 shrink-0" />
                    <span className="text-[11px] font-medium text-amber-600">
                      크루를 직접 운영한 경험이 있어요
                    </span>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-1.5 text-text-secondary">
                  <Calendar size={13} className="shrink-0" />
                  <span className="text-xs font-medium">
                    {formatJoinedAt(profile.joined_at)} 가입
                  </span>
                </div>
              </div>
            </div>

            <ActivityInfoCard profile={profile} />
            <ActivityStatsCard profile={profile} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
