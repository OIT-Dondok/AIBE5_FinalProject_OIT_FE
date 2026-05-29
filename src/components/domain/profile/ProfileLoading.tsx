import { Header } from "@/components/common/Header";
import { Skeleton } from "@/components/common/Skeleton";

import { ProfileSettingsButton } from "@/components/domain/profile/ProfileSettingsButton";

export function ProfileLoading() {
  return (
    <main className="min-h-screen flex justify-center">
      <div className="w-full max-w-[430px] pb-8">
        <Header title="프로필" showBackButton rightElement={<ProfileSettingsButton />} />
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
