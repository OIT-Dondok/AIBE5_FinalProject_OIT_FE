"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { Header } from "@/components/common/Header";
import { mockDashboard } from "@/mocks/data/dashboard";
import type { DashboardSectionId } from "@/mocks/data/dashboard";

import { CrewDonutSection } from "./CrewDonutSection";
import { DailyDashboardSection } from "./DailyDashboardSection";
import { PrinciplesModal } from "./PrinciplesModal";

export function DashboardPageClient() {
  const [activeSection, setActiveSection] =
    useState<DashboardSectionId>("donuts");
  const [isPrinciplesModalOpen, setIsPrinciplesModalOpen] = useState(false);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
        <Header
          title="대시보드"
          showBackButton
          rightElement={<RefreshButton />}
        />

        <div className="px-5 pt-5 flex flex-col gap-4">
          {activeSection === "daily" && (
            <DailyDashboardSection
              daily={mockDashboard.daily}
              principles={mockDashboard.principles}
              projectionCopy={mockDashboard.projectionCopy}
            />
          )}
          {activeSection === "donuts" && (
            <CrewDonutSection
              crewDonuts={mockDashboard.crewDonuts}
              projectionCopy={mockDashboard.projectionCopy}
              onOpenDaily={() => setActiveSection("daily")}
              onOpenPrinciples={() => setIsPrinciplesModalOpen(true)}
            />
          )}
        </div>
      </div>

      {isPrinciplesModalOpen && (
        <PrinciplesModal
          principles={mockDashboard.principles}
          onClose={() => setIsPrinciplesModalOpen(false)}
        />
      )}
    </main>
  );
}

function RefreshButton() {
  return (
    <button
      type="button"
      aria-label="대시보드 새로고침"
      className="p-1 -mr-1 rounded-full text-text-secondary hover:text-text-primary"
    >
      <RefreshCw size={21} />
    </button>
  );
}
