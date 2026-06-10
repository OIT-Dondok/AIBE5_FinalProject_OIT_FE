"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Header } from "@/components/common/Header";
import { ChargeBottomSheet } from "@/components/domain/point/ChargeBottomSheet";
import {
  WalletHistorySection,
  type HistoryFilter,
} from "@/components/domain/point/WalletHistorySection";
import { WalletSummaryCard } from "@/components/domain/point/WalletSummaryCard";
import {
  createWalletViewModel,
  getWalletHistoryTypeParam,
} from "@/components/domain/point/pointViewModel";
import { useChargeBottomSheet } from "@/components/domain/point/useChargeBottomSheet";
import { getPointAccount, getWalletHistory } from "@/services/point";
import type { PointAccountResponse, WalletHistoryItem } from "@/types/domain";

const RECENT_HISTORY_LIMIT = 5;

export default function DodinWalletPage() {
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("ALL");
  const [account, setAccount] = useState<PointAccountResponse | null>(null);
  const [historyItems, setHistoryItems] = useState<WalletHistoryItem[]>([]);
  const [isAccountLoading, setIsAccountLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [accountError, setAccountError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const accountRequestIdRef = useRef(0);
  const historyRequestIdRef = useRef(0);
  const {
    chargeInitialAmount,
    closeChargeBottomSheet,
    isChargeSheetOpen,
    openChargeBottomSheet,
  } = useChargeBottomSheet();

  const fetchAccount = useCallback(async () => {
    const requestId = accountRequestIdRef.current + 1;
    accountRequestIdRef.current = requestId;
    setIsAccountLoading(true);
    setAccountError("");

    try {
      const { data } = await getPointAccount();
      if (accountRequestIdRef.current !== requestId) return;
      setAccount(data);
    } catch {
      if (accountRequestIdRef.current !== requestId) return;
      setAccountError("도딘 잔액을 불러오지 못했어요.");
    } finally {
      if (accountRequestIdRef.current === requestId) {
        setIsAccountLoading(false);
      }
    }
  }, []);

  const fetchRecentHistory = useCallback(async (filter: HistoryFilter) => {
    const requestId = historyRequestIdRef.current + 1;
    historyRequestIdRef.current = requestId;
    setIsHistoryLoading(true);
    setHistoryError("");

    try {
      const { data } = await getWalletHistory({
        limit: RECENT_HISTORY_LIMIT,
        type: getWalletHistoryTypeParam(filter),
      });
      if (historyRequestIdRef.current !== requestId) return;
      setHistoryItems(data.items);
    } catch {
      if (historyRequestIdRef.current !== requestId) return;
      setHistoryError("도딘 내역을 불러오지 못했어요.");
    } finally {
      if (historyRequestIdRef.current === requestId) {
        setIsHistoryLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchAccount();
    });
  }, [fetchAccount]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchRecentHistory(activeFilter);
    });
  }, [activeFilter, fetchRecentHistory]);

  const wallet = useMemo(
    () => (account ? createWalletViewModel(account, historyItems) : null),
    [account, historyItems],
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent">
      <div className="mx-auto flex w-full max-w-[430px] flex-col pb-10">
        <Header title="도딘 지갑" showBackButton />

        <div className="px-5 pt-5">
          {wallet ? (
            <WalletSummaryCard wallet={wallet} onOpenCharge={() => openChargeBottomSheet()} />
          ) : (
            <section className="rounded-[28px] bg-card px-5 py-8 text-center shadow-card">
              <p className="text-sm font-extrabold text-text-primary">
                {isAccountLoading ? "도딘 잔액을 불러오는 중..." : accountError}
              </p>
              {accountError && (
                <button
                  type="button"
                  onClick={fetchAccount}
                  className="mt-3 rounded-full bg-primary-blue px-4 py-2 text-xs font-extrabold text-white"
                >
                  다시 불러오기
                </button>
              )}
            </section>
          )}

          <WalletHistorySection
            activeFilter={activeFilter}
            errorMessage={historyError}
            historyItems={wallet?.historyItems ?? []}
            isLoading={isHistoryLoading}
            onFilterChange={setActiveFilter}
            onRetry={() => fetchRecentHistory(activeFilter)}
            updatedAtLabel={wallet?.updatedAtLabel ?? "최근 내역"}
          />
        </div>
      </div>

      <ChargeBottomSheet
        isOpen={isChargeSheetOpen}
        onClose={closeChargeBottomSheet}
        initialAmount={chargeInitialAmount}
        currentBalance={account?.available_balance}
      />
    </main>
  );
}
