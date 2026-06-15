"use client";

import type {
  ChangeEvent,
  Dispatch,
  FormEvent,
  PointerEvent,
  SetStateAction,
} from "react";
import { useEffect, useRef, useState } from "react";
import { Camera, Crown, Pencil } from "lucide-react";

import { Button } from "@/components/common/Button";
import {
  normalizeInitials,
  type ProfileFormState,
  type ProfileViewModel,
} from "@/components/domain/profile/profileViewModel";
import { HostBadge } from "@/components/common/HostBadge";

interface ProfileCardProps {
  profile: ProfileViewModel;
  isInlineEditing: boolean;
  inlineDraft: ProfileFormState;
  isSaving?: boolean;
  onInlineDraftChange: Dispatch<SetStateAction<ProfileFormState>>;
  onProfileImageUpload: (file: File) => Promise<void>;
  onInlineEdit: () => void;
  onInlineCancel: () => void;
  onInlineSave: (event: FormEvent<HTMLFormElement>) => void;
}

export function ProfileCard({
  profile,
  isInlineEditing,
  inlineDraft,
  isSaving = false,
  onInlineDraftChange,
  onProfileImageUpload,
  onInlineEdit,
  onInlineCancel,
  onInlineSave,
}: ProfileCardProps) {
  const [isIntroExpanded, setIsIntroExpanded] = useState(false);
  const [isIntroOverflowing, setIsIntroOverflowing] = useState(false);
  const [isAvatarPressed, setIsAvatarPressed] = useState(false);
  const avatarImageInputRef = useRef<HTMLInputElement>(null);
  const statusMessageRef = useRef<HTMLParagraphElement>(null);
  const statusMessage = profile.statusMessage;
  const statusMessageForDisplay =
    statusMessage && statusMessage.trim().length > 0
      ? statusMessage
      : "프로필 상태를 입력해 주세요.";
  const avatarImageUrl = isInlineEditing ? inlineDraft.avatarImageUrl : profile.avatarImageUrl;
  const avatarInitials = isInlineEditing ? inlineDraft.initials : profile.initials;

  useEffect(() => {
    const statusMessageElement = statusMessageRef.current;

    if (!statusMessageElement || isInlineEditing) {
      setIsIntroOverflowing(false);
      return;
    }

    const updateOverflowState = () => {
      const lineHeight = Number.parseFloat(getComputedStyle(statusMessageElement).lineHeight);
      const collapsedHeight = lineHeight * 2;

      setIsIntroOverflowing(statusMessageElement.scrollHeight > collapsedHeight + 1);
    };

    setIsIntroExpanded(false);
    updateOverflowState();

    const resizeObserver = new ResizeObserver(updateOverflowState);
    resizeObserver.observe(statusMessageElement);

    return () => resizeObserver.disconnect();
  }, [isInlineEditing, statusMessageForDisplay]);

  const openAvatarImagePicker = () => {
    if (!isInlineEditing || isSaving) return;
    avatarImageInputRef.current?.click();
  };

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    void onProfileImageUpload(file);
    event.currentTarget.value = "";
  };

  const handleAvatarPress = () => {
    if (!isInlineEditing || isSaving) return;
    setIsAvatarPressed(true);
  };

  const handleAvatarPressRelease = (_: PointerEvent<HTMLDivElement>) => {
    if (!isInlineEditing || isSaving) return;
    setIsAvatarPressed(false);
  };

  return (
    <form
      className={`max-w-full bg-card rounded-card px-5 py-6 shadow-card border ${isInlineEditing ? "border-primary-green/30" : "border-text-secondary/10"
        }`}
      onSubmit={onInlineSave}
    >
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <input
            ref={avatarImageInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleAvatarFileChange}
            onClick={(event) => {
              if (isSaving) event.preventDefault();
            }}
            disabled={isSaving}
            aria-label="프로필 이미지 파일 선택"
          />
          <div
            className={`relative h-20 w-20 rounded-full bg-success-green border border-primary-green/20 flex items-center justify-center bg-cover bg-center text-2xl font-black text-primary-green shadow-inner ${avatarImageUrl ? "text-transparent" : ""
              } ${isInlineEditing && !isSaving ? "cursor-pointer transition-transform active:scale-95" : ""} ${isAvatarPressed ? "scale-95" : ""}`}
            onClick={openAvatarImagePicker}
            onPointerDown={handleAvatarPress}
            onPointerUp={handleAvatarPressRelease}
            onPointerLeave={handleAvatarPressRelease}
            onPointerCancel={handleAvatarPressRelease}
            role={isInlineEditing ? "button" : undefined}
            tabIndex={isInlineEditing ? 0 : -1}
            aria-label={isInlineEditing ? "프로필 이미지 수정" : undefined}
            aria-disabled={!isInlineEditing || isSaving}
            onKeyDown={(event) => {
              if (!isInlineEditing || isSaving) return;

              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openAvatarImagePicker();
              }
            }}
          >
            {avatarImageUrl ? (
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <AvatarImage src={avatarImageUrl} alt={`${profile.nickname} 프로필 이미지`} />
              </div>
            ) : (
              avatarInitials
            )}

            {isInlineEditing && (
              <div className="absolute -right-1 -bottom-1 rounded-full border-2 border-card bg-card p-[2px] shadow-md">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-green text-white">
                  <Camera size={13} />
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {isInlineEditing ? (
            <input
              aria-label="닉네임"
              value={inlineDraft.nickname}
              onChange={(event) =>
                onInlineDraftChange({
                  ...inlineDraft,
                  nickname: event.target.value,
                  initials: normalizeInitials(event.target.value, inlineDraft.initials),
                })
              }
              className="w-full rounded-xl border border-primary-green/20 bg-background/60 px-3 py-2 text-2xl font-black tracking-tight text-text-primary outline-none transition focus:border-primary-green focus:bg-card"
              placeholder={profile.nickname}
              disabled={isSaving}
            />
          ) : (
            <h1 className="text-2xl font-black tracking-tight text-text-primary">{profile.nickname}</h1>
          )}
          {profile.isHostEver && (
            <HostBadge count={profile.hostedCrewCount} className="mt-2 shrink-0" />
          )}
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-background/60 border border-text-secondary/10 px-4 py-3">
        {isInlineEditing ? (
          <textarea
            aria-label="상태 메시지"
            value={inlineDraft.statusMessage}
            onChange={(event) =>
              onInlineDraftChange({ ...inlineDraft, statusMessage: event.target.value })
            }
            className="min-h-28 w-full resize-none bg-transparent text-sm leading-relaxed text-text-secondary outline-none placeholder:text-text-secondary/50"
            placeholder="예) 자기소개를 남겨두세요"
            disabled={isSaving}
          />
        ) : (
          <>
            <p
              ref={statusMessageRef}
              className={`break-words whitespace-pre-wrap text-sm leading-relaxed text-text-secondary ${isIntroExpanded ? "" : "line-clamp-2"
                }`}
              title={statusMessageForDisplay}
            >
              {statusMessageForDisplay}
            </p>
            {isIntroOverflowing && (
              <button
                type="button"
                className="mt-2 text-xs font-extrabold text-primary-green hover:text-primary-green/80 active:scale-95 transition"
                aria-expanded={isIntroExpanded}
                onClick={() => setIsIntroExpanded((current) => !current)}
              >
                {isIntroExpanded ? "접기" : "더 보기"}
              </button>
            )}
          </>
        )}
      </div>

      <div className={isInlineEditing ? "mt-5 grid grid-cols-2 gap-2" : "mt-5"}>
        {isInlineEditing ? (
          <>
            <Button type="button" variant="outline" onClick={onInlineCancel} fullWidth disabled={isSaving}>
              취소
            </Button>
            <Button type="submit" variant="primary-green" fullWidth disabled={isSaving}>
              {isSaving ? "저장 중" : "저장"}
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
              수정하기
            </span>
          </Button>
        )}
      </div>
    </form>
  );
}

function AvatarImage({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Keep current image rendering path for backend-provided profile URLs.
    <img src={src} alt={alt} className="absolute inset-0 h-full w-full rounded-full object-cover" />
  );
}
