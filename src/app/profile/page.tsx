"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { CircleAlert, CheckCircle2 } from "lucide-react";

import { Header } from "@/components/common/Header";
import { ProfileCard } from "@/components/domain/profile/ProfileCard";
import { ProfileEmpty } from "@/components/domain/profile/ProfileEmpty";
import { ProfileLoading } from "@/components/domain/profile/ProfileLoading";
import { ProfileMenuSections } from "@/components/domain/profile/ProfileMenuSections";
import { ProfileSettingsSheet } from "@/components/domain/profile/ProfileSettingsSheet";
import {
  applyProfileUpdateResponse,
  buildProfileViewModel,
  createProfileFormState,
  createProfileUpdatePayload,
  type ProfileFormState,
  type ProfileViewModel,
} from "@/components/domain/profile/profileViewModel";
import { StatsGrid } from "@/components/domain/profile/StatsGrid";
import {
  getMyActivitySummary,
  getMyHostOperationSummary,
  getMyProfile,
  requestProfileImageUploadUrl,
  updateMyProfile,
} from "@/services/profile";
import type { MeActivitySummaryResponse } from "@/types/domain";

type FeedbackTone = "success" | "error";

type ProfileImageFeedback = {
  message: string;
  tone: FeedbackTone;
  isOpen: boolean;
};

type ProfilePageData = {
  profile: ProfileViewModel;
  activitySummary: MeActivitySummaryResponse;
};

const MAX_PROFILE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_MIME_TYPES = new Set(["image/jpeg"]);
const PROFILE_IMAGE_MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

function normalizeExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.trim().toLowerCase();
  return extension ? extension.replace(/[^a-z0-9]/g, "") : null;
}

function resolveProfileImageMimeType(file: File): string | null {
  if (file.type && ALLOWED_PROFILE_IMAGE_MIME_TYPES.has(file.type)) {
    return file.type;
  }

  const extension = normalizeExtension(file.name);
  if (!extension) return null;

  return PROFILE_IMAGE_MIME_BY_EXTENSION[extension] ?? null;
}

function validateProfileImage(file: File): string | null {
  if (!file.size) {
    return "선택한 프로필 이미지 파일 크기가 0바이트입니다.";
  }

  if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
    return `프로필 이미지는 최대 5MB까지만 업로드할 수 있습니다. (현재 ${Math.ceil(file.size / 1024 / 1024)}MB)`;
  }

  const contentType = resolveProfileImageMimeType(file);
  if (!contentType) {
    return "프로필 이미지 형식은 JPG만 지원됩니다.";
  }

  return null;
}

function ProfileUploadToast({
  isOpen,
  onClose,
  tone,
  message,
  duration = 2600,
}: {
  isOpen: boolean;
  onClose: () => void;
  tone: FeedbackTone;
  message: string;
  duration?: number;
}) {
  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  const icon =
    tone === "error" ? (
      <CircleAlert size={18} className="text-red-200 stroke-[2.5]" />
    ) : (
      <CheckCircle2 size={18} className="text-emerald-100 stroke-[2.5]" />
    );
  const backgroundClass = tone === "error" ? "bg-rose-500/90" : "bg-neutral-900/90";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-0 right-0 z-[90] flex justify-center px-4 pointer-events-none"
    >
      <div
        className={`pointer-events-auto w-full max-w-[380px] px-4 py-3 rounded-button flex items-center gap-2.5 shadow-lg ${
          backgroundClass
        } backdrop-blur-sm text-white animate-in slide-in-from-bottom-4 fade-in duration-300`}
      >
        {icon}
        <span className="text-xs font-semibold tracking-tight">
          {tone === "error" ? "실패: " : "성공: "}
          {message}
        </span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [pageData, setPageData] = useState<ProfilePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<ProfileImageFeedback | null>(null);
  const [inlineDraft, setInlineDraft] = useState<ProfileFormState>(() =>
    createProfileFormState(null),
  );

  useEffect(() => {
    let isMounted = true;

    const fetchProfilePageData = async () => {
      setIsLoading(true);
      setLoadErrorMessage(null);

      try {
        const [profileResponse, activitySummaryResponse] = await Promise.all([
          getMyProfile(),
          getMyActivitySummary(),
        ]);

        let hostOperationPendingCount = 0;

        if (profileResponse.data.is_host_ever) {
          try {
            const hostSummaryResponse = await getMyHostOperationSummary();
            hostOperationPendingCount = hostSummaryResponse.data.total_pending_count;
          } catch {
            hostOperationPendingCount = 0;
          }
        }

        if (!isMounted) return;

        setPageData({
          profile: buildProfileViewModel(
            profileResponse.data,
            activitySummaryResponse.data,
            hostOperationPendingCount,
          ),
          activitySummary: activitySummaryResponse.data,
        });
      } catch {
        if (!isMounted) return;
        setLoadErrorMessage("프로필 정보를 불러오지 못했습니다.");
        setPageData(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void fetchProfilePageData();

    return () => {
      isMounted = false;
    };
  }, []);

  const openInlineEditor = () => {
    setSaveErrorMessage(null);
    setInlineDraft(createProfileFormState(pageData?.profile ?? null));
    setIsInlineEditing(true);
  };

  const closeFeedbackToast = () => {
    setFeedbackToast((previous) => (previous ? { ...previous, isOpen: false } : null));
  };

  const showFeedbackToast = (message: string, tone: FeedbackTone = "error") => {
    setFeedbackToast({ isOpen: true, message, tone });
  };

  const handleProfileImageUpload = async (file: File) => {
    if (!isInlineEditing) return;

    const validateMessage = validateProfileImage(file);
    if (validateMessage) {
      setSaveErrorMessage(validateMessage);
      showFeedbackToast(validateMessage, "error");
      return;
    }

    const contentType = resolveProfileImageMimeType(file);
    if (!contentType) {
      const message = "프로필 이미지 형식은 JPG만 지원됩니다.";
      setSaveErrorMessage(message);
      showFeedbackToast(message, "error");
      return;
    }

    setIsUploadingAvatar(true);
    setSaveErrorMessage(null);

    try {
      const presignedUrlResponse = await requestProfileImageUploadUrl({
        purpose: "PROFILE_IMAGE",
        content_type: contentType,
        content_length: file.size,
      });

      const uploadResponse = await fetch(presignedUrlResponse.data.upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`업로드 요청 실패: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const imagePreviewUrl = URL.createObjectURL(file);

      setInlineDraft((current) => {
        if (current.avatarImageUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(current.avatarImageUrl);
        }

        return {
          ...current,
          avatarImageUrl: imagePreviewUrl,
          avatarImageS3Key: presignedUrlResponse.data.s3_key,
        };
      });

      showFeedbackToast("프로필 이미지 업로드가 완료되었습니다.", "success");
    } catch {
      const message = "프로필 이미지 업로드에 실패했습니다.";
      setSaveErrorMessage(message);
      showFeedbackToast(message, "error");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleInlineSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!pageData) return;

    if (!inlineDraft.nickname.trim()) {
      const message = "닉네임을 입력해 주세요.";
      setSaveErrorMessage(message);
      showFeedbackToast(message, "error");
      return;
    }

    setIsSaving(true);
    setSaveErrorMessage(null);

    try {
      const response = await updateMyProfile(createProfileUpdatePayload(inlineDraft));
      setPageData((current) => {
        if (!current) return current;

        return {
          ...current,
          profile: applyProfileUpdateResponse(current.profile, response.data),
        };
      });
      setIsInlineEditing(false);
      showFeedbackToast("프로필이 저장되었습니다.", "success");
    } catch {
      const message = "프로필 수정에 실패했습니다. 입력 값을 확인해 주세요.";
      setSaveErrorMessage(message);
      showFeedbackToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInlineCancel = () => {
    if (inlineDraft.avatarImageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(inlineDraft.avatarImageUrl);
    }

    setSaveErrorMessage(null);
    setInlineDraft(createProfileFormState(pageData?.profile ?? null));
    setIsInlineEditing(false);
  };

  if (isLoading) return <ProfileLoading />;
  if (!pageData) return <ProfileEmpty message={loadErrorMessage ?? undefined} />;

  const { profile, activitySummary } = pageData;
  const crewInfo = activitySummary.activity_info.crew;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
        <Header showLogo rightElement={<ProfileSettingsSheet />} />

        <div className="px-5 pt-5 flex flex-col gap-5">
          <ProfileCard
            profile={profile}
            isInlineEditing={isInlineEditing}
            inlineDraft={inlineDraft}
            isSaving={isSaving || isUploadingAvatar}
            errorMessage={saveErrorMessage}
            onInlineDraftChange={setInlineDraft}
            onProfileImageUpload={handleProfileImageUpload}
            onInlineEdit={openInlineEditor}
            onInlineCancel={handleInlineCancel}
            onInlineSave={handleInlineSave}
          />
          <StatsGrid stats={profile.stats} />
          <ProfileMenuSections
            activeCrewCount={crewInfo.active_crew_count}
            completedCrewCount={crewInfo.completed_crew_count}
            totalVerificationCount={activitySummary.activity_info.total_verification_count}
            unreadNotificationCount={profile.unreadNotificationCount}
            showHostSection={profile.isHostEver}
            hostOperationPendingCount={profile.hostOperationPendingCount}
          />
        </div>

        {feedbackToast && (
          <ProfileUploadToast
            isOpen={feedbackToast.isOpen}
            onClose={closeFeedbackToast}
            tone={feedbackToast.tone}
            message={feedbackToast.message}
          />
        )}
      </div>
    </main>
  );
}
