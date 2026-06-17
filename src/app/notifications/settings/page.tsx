"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { NotificationSettingsPanel } from "@/components/domain/notification/NotificationSettingsModal";

export default function NotificationSettingsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-background flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
        <Header title="알림 설정" showBackButton />
        <NotificationSettingsPanel showHeading onSave={() => router.push('/notifications')} />
      </div>
    </main>
  );
}
