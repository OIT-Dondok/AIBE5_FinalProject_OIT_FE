import { CircleDollarSign } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";

import { ProfileSettingsButton } from "@/components/domain/profile/ProfileSettingsButton";

export function ProfileEmpty() {
  return (
    <main className="min-h-screen flex justify-center">
      <div className="w-full max-w-[430px] pb-8">
        <Header title="프로필" showBackButton rightElement={<ProfileSettingsButton />} />
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
