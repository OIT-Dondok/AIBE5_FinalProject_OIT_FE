"use client";

import { useCallback, useState } from "react";

export function useChargeBottomSheet() {
  const [isChargeSheetOpen, setIsChargeSheetOpen] = useState(false);
  const [chargeInitialAmount, setChargeInitialAmount] = useState<number | undefined>(undefined);

  const openChargeBottomSheet = useCallback((amount?: number) => {
    setChargeInitialAmount(amount);
    setIsChargeSheetOpen(true);
  }, []);

  const closeChargeBottomSheet = useCallback(() => {
    setIsChargeSheetOpen(false);
  }, []);

  return {
    chargeInitialAmount,
    closeChargeBottomSheet,
    isChargeSheetOpen,
    openChargeBottomSheet,
  };
}
