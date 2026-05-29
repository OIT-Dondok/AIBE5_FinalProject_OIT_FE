"use client";

import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { useState } from "react";
import {
  Camera,
  CircleDollarSign,
  Crown,
  Pencil,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { Skeleton } from "@/components/common/Skeleton";

import { mockCrewProfile } from "@/mocks/data/crew";
import type {
  CrewProfileFormState,
  CrewProfileMock,
  CrewProfileStat,
} from "@/mocks/data/crew";

const isLoading = false;

export default function ProfilePage() {
  const [profile, setProfile] = useState<CrewProfileMock | null>(mockCrewProfile);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [inlineDraft, setInlineDraft] = useState<CrewProfileFormState>(() =>
    createProfileFormState(mockCrewProfile),
  );

  if (isLoading) return <ProfileLoading />;
  if (!profile) return <ProfileEmpty />;

  const applyDraft = (draft: CrewProfileFormState) => {
    setProfile((current) => {
      if (!current) return current;

      return {
        ...current,
        initials: normalizeInitials(draft.initials, current.initials),
        avatarImageUrl: draft.avatarImageUrl,
        nickname: draft.nickname.trim() || current.nickname,
        statusMessage: draft.statusMessage.trim() || null,
      };
    });
  };

  const openInlineEditor = () => {
    setInlineDraft(createProfileFormState(profile));
    setIsInlineEditing(true);
  };

  const handleInlineSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyDraft(inlineDraft);
    setIsInlineEditing(false);
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
        <Header title="프로필" showBackButton rightElement={<SettingsButton />} />

        <div className="px-5 pt-5 flex flex-col gap-5">
          <ProfileCard
            profile={profile}
            isInlineEditing={isInlineEditing}
            inlineDraft={inlineDraft}
            onInlineDraftChange={setInlineDraft}
            onInlineEdit={openInlineEditor}
            onInlineCancel={() => setIsInlineEditing(false)}
            onInlineSave={handleInlineSave}
          />
          <StatsGrid stats={profile.stats} />
        </div>
      </div>
    </main>
  );
}

function SettingsButton() {
  return (
    <button
      type="button"
      aria-label="프로필 설정"
      className="p-1 -mr-1 rounded-full text-text-secondary hover:text-text-primary active:scale-95 transition-all"
    >
      <Settings size={22} />
    </button>
  );
}

function ProfileCard({
  profile,
  isInlineEditing,
  inlineDraft,
  onInlineDraftChange,
  onInlineEdit,
  onInlineCancel,
  onInlineSave,
}: {
  profile: CrewProfileMock;
  isInlineEditing: boolean;
  inlineDraft: CrewProfileFormState;
  onInlineDraftChange: Dispatch<SetStateAction<CrewProfileFormState>>;
  onInlineEdit: () => void;
  onInlineCancel: () => void;
  onInlineSave: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [isIntroExpanded, setIsIntroExpanded] = useState(false);
  const statusMessage = profile.statusMessage?.trim() || "상태 메시지가 아직 없습니다.";
  const avatarImageUrl = isInlineEditing ? inlineDraft.avatarImageUrl : profile.avatarImageUrl;
  const avatarInitials = isInlineEditing
    ? normalizeInitials(inlineDraft.initials, profile.initials)
    : profile.initials;

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") return;

      onInlineDraftChange((current) => ({
        ...current,
        avatarImageUrl: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  };

  return (
    <form
      className={`max-w-full bg-card rounded-card px-5 py-6 shadow-[0_2px_12px_rgba(34,34,34,0.06)] border ${
        isInlineEditing ? "border-primary-green/20" : "border-white/70"
      }`}
      onSubmit={onInlineSave}
    >
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {isInlineEditing ? (
            <>
              <input
                id="profile-avatar-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarFileChange}
              />
              <label
                htmlFor="profile-avatar-upload"
                className={`relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-primary-green/20 bg-success-green bg-cover bg-center text-2xl font-black text-primary-green shadow-inner transition hover:brightness-95 active:scale-95 ${
                  avatarImageUrl ? "text-transparent" : ""
                }`}
                aria-label="프로필 이미지 수정"
              >
                {avatarImageUrl ? (
                  <AvatarImage
                    src={avatarImageUrl}
                    alt={`${profile.nickname} 프로필 이미지`}
                  />
                ) : (
                  avatarInitials
                )}
              </label>
              <label
                htmlFor="profile-avatar-upload"
                className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-card bg-primary-green text-white shadow-md transition active:scale-95"
                aria-label="프로필 이미지 수정"
              >
                <Camera size={15} />
              </label>
            </>
          ) : (
            <div
              className={`relative h-20 w-20 overflow-hidden rounded-full bg-success-green border border-primary-green/20 flex items-center justify-center bg-cover bg-center text-2xl font-black text-primary-green shadow-inner ${
                avatarImageUrl ? "text-transparent" : ""
              }`}
            >
              {avatarImageUrl ? (
                <AvatarImage
                  src={avatarImageUrl}
                  alt={`${profile.nickname} 프로필 이미지`}
                />
              ) : (
                avatarInitials
              )}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {isInlineEditing ? (
            <input
              aria-label="닉네임"
              value={inlineDraft.nickname}
              onChange={(event) =>
                onInlineDraftChange({ ...inlineDraft, nickname: event.target.value })
              }
              className="w-full rounded-xl border border-primary-green/20 bg-background/60 px-3 py-2 text-2xl font-black tracking-tight text-text-primary outline-none transition focus:border-primary-green focus:bg-card"
              placeholder={profile.nickname}
            />
          ) : (
            <h1 className="text-2xl font-black tracking-tight text-text-primary">
              {profile.nickname}
            </h1>
          )}
          {profile.isHostEver && (
            <Badge className="mt-2 shrink-0">
              <Crown size={12} className="mr-1" fill="currentColor" />
              방장 {profile.hostedCrewCount}회
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-background/60 border border-text-secondary/10 px-4 py-3">
        {isInlineEditing ? (
          <textarea
            aria-label="자기소개"
            value={inlineDraft.statusMessage}
            onChange={(event) =>
              onInlineDraftChange({ ...inlineDraft, statusMessage: event.target.value })
            }
            className="min-h-28 w-full resize-none bg-transparent text-sm leading-relaxed text-text-secondary outline-none placeholder:text-text-secondary/50"
            placeholder="오늘도 한 걸음씩, 어제보다 조금 더."
          />
        ) : (
          <>
            <p
              className={`break-words text-sm leading-relaxed text-text-secondary ${
                isIntroExpanded ? "" : "line-clamp-2"
              }`}
              title={statusMessage}
            >
              “{statusMessage}”
            </p>
            <button
              type="button"
              className="mt-2 text-xs font-extrabold text-primary-green hover:text-primary-green/80 active:scale-95 transition"
              aria-expanded={isIntroExpanded}
              onClick={() => setIsIntroExpanded((current) => !current)}
            >
              {isIntroExpanded ? "말줄임으로 보기" : "전체 보기"}
            </button>
          </>
        )}
      </div>

      <div className={isInlineEditing ? "mt-5 grid grid-cols-2 gap-2" : "mt-5"}>
        {isInlineEditing ? (
          <>
            <Button type="button" variant="outline" onClick={onInlineCancel} fullWidth>
              취소
            </Button>
            <Button type="submit" variant="primary-green" fullWidth>
              저장
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            fullWidth
            className="bg-background/40"
            onClick={onInlineEdit}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Pencil size={15} />
              프로필 편집
            </span>
          </Button>
        )}
      </div>
    </form>
  );
}

function AvatarImage({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 로컬 파일 미리보기 data URL을 즉시 표시합니다.
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full rounded-full object-cover"
    />
  );
}

function createProfileFormState(profile: CrewProfileMock | null): CrewProfileFormState {
  return {
    initials: profile?.initials ?? "",
    avatarImageUrl: profile?.avatarImageUrl ?? null,
    nickname: profile?.nickname ?? "",
    statusMessage: profile?.statusMessage ?? "",
  };
}

function normalizeInitials(initials: string, fallback: string) {
  const trimmed = initials.trim();
  return trimmed ? trimmed.slice(0, 2) : fallback;
}

function StatsGrid({ stats }: { stats: CrewProfileStat[] }) {
  const filledStats: CrewProfileStat[] = stats.length
    ? stats
    : [
        { label: "참여 크루 수", value: "-", caption: "데이터 없음", tone: "neutral" },
        { label: "총 성공 횟수", value: "-", caption: "데이터 없음", tone: "neutral" },
        { label: "최고 지분율", value: "-", caption: "데이터 없음", tone: "neutral" },
        { label: "평균 성공률", value: "-", caption: "데이터 없음", tone: "neutral" },
      ];

  return (
    <section className="bg-card rounded-card p-4 shadow-[0_2px_12px_rgba(34,34,34,0.05)] border border-white/70">
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

const statToneStyles: Record<CrewProfileStat["tone"], {
  card: string;
  label: string;
  value: string;
  caption: string;
  glow: string;
}> = {
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

function ProfileLoading() {
  return (
    <main className="min-h-screen flex justify-center">
      <div className="w-full max-w-[430px] pb-8">
        <Header title="프로필" showBackButton rightElement={<SettingsButton />} />
        <div className="px-5 pt-5 flex flex-col gap-5">
          <section className="bg-card rounded-card p-5 shadow-sm">
            <div className="flex gap-4">
              <Skeleton variant="circle" width={80} height={80} />
              <div className="flex-1 pt-2">
                <Skeleton variant="text" width="55%" height={24} />
                <Skeleton variant="text" width="85%" height={14} className="mt-4" />
                <Skeleton variant="text" width="70%" height={14} className="mt-2" />
              </div>
            </div>
            <Skeleton variant="rect" width="100%" height={44} className="mt-5 rounded-button" />
          </section>
          <section className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} variant="rect" width="100%" height={96} className="rounded-2xl" />
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}

function ProfileEmpty() {
  return (
    <main className="min-h-screen flex justify-center">
      <div className="w-full max-w-[430px] pb-8">
        <Header title="프로필" showBackButton rightElement={<SettingsButton />} />
        <div className="px-5 pt-12">
          <section className="bg-card rounded-card shadow-sm border border-white/70">
            <EmptyState
              icon={<CircleDollarSign className="mx-auto text-primary-green" size={48} />}
              title="프로필 정보가 없습니다"
              description="목업 데이터가 비어 있어 공개 프로필 빈 상태를 표시합니다."
            />
          </section>
        </div>
      </div>
    </main>
  );
}
