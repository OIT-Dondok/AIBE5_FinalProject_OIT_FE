import { CircleDollarSign } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { ProfileSettingsButton } from "@/components/domain/profile/ProfileSettingsButton";

interface ProfileEmptyProps {
  message?: string;
}

export function ProfileEmpty({ message }: ProfileEmptyProps) {
  return (
    <main className="min-h-screen flex justify-center">
      <div className="w-full max-w-[430px] pb-8">
        <Header title="프로필" showBackButton rightElement={<ProfileSettingsButton />} />
        <div className="px-5 pt-12">
          <section className="bg-card rounded-card shadow-sm border border-white/70">
            <EmptyState
              icon={<CircleDollarSign className="mx-auto text-primary-green" size={48} />}
              title="프로필 정보를 표시할 수 없습니다"
              description={message ?? "잠시 후 다시 시도해 주세요."}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
