"use client";

import type {
  ChangeEvent,
  Dispatch,
  FormEvent,
  PointerEvent,
  SetStateAction,
} from "react";
import { useEffect, useRef, useState } from "react";
import { Calendar, Camera, Crown, Pencil } from "lucide-react";

import { Button } from "@/components/common/Button";
import {
  normalizeInitials,
  type ProfileFormState,
  type ProfileViewModel,
} from "@/components/domain/profile/profileViewModel";

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

function formatJoinedAt(isoString: string): string {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${dd}`;
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
      const computedStyle = getComputedStyle(statusMessageElement);
      const parsedLineHeight = Number.parseFloat(computedStyle.lineHeight);
      const parsedFontSize = Number.parseFloat(computedStyle.fontSize);
      const fontSize = Number.isNaN(parsedFontSize) ? 14 : parsedFontSize;
      const lineHeight = Number.isNaN(parsedLineHeight) ? fontSize * 1.5 : parsedLineHeight;
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
      className={`max-w-full bg-card rounded-card shadow-card border overflow-hidden ${
        isInlineEditing ? "border-primary-green/30" : profile.isHostEver ? "border-amber-200/60" : "border-text-secondary/10"
      }`}
      onSubmit={onInlineSave}
    >
      {profile.isHostEver && (
        <div className="h-1 bg-gradient-to-r from-yellow-400 to-amber-500" />
      )}
      <div className="px-5 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
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
                className={`relative h-20 w-20 rounded-full bg-success-green flex items-center justify-center bg-cover bg-center text-2xl font-black text-primary-green ${
                  profile.isHostEver
                    ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-card shadow-[0_0_16px_4px_rgba(251,191,36,0.30)]"
                    : "border border-primary-green/20 shadow-inner"
                } ${avatarImageUrl ? "text-transparent" : ""} ${
                  isInlineEditing && !isSaving ? "cursor-pointer transition-transform active:scale-95" : ""
                } ${isAvatarPressed ? "scale-95" : ""}`}
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

                {isInlineEditing ? (
                  <div className="absolute -right-1 -bottom-1 rounded-full border-2 border-card bg-card p-[2px] shadow-md">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-green text-white">
                      <Camera size={13} />
                    </span>
                  </div>
                ) : profile.isHostEver ? (
                  <div className="absolute -bottom-1 -right-1">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md ring-2 ring-card">
                      <Crown size={13} fill="white" className="text-white" />
                    </div>
                  </div>
                ) : null}
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
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-text-primary">{profile.nickname}</h1>
                </div>
              )}
              {profile.isHostEver && (
                <div className="relative inline-flex mt-2">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-300/40 to-amber-400/40 blur-md scale-110" />
                  <div className="relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-3.5 py-1.5 shadow-md shadow-amber-300/30">
                    <Crown size={12} fill="white" className="text-white" />
                    <span className="text-xs font-extrabold text-white tracking-wide">방장</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isInlineEditing && (
            <button
              type="button"
              onClick={onInlineEdit}
              className="p-2 -mr-2 text-text-secondary hover:text-text-primary hover:bg-text-secondary/5 rounded-full active:scale-95 transition-all shrink-0"
              aria-label="프로필 수정"
            >
              <Pencil size={18} />
            </button>
          )}
        </div>

        {isInlineEditing ? (
          <div className="mt-5 rounded-2xl bg-background/60 border border-text-secondary/10 px-4 py-3">
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
          </div>
        ) : (
          <div className="mt-5 px-1 py-1">
            <p
              ref={statusMessageRef}
              className={`break-words whitespace-pre-wrap text-sm leading-relaxed text-text-primary/90 ${
                isIntroExpanded ? "" : "line-clamp-2"
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
          </div>
        )}

        {!isInlineEditing && profile.isHostEver && (
          <div className="mt-3 flex items-center gap-1.5">
            <Crown size={12} className="text-amber-600 shrink-0" />
            <span className="text-[11px] font-medium text-amber-600">
              크루를 직접 운영한 경험이 있어요
            </span>
          </div>
        )}

        {!isInlineEditing && (
          <div className="mt-2 flex items-center gap-1.5 text-text-secondary">
            <Calendar size={13} className="shrink-0" />
            <span className="text-xs font-medium">
              {formatJoinedAt(profile.joinedAt)} 가입
            </span>
          </div>
        )}

        {isInlineEditing && (
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={onInlineCancel} fullWidth disabled={isSaving}>
              취소
            </Button>
            <Button type="submit" variant="primary-green" fullWidth disabled={isSaving}>
              {isSaving ? "저장 중" : "저장"}
            </Button>
          </div>
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
