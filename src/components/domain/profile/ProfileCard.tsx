"use client";

import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { useState } from "react";
import { Camera, Crown, Pencil } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";

import type { CrewProfileFormState, CrewProfileMock } from "@/mocks/data/profile";

export function createProfileFormState(profile: CrewProfileMock | null): CrewProfileFormState {
  return {
    initials: profile?.initials ?? "",
    avatarImageUrl: profile?.avatarImageUrl ?? null,
    nickname: profile?.nickname ?? "",
    statusMessage: profile?.statusMessage ?? "",
  };
}

export function normalizeInitials(initials: string, fallback: string) {
  const trimmed = initials.trim();
  return trimmed ? trimmed.slice(0, 2) : fallback;
}

interface ProfileCardProps {
  profile: CrewProfileMock;
  isInlineEditing: boolean;
  inlineDraft: CrewProfileFormState;
  onInlineDraftChange: Dispatch<SetStateAction<CrewProfileFormState>>;
  onInlineEdit: () => void;
  onInlineCancel: () => void;
  onInlineSave: (event: FormEvent<HTMLFormElement>) => void;
}

export function ProfileCard({
  profile,
  isInlineEditing,
  inlineDraft,
  onInlineDraftChange,
  onInlineEdit,
  onInlineCancel,
  onInlineSave,
}: ProfileCardProps) {
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
      className={`max-w-full bg-card rounded-card px-5 py-6 shadow-card border ${
        isInlineEditing ? "border-primary-green/30" : "border-text-secondary/10"
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
              &quot;{statusMessage}&quot;
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
