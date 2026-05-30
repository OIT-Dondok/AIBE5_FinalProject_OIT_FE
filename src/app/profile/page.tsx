"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { Header } from "@/components/common/Header";

import { ProfileCard, createProfileFormState, normalizeInitials } from "@/components/domain/profile/ProfileCard";
import { ProfileEmpty } from "@/components/domain/profile/ProfileEmpty";
import { ProfileLoading } from "@/components/domain/profile/ProfileLoading";
import { ProfileSettingsButton } from "@/components/domain/profile/ProfileSettingsButton";
import { StatsGrid } from "@/components/domain/profile/StatsGrid";

import { mockCrewProfile } from "@/mocks/data/profile";
import type { CrewProfileFormState, CrewProfileMock } from "@/mocks/data/profile";

const isLoading = false; // TODO: 실제 API 연동 시 로딩 상태로 교체

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
        <Header showLogo rightElement={<ProfileSettingsButton />} />

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
