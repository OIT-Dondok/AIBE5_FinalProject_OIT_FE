"use client";

import { useMemo, useState } from "react";

import { Header } from "@/components/common/Header";
import { ChargeBottomSheet } from "@/components/domain/point/ChargeBottomSheet";
import {
  WalletHistorySection,
  type HistoryFilter,
} from "@/components/domain/point/WalletHistorySection";
import { WalletSummaryCard } from "@/components/domain/point/WalletSummaryCard";
import { createWalletViewModel } from "@/components/domain/point/pointViewModel";
import { useChargeBottomSheet } from "@/components/domain/point/useChargeBottomSheet";
import { mockPointAccount, mockPointHistory } from "@/mocks/data/points";

export default function DodinWalletPage() {
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("ALL");
  const {
    chargeInitialAmount,
    closeChargeBottomSheet,
    isChargeSheetOpen,
    openChargeBottomSheet,
  } = useChargeBottomSheet();

  const wallet = useMemo(
    () => createWalletViewModel(mockPointAccount, mockPointHistory.items),
    [],
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent">
      <div className="mx-auto flex w-full max-w-[430px] flex-col pb-10">
        <Header title="도딘 지갑" showBackButton />

        <div className="px-5 pt-5">
          <WalletSummaryCard wallet={wallet} onOpenCharge={() => openChargeBottomSheet()} />
          <WalletHistorySection
            activeFilter={activeFilter}
            historyItems={wallet.historyItems}
            onFilterChange={setActiveFilter}
            updatedAtLabel={wallet.updatedAtLabel}
          />
        </div>
      </div>

      <ChargeBottomSheet
        isOpen={isChargeSheetOpen}
        onClose={closeChargeBottomSheet}
        initialAmount={chargeInitialAmount}
        currentBalance={mockPointAccount.available_balance}
      />
    </main>
  );
}
